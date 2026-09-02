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
} from "lucide-react";
import { useUser } from "@/context/UserContext";

type NavItem = {
  label: string;
  href: string;
  icon: typeof Home;
  badge?: string;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const sections: NavSection[] = [
  {
    title: "Main",
    items: [
      { label: "Home", href: "/dashboard", icon: Home },
      { label: "Energy", href: "/dashboard/energy", icon: Zap, badge: "Live" },
      { label: "Devices", href: "/dashboard/devices", icon: Recycle },
    ],
  },
  {
    title: "Analytics",
    items: [
      { label: "Heatmap", href: "/dashboard/heatmap", icon: Gauge },
      { label: "Reports", href: "/dashboard/reports", icon: FileText },
      { label: "Stats", href: "/dashboard/stats", icon: BarChart3 },
    ],
  },
  {
    title: "Management",
    items: [
      { label: "Schedule", href: "/dashboard/schedule", icon: CalendarDays },
      { label: "Accounts", href: "/dashboard/accounts", icon: Users },
      { label: "Profile", href: "/dashboard/profile", icon: User },
    ],
  },
];

export default function SideNav() {
  const pathname = usePathname();
  const { user } = useUser();

  const initials = [user.firstname, user.lastname].filter(Boolean).map((s) => s[0]?.toUpperCase()).join("") || "?";
  const fullName = [user.firstname, user.lastname].filter(Boolean).join(" ") || "Loading...";

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="relative hidden h-full w-64 shrink-0 flex-col border-r border-[var(--line)] bg-[var(--surface)] md:flex">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-3 border-b border-[var(--line)] px-5 pb-5 pt-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--prussian)] to-[var(--prussian-soft)] shadow-md shadow-[var(--shadow)]">
          <LogoIcon className="h-5 w-5 text-[var(--butter)]" />
        </span>
        <div>
          <p className="text-lg font-bold leading-none tracking-tight text-[var(--text)]">
            Bawat<span className="text-[var(--butter)]">Pieza</span>
          </p>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--faint)]">
            Waste Into Watts
          </p>
        </div>
      </Link>

      {/* Nav with sectioned separation + dividers */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5">
        {sections.map((section, si) => (
          <div key={section.title} className="relative">
            {si > 0 && (
              <div className="mb-3 h-px w-full bg-[var(--tint10)]" aria-hidden />
            )}
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--faint)]">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map(({ label, href, icon: Icon, badge }, ii) => {
                const active = isActive(href);
                const delay = (si * 3 + ii) * 0.05;
                return (
                  <Link
                    key={href}
                    href={href}
                    style={{ animationDelay: `${delay}s` }}
                    className={`bp-nav-item group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${active
                      ? "bg-[var(--tint10)] text-[var(--prussian)]"
                      : "text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--text)]"}`}
                  >
                    {active && <span className="bp-nav-active-bar" />}
                    <Icon
                      className={`h-[18px] w-[18px] shrink-0 transition ${active
                        ? "text-[var(--butter)]"
                        : "text-[var(--faint)] group-hover:text-[var(--prussian)]"}`}
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
            </div>
          </div>
        ))}
      </nav>

      {/* Compact user card (no settings/logout - those live in TopNav) */}
      <div className="border-t border-[var(--line)] px-3 py-4">
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-[var(--background)]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--prussian)] to-[var(--prussian-soft)] text-xs font-bold text-white">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--text)]">{fullName}</p>
            <p className="truncate text-[11px] text-[var(--faint)]">{user.role === "admin" ? "Administrator" : "Staff"}</p>
          </div>
        </Link>
      </div>
    </aside>
  );
}