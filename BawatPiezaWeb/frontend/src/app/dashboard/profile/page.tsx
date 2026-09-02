"use client";

import { useEffect, useState } from "react";
import { User, Mail, Phone, Shield, Calendar, Clock, Save, Pencil, CheckCircle, AlertCircle, Camera, KeyRound, Activity, Zap } from "lucide-react";
import TopNav from "@/components/TopNav";
import SideNav from "@/components/SideNav";
import BottomNav from "@/components/BottomNav";
import TileLoader from "@/components/TileLoader";
import { useUser } from "@/context/UserContext";
import { supabase } from "@/lib/supabaseClient";

export default function ProfilePage() {
  const { user, loading, refresh } = useUser();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ firstname: "", middlename: "", lastname: "", contactNo: "" });
  const [editing, setEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState("");

  // Sync form fields when user data loads
  useEffect(() => {
    if (user.firstname || user.lastname) {
      setForm({ firstname: user.firstname, middlename: user.middlename, lastname: user.lastname, contactNo: user.contactNo });
    }
  }, [user.firstname, user.lastname, user.middlename, user.contactNo]);

  const handleSave = async () => {
    setSaving(true); setSaveStatus("idle"); setSaveMessage("");
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) throw new Error("Not authenticated.");
      const { error: updErr } = await supabase.from("user_accounts").upsert({
        id: authData.user.id,
        firstname: form.firstname.trim(),
        middlename: form.middlename.trim() || null,
        lastname: form.lastname.trim(),
        contactNo: form.contactNo.trim() || null,
        email: user.email,
        role: user.role,
        status: user.status,
        is_active: user.is_active,
      }, { onConflict: "id" });
      if (updErr) throw new Error(updErr.message);
      const fullName = [form.firstname, form.middlename, form.lastname].filter(Boolean).join(" ");
      await supabase.auth.updateUser({ data: { full_name: fullName, firstname: form.firstname.trim(), middlename: form.middlename.trim(), lastname: form.lastname.trim(), contactNo: form.contactNo.trim() } });
      setEditing(false); setSaveStatus("success"); setSaveMessage("Profile updated successfully.");
      refresh();
    } catch (err) { setSaveStatus("error"); setSaveMessage((err as Error).message); } finally { setSaving(false); }
  };

  const cancelEdit = () => { setForm({ firstname: user.firstname, middlename: user.middlename, lastname: user.lastname, contactNo: user.contactNo }); setEditing(false); setSaveStatus("idle"); setSaveMessage(""); };

  const initials = [user.firstname, user.lastname].filter(Boolean).map((s) => s[0]?.toUpperCase()).join("") || "?";
  const fullName = [user.firstname, user.middlename, user.lastname].filter(Boolean).join(" ") || "Loading...";
  const memberSince = user.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—";

  if (loading) {
    return (
      <div className="flex h-screen">
        <SideNav />
        <div className="flex flex-1 flex-col">
          <TopNav title="My Profile" />
          <div className="flex flex-1 items-center justify-center"><TileLoader label="Loading profile" size="lg" /></div>
          <BottomNav />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--background)] text-[var(--text)]">
      <SideNav />
      <div className="relative flex flex-1 flex-col overflow-y-auto">
        <TopNav title="My Profile" subtitle={`${fullName} · ${user.role === "admin" ? "Administrator" : "Staff"}`} />
        <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6">
          {saveStatus !== "idle" && (
            <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${saveStatus === "success" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600" : "border-red-500/20 bg-red-500/10 text-red-500"}`}>
              {saveStatus === "success" ? <CheckCircle className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}{saveMessage}
            </div>
          )}
          <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-sm">
            <div className="h-28 bg-gradient-to-br from-[var(--prussian)] to-[var(--prussian-soft)]" />
            <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end sm:gap-6">
              <div className="-mt-12 relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-[var(--surface)] bg-gradient-to-br from-[var(--butter)] to-[#e0a820] text-3xl font-bold text-white shadow-lg">{initials}</div>
                <button type="button" className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] shadow-sm transition hover:text-[var(--text)]" title="Change avatar"><Camera className="h-4 w-4" /></button>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold tracking-tight text-[var(--text)]">{fullName}</h2>
                <p className="text-sm text-[var(--muted)]">{user.email}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${user.role === "admin" ? "bg-[var(--butter-30)] text-[var(--text)]" : "bg-[var(--tint10)] text-[var(--text)]"}`}><Shield className="h-3 w-3" />{user.role === "admin" ? "Administrator" : "Staff"}</span>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${user.status === "active" ? "bg-emerald-500/10 text-emerald-600" : user.status === "pending" ? "bg-[var(--butter-20)] text-[var(--text)]" : "bg-red-500/10 text-red-500"}`}><Activity className="h-3 w-3" />{user.status === "active" ? "Active" : user.status === "pending" ? "Pending" : "Suspended"}</span>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                {editing ? (<>
                  <button type="button" onClick={cancelEdit} className="rounded-xl border border-[var(--line)] px-4 py-2 text-sm font-medium text-[var(--text)] transition hover:bg-[var(--tint5)]">Cancel</button>
                  <button type="button" onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-xl bg-[var(--prussian)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--prussian-soft)] disabled:cursor-not-allowed disabled:opacity-60">{saving ? (<><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Saving...</>) : (<><Save className="h-4 w-4" />Save</>)}</button>
                </>) : (
                  <button type="button" onClick={() => setEditing(true)} className="flex items-center gap-2 rounded-xl bg-[var(--prussian)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--prussian-soft)]"><Pencil className="h-4 w-4" />Edit Profile</button>
                )}
              </div>
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6">
                <h3 className="mb-4 text-base font-semibold text-[var(--text)]">Personal Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldInput icon={User} label="First Name" value={form.firstname} onChange={(v) => setForm({ ...form, firstname: v })} disabled={!editing} />
                  <FieldInput icon={User} label="Middle Name" value={form.middlename} onChange={(v) => setForm({ ...form, middlename: v })} disabled={!editing} />
                  <FieldInput icon={User} label="Last Name" value={form.lastname} onChange={(v) => setForm({ ...form, lastname: v })} disabled={!editing} />
                  <div><label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Contact Number</label><div className="relative"><Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--faint)]" /><input type="tel" value={form.contactNo} onChange={(e) => setForm({ ...form, contactNo: e.target.value })} disabled={!editing} placeholder="+63 9XX XXX XXXX" className="w-full rounded-xl border border-[var(--line)] bg-[var(--background)] py-2.5 pl-10 pr-3 text-sm text-[var(--text)] transition placeholder-[var(--faint)] focus:border-[var(--prussian)] focus:outline-none focus:ring-2 focus:ring-[var(--prussian)]/20 disabled:opacity-60" /></div></div>
                </div>
              </div>
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6">
                <h3 className="mb-4 text-base font-semibold text-[var(--text)]">Security</h3>
                <button type="button" onClick={async () => { const { error } = await supabase.auth.resetPasswordForEmail(user.email, { redirectTo: `${window.location.origin}/set-password` }); if (error) { setSaveStatus("error"); setSaveMessage(error.message); } else { setSaveStatus("success"); setSaveMessage("Password reset email sent. Check your inbox."); } }} className="flex w-full items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--background)] px-4 py-3 text-left transition hover:bg-[var(--tint5)]"><div className="flex items-center gap-3"><KeyRound className="h-5 w-5 text-[var(--muted)]" /><div><p className="text-sm font-medium text-[var(--text)]">Change Password</p><p className="text-xs text-[var(--faint)]">Send a password reset link to your email</p></div></div><span className="text-xs font-medium text-[var(--prussian)]">Send link</span></button>
              </div>
            </div>
            <div className="space-y-6">
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6">
                <h3 className="mb-4 text-base font-semibold text-[var(--text)]">Account Details</h3>
                <div className="space-y-4">
                  <DetailRow icon={Mail} label="Email" value={user.email || "—"} />
                  <DetailRow icon={Shield} label="Role" value={user.role} />
                  <DetailRow icon={Activity} label="Status" value={user.status} />
                  <DetailRow icon={Calendar} label="Member Since" value={memberSince} />
                </div>
              </div>
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6">
                <h3 className="mb-4 text-base font-semibold text-[var(--text)]">Quick Stats</h3>
                <div className="space-y-3">
                  <StatRow icon={Zap} label="Energy Today" value="14.2 kWh" color="text-[var(--butter)]" />
                  <StatRow icon={Activity} label="Active Tiles" value="138 / 140" color="text-[var(--prussian-soft)]" />
                  <StatRow icon={Clock} label="Last Login" value="Just now" color="text-[var(--muted)]" />
                </div>
              </div>
            </div>
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
function FieldInput({ icon: Icon, label, value, onChange, disabled }: { icon: typeof User; label: string; value: string; onChange: (v: string) => void; disabled: boolean }) {
  return (<div><label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">{label}</label><div className="relative"><Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--faint)]" /><input type="text" value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} className="w-full rounded-xl border border-[var(--line)] bg-[var(--background)] py-2.5 pl-10 pr-3 text-sm text-[var(--text)] transition placeholder-[var(--faint)] focus:border-[var(--prussian)] focus:outline-none focus:ring-2 focus:ring-[var(--prussian)]/20 disabled:opacity-60" /></div></div>);
}
function DetailRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (<div className="flex items-start gap-3"><Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--faint)]" /><div><p className="text-xs font-medium text-[var(--faint)]">{label}</p><p className="text-sm capitalize text-[var(--text)]">{value}</p></div></div>);
}
function StatRow({ icon: Icon, label, value, color }: { icon: typeof Zap; label: string; value: string; color: string }) {
  return (<div className="flex items-center justify-between rounded-xl bg-[var(--tint5)] px-4 py-3"><div className="flex items-center gap-2"><Icon className={`h-4 w-4 ${color}`} /><span className="text-sm text-[var(--text)]">{label}</span></div><span className="text-sm font-semibold text-[var(--text)]">{value}</span></div>);
}