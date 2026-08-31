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
  { name: "Waste-to-Energy", value: 46, color: "#34d399" },
  { name: "Solar", value: 32, color: "#5eead4" },
  { name: "Grid", value: 22, color: "#22d3ee" },
];

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen w-full bg-[#070f13] text-white">
      <SideNav />
      <div className="relative flex-1">
        {/* Ambient background */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-emerald-500/20 blur-[130px]" />
          <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-teal-400/10 blur-[120px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-32 pt-5 sm:px-6 md:pb-10 md:pt-8 lg:px-10">
          {/* Top bar (desktop) */}
          <div className="mb-6 hidden items-center justify-between gap-4 md:flex">
            <div>
              <p className="text-sm text-emerald-300/80">Good evening, Jane</p>
              <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm text-white/50">
                <Search className="h-4 w-4" />
                <input
                  placeholder="Search..."
                  className="w-40 bg-transparent text-white placeholder-white/40 outline-none"
                />
              </div>
              <button
                type="button"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/70 transition hover:text-white"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </button>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-sm font-bold">
                JW
              </span>
            </div>
          </div>

          {/* Mobile-only brand header */}
          <header className="mb-6 flex items-center justify-between md:hidden">
            <div>
              <p className="text-sm text-emerald-300/80">Good evening</p>
              <h1 className="text-2xl font-bold tracking-tight">
                Bawat<span className="text-emerald-400">Pieza</span>
              </h1>
            </div>
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/70"
            >
              <Bell className="h-5 w-5" />
            </button>
          </header>

          {/* Stat cards */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {statCards.map(({ label, value, delta, up, icon: Icon }) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur"
              >
                <div>
                  <p className="text-sm font-bold">{value}</p>
                  <p className="text-xs text-white/50">{label}</p>
                  <p
                    className={`mt-1 flex items-center gap-0.5 text-xs font-semibold ${
                      up ? "text-emerald-300" : "text-red-300"
                    }`}
                  >
                    {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                    {delta} vs yesterday
                  </p>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">
                  <Icon className="h-6 w-6" />
                </span>
              </div>
            ))}
          </section>
          {/* Main grid */}
          <section className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Live consumption */}
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-cyan-500/10 p-6 backdrop-blur-xl lg:col-span-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-emerald-200/70">
                    <TrendingUp className="h-3.5 w-3.5" /> Live Consumption
                  </p>
                  <div className="mt-3 flex items-end gap-2">
                    <span className="text-5xl font-bold leading-none">2.6</span>
                    <span className="mb-1 text-sm text-white/60">kW</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-emerald-400/15 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                  <Activity className="h-3.5 w-3.5" /> Efficient
                </div>
              </div>
              <div className="mt-5 h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={energyTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="kW" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#34d399" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff11" vertical={false} />
                    <XAxis dataKey="time" tick={{ fill: "#ffffff55", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#ffffff55", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "#0d1a1e",
                        border: "1px solid #ffffff22",
                        borderRadius: 12,
                        color: "#fff",
                      }}
                    />
                    <Area type="monotone" dataKey="kw" stroke="#34d399" strokeWidth={2.5} fill="url(#kW)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Energy mix donut */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white/80">Energy Mix</h2>
                <button type="button" className="text-xs font-medium text-emerald-300 hover:text-emerald-200">
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
                        background: "#0d1a1e",
                        border: "1px solid #ffffff22",
                        borderRadius: 12,
                        color: "#fff",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 space-y-2">
                {sourcesData.map(({ name, value, color }) => (
                  <div key={name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-white/70">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                      {name}
                    </span>
                    <span className="font-semibold text-white">{value}%</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Weekly usage */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white/80">Weekly Usage</h2>
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-300">
                  <ArrowUpRight className="h-3.5 w-3.5" /> 14.2 kWh
                </span>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weekly} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff11" vertical={false} />
                    <XAxis dataKey="day" tick={{ fill: "#ffffff55", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#ffffff55", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: "#ffffff08" }}
                      contentStyle={{
                        background: "#0d1a1e",
                        border: "1px solid #ffffff22",
                        borderRadius: 12,
                        color: "#fff",
                      }}
                    />
                    <Bar dataKey="kw" radius={[6, 6, 0, 0]} fill="#5eead4" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Battery + wallet */}
            <div className="flex flex-col gap-5 lg:col-span-2">
              <div className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">
                    <Battery className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">Battery Storage</p>
                    <p className="text-xs text-white/50">System battery · Charging</p>
                  </div>
                </div>
                <div className="w-full sm:w-56">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-white/50">Capacity</span>
                    <span className="font-semibold text-white">78%</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-emerald-400 to-teal-400" />
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
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-400/15 text-teal-300">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-lg font-bold leading-tight">{value}</p>
                      <p className="text-xs text-white/50">{label}</p>
                      <p className="text-[11px] text-emerald-300/70">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
