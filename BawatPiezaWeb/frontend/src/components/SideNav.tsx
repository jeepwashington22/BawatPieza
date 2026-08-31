"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Recycle, Zap, BarChart3, User, Recycle as LogoIcon, Settings, LogOut } from "lucide-react";

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
  { label: "Stats", href: "/dashboard/stats", icon: BarChart3 },
  { label: "Profile", href: "/dashboard/profile", icon: User },
];

export default function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="relative hidden h-full w-64 shrink-0 flex-col border-r border-white/10 bg-[#0a1518]/80 backdrop-blur-xl md:flex">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-3 px-6 py-6">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30">
          <LogoIcon className="h-5 w-5 text-white" />
        </span>
        <div>
          <p className="text-lg font-bold leading-none tracking-tight">
            Bawat<span className="text-emerald-400">Pieza</span>
          </p>
          <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.2em] text-emerald-100/40">
            Waste Into Watts Ion
          </p>
        </div>
      </Link>

      {/* Nav */}
      <nav className="mt-4 flex-1 space-y-1 px-4">
        {items.map(({ label, href, icon: Icon, badge }) => {
          const active =
            pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-gradient-to-r from-emerald-400/20 to-teal-400/10 text-white shadow-inner shadow-emerald-500/10"
                  : "text-white/50 hover:bg-white/[0.05] hover:text-white/80"
              }`}
            >
              <Icon
                className={`h-5 w-5 transition ${
                  active ? "text-emerald-300" : "text-white/40 group-hover:text-white/70"
                }`}
              />
              <span className="flex-1">{label}</span>
              {badge && (
                <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / user */}
      <div className="space-y-1 border-t border-white/10 px-4 py-4">
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white/50 transition hover:bg-white/[0.05] hover:text-white/80"
        >
          <Settings className="h-5 w-5 text-white/40" />
          Settings
        </Link>
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white/50 transition hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="h-5 w-5 text-white/40" />
          Log out
        </Link>
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-sm font-bold text-white">
            JW
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">Jane Doe</p>
            <p className="truncate text-[11px] text-white/40">jane@bawatpieza.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}