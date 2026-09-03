"use client";

import { useCallback, useEffect, useState } from "react";
import { Users, UserPlus, Search, Mail, Phone, Trash2, MoreHorizontal, X } from "lucide-react";
import TopNav from "@/components/TopNav";
import SideNav from "@/components/SideNav";
import BottomNav from "@/components/BottomNav";
import TileLoader from "@/components/TileLoader";
import SuccessProgress from "@/components/SuccessProgress";
import ConfirmationModal from "@/components/ConfirmationModal";

type Account = {
  id: string;
  firstname: string;
  middlename: string;
  lastname: string;
  fullName: string;
  role: "admin" | "staff";
  contactNo: string;
  email: string | null;
  status: "pending" | "active" | "suspended";
  is_active: boolean;
  created: string;
  createdTime: string;
};

const roleStyles: Record<Account["role"], string> = {
  admin: "bg-[var(--butter-30)] text-[var(--text)]",
  staff: "bg-[var(--tint10)] text-[var(--text)]",
};

const statusStyles: Record<Account["status"], string> = {
  active: "bg-[var(--butter-20)] text-[var(--text)]",
  pending: "bg-[var(--tint10)] text-[var(--muted)]",
  suspended: "bg-red-500/10 text-red-500",
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const emptyForm = {
  firstname: "",
  middlename: "",
  lastname: "",
  email: "",
  contactNo: "",
  role: "staff" as "admin" | "staff",
};

const normalizeAccount = (raw: any): Account => {
  const createdAt = raw.created_at ?? raw.created ?? new Date().toISOString();
  const date = new Date(createdAt);
  const created = Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const createdTime = Number.isNaN(date.getTime()) ? "—" : date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const firstname = raw.firstname ?? "";
  const middlename = raw.middlename ?? "";
  const lastname = raw.lastname ?? "";
  const fullName = [firstname, middlename, lastname].filter(Boolean).join(" ") || "Unknown user";

  return {
    id: raw.id,
    firstname,
    middlename,
    lastname,
    fullName,
    role: raw.role === "admin" ? "admin" : "staff",
    contactNo: raw.contactNo ?? raw.contact_no ?? "",
    email: raw.email ?? null,
    status: raw.status === "active" || raw.status === "pending" || raw.status === "suspended" ? raw.status : "pending",
    is_active: Boolean(raw.is_active),
    created,
    createdTime,
  };
};

export default function AccountsPage() {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [inviteSent, setInviteSent] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState<string>("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"delete" | "logout" | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);

  const loadAccounts = useCallback(async () => {
    try {
      setLoadError(null);
      const { supabase } = await import("@/lib/supabaseClient");
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      const res = await fetch(`${API_URL}/accounts`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? json?.message ?? "Failed to load accounts");
      setAccounts(Array.isArray(json.accounts) ? json.accounts.map(normalizeAccount) : []);
    } catch (err) {
      setLoadError((err as Error).message);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  const filtered = accounts.filter((a) => {
    const haystack = `${a.firstname} ${a.middlename} ${a.lastname} ${a.email ?? ""} ${a.role}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  const openModal = () => {
    setForm(emptyForm);
    setErrors({});
    setInviteSent(null);
    setModalOpen(true);
  };

  const submit = async () => {
    const e: Record<string, string> = {};
    if (!form.firstname.trim()) e.firstname = "First name is required.";
    if (!form.lastname.trim()) e.lastname = "Last name is required.";
    if (!form.email.trim()) {
      e.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Valid email is required.";
    }

    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSaving(true);
    setSaveStatus("saving");
    setSaveMessage("Creating account and sending verification email...");
    try {
      const { supabase } = await import("@/lib/supabaseClient");
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      const res = await fetch(`${API_URL}/accounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          firstname: form.firstname.trim(),
          middlename: form.middlename.trim() || undefined,
          lastname: form.lastname.trim(),
          email: form.email.trim(),
          role: form.role,
          contactNo: form.contactNo.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? json?.message ?? "Failed to create account");

      const emailSent = Boolean(json?.verificationEmailSent);
      const createdEmail = form.email.trim();
      setInviteSent(createdEmail);
      setForm(emptyForm);
      setErrors({});
      setSaveStatus(emailSent ? "success" : "error");
      setSaveMessage(
        emailSent
          ? `Account created successfully. Verification email sent to ${createdEmail}.`
          : `Account created, but the email could not be sent to ${createdEmail}. Check the Brevo sender configuration.`,
      );
      setModalOpen(false);
      await loadAccounts();
    } catch (err) {
      setErrors({ _form: (err as Error).message });
      setSaveStatus("error");
      setSaveMessage((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const resendInvite = async (rawEmail: string | null) => {
    if (!rawEmail) return;
    const email = rawEmail;
    setSaveStatus("saving");
    setSaveMessage(`Re-sending verification email to ${email}...`);
    try {
      const { supabase } = await import("@/lib/supabaseClient");
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      const res = await fetch(`${API_URL}/accounts/resend-invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? json?.message ?? "Failed to resend invite");
      const sent = Boolean(json?.verificationEmailSent);
      setSaveStatus(sent ? "success" : "error");
      setSaveMessage(json?.message ?? (sent ? "Verification email re-sent." : "Could not send the email."));
    } catch (err) {
      setSaveStatus("error");
      setSaveMessage((err as Error).message);
    }
  };

  const toggleStatus = (id: string, next: "active" | "suspended") =>
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, status: next, is_active: next === "active" } : a)));

  const showDeleteConfirmation = (id: string) => {
    setConfirmingId(id);
    setConfirmAction("delete");
    setShowConfirmation(true);
  };

  const handleConfirmAction = async () => {
    if (confirmAction === "delete" && confirmingId) {
      setIsConfirmLoading(true);
      try {
        // TODO: Implement API call to delete account if needed
        // For now, just remove from local state
        setAccounts((prev) => prev.filter((a) => a.id !== confirmingId));
      } catch (err) {
        console.error("Failed to delete account:", err);
      } finally {
        setIsConfirmLoading(false);
        setShowConfirmation(false);
        setConfirmAction(null);
        setConfirmingId(null);
      }
    }
  };

  const inputCls = (bad?: string) =>
    `w-full rounded-xl border bg-[var(--background)] py-2.5 pl-10 pr-4 text-sm text-[var(--text)] placeholder-[var(--faint)] outline-none transition focus:border-[var(--prussian)] ${
      bad ? "border-red-400/70" : "border-[var(--line)]"
    }`;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--background)] text-[var(--text)]">
      <SideNav />
      <div className="relative flex-1 overflow-y-auto">
        <TopNav title="Account Management" subtitle="All registered user accounts" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-32 pt-5 sm:px-6 md:pb-10 md:pt-6 lg:px-10">
          {loading ? (
            <div className="rounded-3xl border border-[var(--tint10)] bg-[var(--surface)] p-6">
              <TileLoader label="Loading accounts" size="lg" />
            </div>
          ) : loadError ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-500">
              {loadError}. Try signing out and back in.
            </div>
          ) : (
            <>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--muted)]">
                  <Search className="h-4 w-4" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search name, email, role..."
                    className="w-48 bg-transparent text-sm text-[var(--text)] placeholder-[var(--faint)] outline-none sm:w-64"
                  />
                </div>
                <button
                  type="button"
                  onClick={openModal}
                  className="flex items-center gap-2 rounded-xl bg-[var(--prussian)] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--shadow)] transition hover:bg-[var(--prussian-soft)]"
                >
                  <UserPlus className="h-4 w-4 text-[var(--butter)]" /> Create Account
                </button>
              </div>

              {inviteSent && (
                <div className="mb-4 rounded-xl border border-[var(--butter-40)] bg-[var(--butter-10)] px-4 py-3 text-sm text-[var(--text)]">
                  A verification email was sent to <b>{inviteSent}</b>. The recipient must set a password within 5 minutes.
                </div>
              )}

              <div className="mb-4">
                <SuccessProgress
                  status={saveStatus}
                  title={
                    saveStatus === "saving"
                      ? "Creating account..."
                      : saveStatus === "success"
                        ? "Account created successfully"
                        : saveStatus === "error"
                          ? "Account creation failed"
                          : undefined
                  }
                  message={saveMessage}
                  autoDismissMs={saveStatus === "success" ? 6000 : 0}
                  onDismiss={() => setSaveStatus("idle")}
                />
              </div>

              <section className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                  { label: "Total Accounts", value: accounts.length, icon: Users },
                  { label: "Active", value: accounts.filter((a) => a.status === "active").length, icon: Users },
                  { label: "Pending", value: accounts.filter((a) => a.status === "pending").length, icon: Users },
                  { label: "Admins", value: accounts.filter((a) => a.role === "admin").length, icon: Users },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-2xl border border-[var(--tint10)] bg-[var(--surface)] p-5 shadow-sm">
                    <p className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-[var(--muted)]">
                      <Icon className="h-3.5 w-3.5 text-[var(--text)]" /> {label}
                    </p>
                    <p className="mt-1 text-3xl font-bold">{value}</p>
                  </div>
                ))}
              </section>

              <section className="overflow-hidden rounded-3xl border border-[var(--tint10)] bg-[var(--surface)] shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[840px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-[var(--line)] text-xs uppercase tracking-widest text-[var(--muted)]">
                        <th className="px-5 py-4 font-semibold">Full Name</th>
                        <th className="px-5 py-4 font-semibold">Role</th>
                        <th className="px-5 py-4 font-semibold">Contact No</th>
                        <th className="px-5 py-4 font-semibold">Email</th>
                        <th className="px-5 py-4 font-semibold">Created</th>
                        <th className="px-5 py-4 font-semibold">Status</th>
                        <th className="px-5 py-4 font-semibold">Active</th>
                        <th className="px-5 py-4 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((a) => (
                        <tr key={a.id} className="border-b border-[var(--line)] transition last:border-0 hover:bg-[var(--tint5)]">
                          <td className="px-5 py-4 font-medium">{a.fullName}</td>
                          <td className="px-5 py-4">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${roleStyles[a.role]}`}>{a.role}</span>
                          </td>
                          <td className="px-5 py-4 text-[var(--muted)]">{a.contactNo || "—"}</td>
                          <td className="px-5 py-4 text-[var(--muted)]">{a.email ?? "—"}</td>
                          <td className="px-5 py-4 text-[var(--muted)]">
                            <span className="block text-xs">{a.createdTime}</span>
                            <span className="block text-xs">{a.created}</span>
                          </td>
                          <td className="px-5 py-4">
                            <select
                              value={a.status}
                              onChange={(e) => toggleStatus(a.id, e.target.value as "active" | "suspended")}
                              className={`w-full cursor-pointer appearance-none rounded-full border border-[var(--line)] bg-[var(--background)] px-2.5 py-1 text-xs font-semibold outline-none ${statusStyles[a.status]}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="active">Active</option>
                              <option value="suspended">Suspended</option>
                            </select>
                          </td>
                          <td className="px-5 py-4">
                            <input
                              type="checkbox"
                              checked={a.is_active}
                              onChange={(e) =>
                                setAccounts((prev) =>
                                  prev.map((x) =>
                                    x.id === a.id ? { ...x, is_active: e.target.checked, status: e.target.checked ? "active" : x.status } : x,
                                  ),
                                )
                              }
                              className="h-4 w-4 cursor-pointer rounded border-[var(--line)] bg-[var(--prussian)] text-[var(--prussian)] focus:ring-[var(--butter)]"
                            />
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-1.5">
                              {a.status === "pending" && (
                                <button
                                  type="button"
                                  title="Resend verification email"
                                  onClick={() => resendInvite(a.email)}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--butter-20)] hover:text-[var(--prussian)]"
                                >
                                  <Mail className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                type="button"
                                title="Delete"
                                onClick={() => showDeleteConfirmation(a.id)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-red-500/10 hover:text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                              <MoreHorizontal className="h-4 w-4 text-[var(--faint)]" />
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filtered.length === 0 && (
                        <tr>
                          <td colSpan={10} className="px-5 py-10 text-center text-sm text-[var(--muted)]">
                            No accounts match your search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {modalOpen && (
                <>
                  <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-xl rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-2xl shadow-[var(--shadow)]">
                      <div className="mb-5 flex items-start justify-between">
                        <div>
                          <h2 className="text-lg font-bold">Create New Account</h2>
                          <p className="mt-0.5 text-xs text-[var(--muted)]">
                            Fill in the information for the new user. An invitation email will be sent.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setModalOpen(false)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--tint10)] hover:text-[var(--text)]"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold">First Name</label>
                          <div className="relative">
                            <Users className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--faint)]" />
                            <input
                              value={form.firstname}
                              onChange={(e) => setForm({ ...form, firstname: e.target.value })}
                              placeholder="Juan"
                              className={inputCls(errors.firstname)}
                            />
                          </div>
                          {errors.firstname && <p className="mt-1 text-xs text-red-500">{errors.firstname}</p>}
                        </div>

                        <div>
                          <label className="mb-1.5 block text-xs font-semibold">Middle Name</label>
                          <div className="relative">
                            <Users className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--faint)]" />
                            <input
                              value={form.middlename}
                              onChange={(e) => setForm({ ...form, middlename: e.target.value })}
                              placeholder="(optional)"
                              className={inputCls()}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="mb-1.5 block text-xs font-semibold">Last Name</label>
                          <div className="relative">
                            <Users className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--faint)]" />
                            <input
                              value={form.lastname}
                              onChange={(e) => setForm({ ...form, lastname: e.target.value })}
                              placeholder="Dela Cruz"
                              className={inputCls(errors.lastname)}
                            />
                          </div>
                          {errors.lastname && <p className="mt-1 text-xs text-red-500">{errors.lastname}</p>}
                        </div>

                        <div className="sm:col-span-2">
                          <label className="mb-1.5 block text-xs font-semibold">Email</label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--faint)]" />
                            <input
                              type="email"
                              value={form.email}
                              onChange={(e) => setForm({ ...form, email: e.target.value })}
                              placeholder="user@bawatpieza.com"
                              className={inputCls(errors.email)}
                            />
                          </div>
                          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                        </div>

                        <div className="sm:col-span-2">
                          <label className="mb-1.5 block text-xs font-semibold">Contact No</label>
                          <div className="relative">
                            <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--faint)]" />
                            <input
                              value={form.contactNo}
                              onChange={(e) => setForm({ ...form, contactNo: e.target.value })}
                              placeholder="+63 9XX XXX XXXX"
                              className={inputCls()}
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="mb-1.5 block text-xs font-semibold">Role</label>
                          <div className="grid grid-cols-2 gap-2">
                            {(["admin", "staff"] as const).map((r) => (
                              <button
                                key={r}
                                type="button"
                                onClick={() => setForm({ ...form, role: r })}
                                className={`rounded-xl border py-2.5 text-xs font-semibold transition ${
                                  form.role === r
                                    ? "border-[var(--prussian)] bg-[var(--prussian)] text-white"
                                    : "border-[var(--line)] text-[var(--muted)] hover:bg-[var(--tint5)]"
                                }`}
                              >
                                {r === "admin" ? "Admin" : "Staff"}
                              </button>
                            ))}
                          </div>
                        </div>

                        <p className="sm:col-span-2 rounded-xl bg-[var(--tint5)] px-4 py-3 text-xs text-[var(--muted)]">
                          No password is set here. A verification email with a secure link will be sent — the user sets their own password and has 5 minutes to do so.
                        </p>
                      </div>

                      <div className="mt-6 flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setModalOpen(false)}
                          className="rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm font-medium text-[var(--text)] transition hover:bg-[var(--tint5)]"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={submit}
                          disabled={saving}
                          className="rounded-xl bg-[var(--prussian)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--prussian-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {saving ? "Sending..." : "Create Account"}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {errors._form && (
                <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
                  {errors._form}
                </div>
              )}
            </>
          )}
        </div>
        <BottomNav />

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={showConfirmation}
          title={confirmAction === "delete" ? "Delete Account?" : "Confirm Action"}
          message={
            confirmAction === "delete"
              ? "This action cannot be undone. The account will be permanently removed from the system."
              : "Are you sure you want to proceed?"
          }
          confirmText={confirmAction === "delete" ? "Delete" : "Confirm"}
          cancelText="Cancel"
          isDestructive={confirmAction === "delete"}
          isLoading={isConfirmLoading}
          onConfirm={handleConfirmAction}
          onCancel={() => {
            setShowConfirmation(false);
            setConfirmAction(null);
            setConfirmingId(null);
          }}
        />
      </div>
    </div>
  );
}
