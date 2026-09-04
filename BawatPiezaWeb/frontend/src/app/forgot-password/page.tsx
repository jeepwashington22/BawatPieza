"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, KeyRound, Loader2, Mail, ShieldCheck } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Step = "email" | "otp" | "reset" | "done";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const requestOtp = async () => {
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`${API_URL}/accounts/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? json?.message ?? "Failed to send code");
      setInfo(json?.message ?? "Verification code sent.");
      setStep("otp");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async () => {
    setError(null);
    if (!/^\d{6}$/.test(otp.trim())) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`${API_URL}/accounts/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? json?.message ?? "Invalid code");
      setResetToken(json.resetToken);
      setInfo("Code verified. Choose a new password.");
      setStep("reset");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const resetPassword = async () => {
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`${API_URL}/accounts/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? json?.message ?? "Failed to reset password");
      setInfo("Password updated. You can now sign in.");
      setStep("done");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 text-[var(--text)]">
      <div className="w-full max-w-md rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-8" style={{ boxShadow: "var(--card-shadow)" }}>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-[var(--muted)] transition hover:text-[var(--text)]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </button>

        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--prussian)] text-white">
            <KeyRound className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Forgot password</h1>
            <p className="text-xs text-[var(--muted)]">
              {step === "email" && "We'll email you a 6-digit verification code."}
              {step === "otp" && `Enter the code sent to ${email}.`}
              {step === "reset" && "Choose a new password for your account."}
              {step === "done" && "All set."}
            </p>
          </div>
        </div>

        {info && (
          <div className="mb-4 rounded-xl border border-[var(--line)] bg-[var(--tint5)] px-4 py-3 text-xs font-medium text-[var(--muted)]">
            {info}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-500">
            {error}
          </div>
        )}

        {step === "email" && (
          <div>
            <label htmlFor="fp-email" className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">
              Email
            </label>
            <div className="relative mb-5">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text)]/40" />
              <input
                id="fp-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !busy && requestOtp()}
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--background)] py-3 pl-10 pr-4 text-sm outline-none focus:border-[var(--butter)]"
              />
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={requestOtp}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--prussian)] py-3.5 text-sm font-bold text-white transition hover:bg-[var(--prussian-soft)] disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              Send verification code
            </button>
          </div>
        )}

        {step === "otp" && (
          <div>
            <label htmlFor="fp-otp" className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">
              6-digit code <span className="font-normal">(expires in 5 minutes)</span>
            </label>
            <div className="relative mb-5">
              <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text)]/40" />
              <input
                id="fp-otp"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && !busy && verifyOtp()}
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--background)] py-3 pl-10 pr-4 text-lg font-bold tracking-[0.5em] outline-none focus:border-[var(--butter)]"
              />
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={verifyOtp}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--prussian)] py-3.5 text-sm font-bold text-white transition hover:bg-[var(--prussian-soft)] disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              Verify code
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={requestOtp}
              className="mt-3 w-full rounded-xl border border-[var(--line-strong)] py-3 text-xs font-semibold text-[var(--muted)] transition hover:bg-[var(--background)] disabled:opacity-60"
            >
              Resend code
            </button>
          </div>
        )}

        {step === "reset" && (
          <div>
            <label htmlFor="fp-pass" className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">
              New password
            </label>
            <input
              id="fp-pass"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-3 w-full rounded-xl border border-[var(--line)] bg-[var(--background)] px-4 py-3 text-sm outline-none focus:border-[var(--butter)]"
            />
            <label htmlFor="fp-confirm" className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">
              Confirm new password
            </label>
            <input
              id="fp-confirm"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !busy && resetPassword()}
              className="mb-5 w-full rounded-xl border border-[var(--line)] bg-[var(--background)] px-4 py-3 text-sm outline-none focus:border-[var(--butter)]"
            />
            <button
              type="button"
              disabled={busy}
              onClick={resetPassword}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--prussian)] py-3.5 text-sm font-bold text-white transition hover:bg-[var(--prussian-soft)] disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
              Update password
            </button>
          </div>
        )}

        {step === "done" && (
          <div>
            <div className="mb-5 rounded-xl border border-[var(--line)] bg-[var(--tint5)] px-4 py-4 text-sm font-medium">
              Your password has been changed successfully.
            </div>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="w-full rounded-xl bg-[var(--prussian)] py-3.5 text-sm font-bold text-white transition hover:bg-[var(--prussian-soft)]"
            >
              Sign in now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
