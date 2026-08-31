"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Recycle, Zap, BarChart3, User } from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: typeof Home;
};

const items: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Devices", href: "/dashboard/devices", icon: Recycle },
  { label: "Energy", href: "/dashboard/energy", icon: Zap },
  { label: "Stats", href: "/dashboard/stats", icon: BarChart3 },
  { label: "Profile", href: "/dashboard/profile", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-4 z-40 px-4 md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-around rounded-2xl border border-white/10 bg-[#0d1a1e]/90 px-2 py-2 shadow-2xl shadow-black/60 backdrop-blur-xl">
        {items.map(({ label, href, icon: Icon }) => {
          const active =
            pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className="group flex flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1.5 transition"
            >
              <span
                className={`flex h-9 w-12 items-center justify-center rounded-full transition ${
                  active
                    ? "bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/30"
                    : "text-white/50 group-hover:text-white/80"
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span
                className={`text-[10px] font-medium transition ${
                  active ? "text-emerald-300" : "text-white/40"
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