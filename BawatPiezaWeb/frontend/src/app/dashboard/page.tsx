"use client";

import {
  Recycle,
  Zap,
  Leaf,
  TrendingUp,
  Battery,
  ArrowUpRight,
  ArrowDownRight,
  Droplets,
  Sun,
  Bell,
  Search,
  Activity,
  Wallet,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import BottomNav from "@/components/BottomNav";
import SideNav from "@/components/SideNav";
import TopNav from "@/components/TopNav";
import TileLoader from "@/components/TileLoader";
import { useEffect, useState } from "react";

const energyTrend = [
  { time: "00:00", kw: 1.2 },
  { time: "04:00", kw: 0.8 },
  { time: "08:00", kw: 2.4 },
  { time: "12:00", kw: 3.8 },
  { time: "16:00", kw: 3.1 },
  { time: "20:00", kw: 2.0 },
  { time: "Now", kw: 2.6 },
];

const weekly = [
  { day: "Mon", kw: 11.2 },
  { day: "Tue", kw: 13.4 },
  { day: "Wed", kw: 9.8 },
  { day: "Thu", kw: 15.1 },
  { day: "Fri", kw: 12.3 },
  { day: "Sat", kw: 17.6 },
  { day: "Sun", kw: 14.2 },
];

const statCards = [
  { label: "Energy Today", value: "14.2 kWh", delta: "+12%", up: true, icon: Zap },
  { label: "Waste Converted", value: "8.6 kg", delta: "+5%", up: true, icon: Recycle },
  { label: "CO2 Offset", value: "3.9 kg", delta: "-8%", up: false, icon: Leaf },
];

const sourcesData = [
  { name: "Waste-to-Energy", value: 46, color: "var(--prussian)" },
  { name: "Solar", value: 32, color: "var(--butter)" },
  { name: "Grid", value: 22, color: "var(--prussian-soft)" },
];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);

  // Simulated initial data fetch (swap for real Supabase/Redis queries later)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--background)] text-[var(--text)]">
      <SideNav />
      <div className="relative flex-1 overflow-y-auto">
        {/* Ambient background */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-[var(--butter-20)] blur-[130px]" />
          <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-[var(--tint10)] blur-[120px]" />
        </div>
        <TopNav title="Dashboard Overview" />
        {loading ? (
          <div className="flex h-[calc(100%-4rem)] items-center justify-center">
            <TileLoader label="Loading energy data" size="lg" />
          </div>
        ) : (
        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-32 pt-5 sm:px-6 md:pb-10 md:pt-8 lg:px-10">
          {/* Mobile-only brand header */}
          <header className="mb-6 flex items-center justify-between md:hidden">
            <div>
              <p className="text-sm text-[var(--muted)]">Good evening</p>
              <h1 className="text-2xl font-bold tracking-tight">
                Bawat<span className="text-[var(--butter)]">Pieza</span>
              </h1>
            </div>
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--soft)]"
            >
              <Bell className="h-5 w-5" />
            </button>
          </header>

          {/* Stat cards */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {statCards.map(({ label, value, delta, up, icon: Icon }) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 backdrop-blur"
              >
                <div>
                  <p className="text-sm font-bold">{value}</p>
                  <p className="text-xs text-[var(--muted)]">{label}</p>
                  <p
                    className={`mt-1 flex items-center gap-0.5 text-xs font-semibold ${
                      up ? "text-[var(--butter)]" : "text-red-400"
                    }`}
                  >
                    {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                    {delta} vs yesterday
                  </p>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--butter-20)] text-[var(--butter)]">
                  <Icon className="h-6 w-6" />
                </span>
              </div>
            ))}
          </section>
          {/* Main grid */}
          <section className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Live consumption */}
            <div className="rounded-3xl border border-[var(--line)] bg-gradient-to-br from-[var(--butter-20)] via-[var(--tint10)] to-[var(--tint5)] p-6 backdrop-blur-xl lg:col-span-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-[var(--muted)]">
                    <TrendingUp className="h-3.5 w-3.5" /> Live Consumption
                  </p>
                  <div className="mt-3 flex items-end gap-2">
                    <span className="text-5xl font-bold leading-none">2.6</span>
                    <span className="mb-1 text-sm text-[var(--muted)]">kW</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-[var(--butter-20)] px-3 py-1.5 text-xs font-semibold text-[var(--butter)]">
                  <Activity className="h-3.5 w-3.5" /> Efficient
                </div>
              </div>
              <div className="mt-5 h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={energyTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="kW" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--butter)" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="var(--butter)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                    <XAxis dataKey="time" tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--surface)",
                        border: "1px solid var(--line)",
                        borderRadius: 12,
                        color: "var(--text)",
                      }}
                    />
                    <Area type="monotone" dataKey="kw" stroke="var(--butter)" strokeWidth={2.5} fill="url(#kW)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Energy mix donut */}
            <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 backdrop-blur">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[var(--soft)]">Energy Mix</h2>
                <button type="button" className="text-xs font-medium text-[var(--butter)] hover:text-[var(--text)]">
                  View all
                </button>
              </div>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sourcesData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={62}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {sourcesData.map((s) => (
                        <Cell key={s.name} fill={s.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "var(--surface)",
                        border: "1px solid var(--line)",
                        borderRadius: 12,
                        color: "var(--text)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 space-y-2">
                {sourcesData.map(({ name, value, color }) => (
                  <div key={name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-[var(--soft)]">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                      {name}
                    </span>
                    <span className="font-semibold text-[var(--text)]">{value}%</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Weekly usage */}
            <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[var(--soft)]">Weekly Usage</h2>
                <span className="flex items-center gap-1 text-xs font-semibold text-[var(--butter)]">
                  <ArrowUpRight className="h-3.5 w-3.5" /> 14.2 kWh
                </span>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weekly} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                    <XAxis dataKey="day" tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: "var(--tint5)" }}
                      contentStyle={{
                        background: "var(--surface)",
                        border: "1px solid var(--line)",
                        borderRadius: 12,
                        color: "var(--text)",
                      }}
                    />
                    <Bar dataKey="kw" radius={[6, 6, 0, 0]} fill="var(--butter)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Battery + wallet */}
            <div className="flex flex-col gap-5 lg:col-span-2">
              <div className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 backdrop-blur sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--butter-20)] text-[var(--butter)]">
                    <Battery className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">Battery Storage</p>
                    <p className="text-xs text-[var(--muted)]">System battery \u00b7 Charging</p>
                  </div>
                </div>
                <div className="w-full sm:w-56">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-[var(--muted)]">Capacity</span>
                    <span className="font-semibold text-[var(--text)]">78%</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--surface)]/10">
                    <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-[var(--butter)] to-[var(--prussian-soft)]" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {[
                  { label: "Water Recycled", value: "212 L", sub: "+18 L today", icon: Droplets },
                  { label: "Solar Output", value: "4.1 kW", sub: "Peak 5.9 kW", icon: Sun },
                  { label: "Credits Earned", value: "12.4", sub: "+2.1 this week", icon: Wallet },
                ].map(({ label, value, sub, icon: Icon }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 backdrop-blur"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--butter-20)] text-[var(--butter)]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-lg font-bold leading-tight">{value}</p>
                      <p className="text-xs text-[var(--muted)]">{label}</p>
                      <p className="text-[11px] text-[var(--butter)]/70">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
        )}

        <BottomNav />
      </div>
    </div>
  );
}
