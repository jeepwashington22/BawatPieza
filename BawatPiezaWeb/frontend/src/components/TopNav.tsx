"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Bell, ChevronDown, User, Settings, LogOut, Gauge } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

type Notification = {
  id: number;
  title: string;
  body: string;
  time: string;
  color: string;
};

const notifications: Notification[] = [
  { id: 1, title: "Critical pressure detected", body: "Tile (6,10) hit 91 psi.", time: "2m ago", color: "#d97706" },
  { id: 2, title: "Harvest spike", body: "Harvested 9.8 W in the last hour.", time: "18m ago", color: "#f6c445" },
  { id: 3, title: "Device online", body: "Piezo pad #4 reconnected.", time: "1h ago", color: "#3b5b7a" },
];

export default function TopNav({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-[var(--line)] bg-[var(--glass)] px-4 py-3 backdrop-blur-xl sm:px-6">
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-xl font-bold tracking-tight text-[var(--text)]">{title}</h1>
        {subtitle && (
          <p className="truncate text-sm text-[var(--muted)]">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        <div className="hidden items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2 text-sm text-[var(--muted)] lg:flex">
          <Search className="h-4 w-4" />
          <input placeholder="Search..." className="w-36 bg-transparent text-[var(--text)] placeholder-[var(--faint)] outline-none" />
        </div>

        <ThemeToggle />

        {/* Notifications */}
        <div className="relative">
          <button type="button" onClick={() => { setNotifOpen((v) => !v); setUserOpen(false); }} className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--soft)] transition hover:text-[var(--text)]">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2.5 top-2 h-2 w-2 rounded-full bg-[#d97706] ring-2 ring-[var(--surface)]" />
          </button>

          {notifOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 z-40 mt-2 w-72 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-2 shadow-xl shadow-[var(--shadow)]">
                <div className="flex items-center justify-between px-3 py-2">
                  <p className="text-sm font-semibold text-[var(--text)]">Notifications</p>
                  <span className="rounded-full bg-[var(--butter-30)] px-2 py-0.5 text-[10px] font-bold text-[var(--text)]">{notifications.length} new</span>
                </div>
                <div className="space-y-1">
                  {notifications.map((n) => (
                    <div key={n.id} className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition hover:bg-[var(--background)]">
                      <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: n.color }} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-tight text-[var(--text)]">{n.title}</p>
                        <p className="text-xs text-[var(--muted)]">{n.body}</p>
                        <p className="mt-0.5 text-[10px] text-[var(--faint)]">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" className="mt-1 w-full rounded-xl bg-[var(--background)] py-2 text-center text-xs font-semibold text-[var(--soft)] hover:text-[var(--text)]">View all notifications</button>
              </div>
            </>
          )}
        </div>

        {/* User profile */}
        <div className="relative">
          <button type="button" onClick={() => { setUserOpen((v) => !v); setNotifOpen(false); }} className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] py-1 pl-1 pr-2.5 transition hover:bg-[var(--background)]">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--prussian)] to-[var(--prussian-soft)] text-xs font-bold text-white">JW</span>
            <span className="hidden text-left sm:block">
              <span className="block text-xs font-semibold leading-tight text-[var(--text)]">Jane Doe</span>
              <span className="block text-[10px] text-[var(--faint)]">ADMIN</span>
            </span>
            <ChevronDown className="h-4 w-4 text-[var(--faint)]" />
          </button>

          {userOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setUserOpen(false)} />
              <div className="absolute right-0 z-40 mt-2 w-56 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-2 shadow-xl shadow-[var(--shadow)]">
                <div className="flex items-center gap-3 border-b border-[var(--line)] px-3 py-2.5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--prussian)] to-[var(--prussian-soft)] text-sm font-bold text-white">JW</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--text)]">Jane Doe</p>
                    <p className="truncate text-xs text-[var(--faint)]">jane@bawatpieza.com</p>
                  </div>
                </div>
                <div className="space-y-1 pt-1.5">
                  <Link href="/dashboard/heatmap" className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-[var(--muted)] transition hover:bg-[var(--background)] hover:text-[var(--text)]"><Gauge className="h-4 w-4" /> Heatmap view</Link>
                  <Link href="/dashboard/profile" className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-[var(--muted)] transition hover:bg-[var(--background)] hover:text-[var(--text)]"><User className="h-4 w-4" /> My profile</Link>
                  <Link href="/dashboard/profile" className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-[var(--muted)] transition hover:bg-[var(--background)] hover:text-[var(--text)]"><Settings className="h-4 w-4" /> Settings</Link>
                  <Link href="/" className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-red-500 transition hover:bg-red-500/10"><LogOut className="h-4 w-4" /> Log out</Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
