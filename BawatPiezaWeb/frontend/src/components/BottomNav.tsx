"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Zap,
  Gauge,
  FileText,
  CalendarDays,
  Users,
  User,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: typeof Home;
};

const items: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Energy", href: "/dashboard/energy", icon: Zap },
  { label: "Heatmap", href: "/dashboard/heatmap", icon: Gauge },
  { label: "Report", href: "/dashboard/reports", icon: FileText },
  { label: "Schedule", href: "/dashboard/schedule", icon: CalendarDays },
  { label: "Accounts", href: "/dashboard/accounts", icon: Users },
  { label: "Profile", href: "/dashboard/profile", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname === href || pathname.startsWith(href + "/");

  return (
    <nav className="fixed inset-x-0 bottom-4 z-40 px-4 md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-around rounded-2xl border border-[var(--line)] bg-[var(--glass)] px-2 py-2 shadow-2xl shadow-[var(--shadow)] backdrop-blur-xl">
        {items.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className="group flex flex-1 flex-col items-center gap-1 rounded-xl px-0.5 py-1 transition"
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                  active
                    ? "bg-[var(--prussian)] text-[var(--butter)] shadow-md shadow-[var(--shadow)]"
                    : "text-[var(--muted)] group-hover:text-[var(--text)]"
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span
                className={`text-[9px] font-medium transition ${
                  active ? "text-[var(--text)]" : "text-[var(--faint)]"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
