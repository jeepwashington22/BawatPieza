import { Router } from 'express';
import { randomBytes } from 'crypto';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { sendMail } from '../lib/mailer.js';
import { redis } from '../lib/redis.js';
import { createHttpError } from '../middleware/errorHandler.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

const INVITE_TTL_SECONDS = 300; // 5 minutes

const createAccountSchema = z.object({
  firstname: z.string().min(1),
  middlename: z.string().optional().default(''),
  lastname: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['admin', 'staff']),
  contactNo: z.string().optional().default(''),
});

const setPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8),
});

/**
 * Sends the "set your password" invite email. Shared by POST / (create) and
 * POST /resend-invite. Returns true on success, false (logged) on failure so
 * the API can report `verificationEmailSent` without failing the request.
 */
async function sendInviteEmail(opts: {
  email: string;
  fullName: string;
  role: string;
  token: string;
}): Promise<boolean> {
  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
  const link = `${frontendUrl}/set-password?token=${opts.token}`;
  try {
    await sendMail({
      to: opts.email,
      subject: 'Set your BawatPieza password (valid for 5 minutes)',
      text: `Hi ${opts.fullName},\n\nAn admin created a ${opts.role.toUpperCase()} account for you.\nSet your password within 5 minutes: ${link}\n\nIf you did not expect this, ignore this email.`,
      html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto">
        <h2 style="color:#0a2a4a">Welcome to BawatPieza</h2>
        <p>Hi <b>${opts.fullName}</b>, an admin created a <b>${opts.role.toUpperCase()}</b> account for you.</p>
        <p>Click below to set your password. <b>This link expires in 5 minutes.</b></p>
        <p><a href="${link}" style="background:#0a2a4a;color:#fff;padding:12px 22px;border-radius:10px;text-decoration:none">Set my password</a></p>
        <p style="color:#666;font-size:12px">If the button does not work, paste this link: ${link}</p>
      </div>`,
    });
    console.log(`[accounts] Verification email sent to ${opts.email}`);
    return true;
  } catch (mailErr) {
    console.error('[accounts] verification email failed:', (mailErr as Error).message);
    return false;
  }
}

/**
 * POST /accounts
 * Admin-only. Creates a pending account (no password) and emails a
 * verification link that expires in 5 minutes. Only the recipient
 * can set their password through that emailed link.
 */
router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const parsed = createAccountSchema.safeParse(req.body);
    if (!parsed.success) {
      throw createHttpError(400, 'Invalid payload.', parsed.error.flatten());
    }
    const { firstname, middlename, lastname, email, role, contactNo } = parsed.data;
    const fullName = [firstname, middlename, lastname].filter(Boolean).join(' ');

    // Check if user already exists by email
    const { data: existing } = await supabase.auth.admin.listUsers();
    const userExists = existing?.users?.some(u => u.email?.toLowerCase() === email.toLowerCase());
    
    if (userExists) {
      throw createHttpError(409, `An account with email ${email} already exists. Please use a different email.`);
    }

    // Create the user WITHOUT a password - they set it via the emailed link.
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email,
      email_confirm: false,
      user_metadata: {
        full_name: fullName,
        firstname,
        middlename,
        lastname,
        role,
        contactNo,
      },
    });
    if (createErr) {
      console.error('[accounts] Auth create error:', createErr.message);
      throw createHttpError(409, `Failed to create auth user: ${createErr.message}`);
    }

    // Mirror the account into the user_accounts table (the DB trigger also
    // does this on auth.users insert; upsert keeps it idempotent).
    const { error: tableErr } = await supabase.from('user_accounts').upsert(
      {
        id: created.user?.id,
        firstname,
        middlename: middlename || null,
        lastname,
        role,
        contactNo: contactNo || null,
        email,
        status: 'pending',
        is_active: false,
      },
      { onConflict: 'id' },
    );
    if (tableErr) {
      throw createHttpError(500, `Account created in auth but table sync failed: ${tableErr.message}`);
    }

    // One-time invite token with a strict 5-minute life in Redis.
    const token = randomBytes(32).toString('hex');
    await redis.set(`invite:${token}`, JSON.stringify({ email, fullName, role, userId: created.user?.id }), 'EX', INVITE_TTL_SECONDS);

    const emailSent = await sendInviteEmail({ email, fullName, role, token });

    res.status(201).json({
      ok: true,
      userId: created.user?.id,
      email,
      role,
      verificationEmailSent: emailSent,
      message: emailSent
        ? `Account created. A verification email was sent to ${email}. It expires in 5 minutes.`
        : `Account created, but the verification email could not be sent to ${email}. Check the Brevo sender configuration and try again.`,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /accounts/set-password
 * Public. Consumes the emailed token (must still exist in Redis => within
 * 5 minutes) and sets the user's password. Only the recipient of the email
 * can do this, because only they hold the token.
 */
router.post('/set-password', async (req, res, next) => {
  try {
    const parsed = setPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      throw createHttpError(400, 'Token and a password of at least 8 characters are required.');
    }
    const { token, password } = parsed.data;

    const key = `invite:${token}`;
    const raw = await redis.get(key);
    if (!raw) {
      throw createHttpError(410, 'This link has expired or was already used. Ask an admin to resend.');
    }
    const { email, fullName, role, userId } = JSON.parse(raw) as { email: string; fullName: string; role: string; userId?: string };

    // Consume the token immediately (one-time use).
    await redis.del(key);

    const { error: updateErr } = await supabase.auth.admin.updateUserById(userId as string, {
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role },
    });
    if (updateErr) {
      throw createHttpError(500, updateErr.message);
    }

    // Activate the row in user_accounts.
    const { error: tableErr } = await supabase
      .from('user_accounts')
      .update({ status: 'active', is_active: true })
      .eq('id', userId as string);
    if (tableErr) {
      throw createHttpError(500, `Password set but table sync failed: ${tableErr.message}`);
    }

    res.json({ ok: true, message: 'Password set. You can now sign in.' });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /accounts/resend-invite
 * Admin-only. Re-issues a fresh 5-minute invite token for a pending account
 * and re-sends the verification email. Use when the original email failed,
 * landed in spam, or the 5-minute window expired before the password was set.
 */
const resendSchema = z.object({ email: z.string().email() });

router.post('/resend-invite', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const parsed = resendSchema.safeParse(req.body);
    if (!parsed.success) {
      throw createHttpError(400, 'A valid email is required.');
    }
    const { email } = parsed.data;

    // Look up the pending account row.
    const { data: row, error: rowErr } = await supabase
      .from('user_accounts')
      .select('id, firstname, lastname, role, status, email')
      .eq('email', email)
      .maybeSingle();
    if (rowErr) throw createHttpError(500, rowErr.message);
    if (!row) throw createHttpError(404, `No account found for ${email}.`);
    if (row.status === 'active') {
      throw createHttpError(409, `${email} is already active. No invite needed.`);
    }

    const fullName = [row.firstname, row.lastname].filter(Boolean).join(' ') || email;

    // Fresh one-time token (invalidates nothing — old tokens simply expire).
    const token = randomBytes(32).toString('hex');
    await redis.set(
      `invite:${token}`,
      JSON.stringify({ email, fullName, role: row.role, userId: row.id }),
      'EX',
      INVITE_TTL_SECONDS,
    );

    const emailSent = await sendInviteEmail({ email, fullName, role: row.role, token });

    res.json({
      ok: true,
      email,
      verificationEmailSent: emailSent,
      message: emailSent
        ? `A new verification email was sent to ${email}. It expires in ${INVITE_TTL_SECONDS / 60} minutes.`
        : `Could not send the verification email to ${email}. Check the Brevo configuration and backend logs.`,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /accounts
 * Admin-only. Lists accounts from the user_accounts table (synced with auth.users).
 */
router.get('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { data, error } = await supabase
            .from('user_accounts')
      .select('id, firstname, middlename, lastname, role, contactNo, email, status, is_active, created_at')
      .order('created_at', { ascending: false });
    if (error) throw createHttpError(500, error.message);

    res.json({
      ok: true,
      accounts: (data ?? []).map((a) => ({
        id: a.id,
        firstname: a.firstname,
        middlename: a.middlename ?? '',
        lastname: a.lastname,
        name: [a.firstname, a.lastname].filter(Boolean).join(' '),
        role: a.role,
        contactNo: a.contactNo ?? '',
        email: a.email,
        status: a.status,
        is_active: a.is_active,
        created_at: a.created_at,
        created: a.created_at,
        createdTime: new Date(a.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      })),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
