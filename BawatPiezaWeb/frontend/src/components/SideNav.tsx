"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Recycle,
  Zap,
  Gauge,
  FileText,
  CalendarDays,
  BarChart3,
  User,
  Users,
  Recycle as LogoIcon,
  Settings,
  LogOut,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: typeof Home;
  badge?: string;
};

const items: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Devices", href: "/dashboard/devices", icon: Recycle },
  { label: "Energy", href: "/dashboard/energy", icon: Zap, badge: "Live" },
  { label: "Heatmap", href: "/dashboard/heatmap", icon: Gauge },
  { label: "Report", href: "/dashboard/reports", icon: FileText },
  { label: "Schedule", href: "/dashboard/schedule", icon: CalendarDays },
  { label: "Accounts", href: "/dashboard/accounts", icon: Users },
  { label: "Stats", href: "/dashboard/stats", icon: BarChart3 },
  { label: "Profile", href: "/dashboard/profile", icon: User },
];

export default function SideNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="relative hidden h-full w-64 shrink-0 flex-col border-r border-[var(--line)] bg-[var(--surface)] md:flex">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-3 px-6 py-6">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--prussian)] to-[var(--prussian-soft)] shadow-lg shadow-[var(--shadow)]">
          <LogoIcon className="h-5 w-5 text-[var(--butter)]" />
        </span>
        <div>
          <p className="text-lg font-bold leading-none tracking-tight text-[var(--text)]">
            Bawat<span className="text-[var(--butter)]">Pieza</span>
          </p>
          <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.2em] text-[var(--faint)]">
            Waste Into Watts Ion
          </p>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-4">
        {items.map(({ label, href, icon: Icon, badge }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-[var(--prussian)] text-white shadow-md shadow-[var(--shadow)]"
                  : "text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--text)]"
              }`}
            >
              <Icon
                className={`h-5 w-5 transition ${
                  active ? "text-[var(--butter)]" : "text-[var(--faint)] group-hover:text-[var(--text)]"
                }`}
              />
              <span className="flex-1">{label}</span>
              {badge && (
                <span className="rounded-full bg-[var(--butter-30)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text)]">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / user */}
      <div className="space-y-1 border-t border-[var(--line)] px-4 py-4">
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--background)] hover:text-[var(--text)]"
        >
          <Settings className="h-5 w-5 text-[var(--faint)]" />
          Settings
        </Link>
        <button
          type="button"
          onClick={async () => {
            const { supabase } = await import("@/lib/supabaseClient");
            await supabase.auth.signOut();
            window.location.href = "/";
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-[var(--muted)] transition hover:bg-red-500/10 hover:text-red-500"
        >
          <LogOut className="h-5 w-5 text-[var(--faint)]" />
          Log out
        </button>
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--background)] px-3.5 py-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[var(--prussian)] to-[var(--prussian-soft)] text-sm font-bold text-white">
            JW
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--text)]">Jane Doe</p>
            <p className="truncate text-[11px] text-[var(--faint)]">jane@bawatpieza.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
