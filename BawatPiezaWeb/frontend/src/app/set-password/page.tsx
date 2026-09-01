"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Zap, CheckCircle2, AlertTriangle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function SetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setError(null);
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");

    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) return setError("Missing invite token. Ask an admin to resend the email.");

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/accounts/set-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to set password.");
      setDone(true);
      setTimeout(() => router.push("/"), 2500);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = (bad?: boolean) =>
    `w-full rounded-xl border bg-[var(--background)] py-3 pl-11 pr-4 text-sm text-[var(--text)] placeholder-[var(--faint)] outline-none transition focus:border-[var(--prussian)] ${
      bad ? "border-red-400/70" : "border-[var(--line)]"
    }`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 text-[var(--text)]">
      <div className="w-full max-w-md rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-8 shadow-2xl shadow-[var(--shadow)]">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--prussian)] to-[var(--prussian-soft)]">
            <Zap className="h-5 w-5 text-[var(--butter)]" />
          </span>
          <div>
            <h1 className="text-lg font-bold leading-tight">BawatPieza</h1>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--faint)]">Set your password</p>
          </div>
        </div>

        {done ? (
          <div className="space-y-3 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-[var(--butter)]" />
            <p className="font-semibold">Password set successfully!</p>
            <p className="text-sm text-[var(--muted)]">Redirecting you to the sign-in page…</p>
          </div>
        ) : (
          <>
            <p className="mb-5 text-sm text-[var(--muted)]">
              An admin created an account for you. Choose a password to activate it.
            </p>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold">New Password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--faint)]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className={inputCls(password.length > 0 && password.length < 8)}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold">Confirm Password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--faint)]" />
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Re-enter password"
                    className={inputCls(confirm.length > 0 && confirm !== password)}
                  />
                </div>
              </div>
              {error && (
                <p className="flex items-center gap-2 rounded-xl bg-red-500/10 px-3 py-2 text-xs text-red-500">
                  <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
                </p>
              )}
              <button
                type="button"
                onClick={submit}
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--prussian)] py-3 text-sm font-semibold text-white transition hover:bg-[var(--prussian-soft)] disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Setting password…
                  </>
                ) : (
                  "Set Password"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
