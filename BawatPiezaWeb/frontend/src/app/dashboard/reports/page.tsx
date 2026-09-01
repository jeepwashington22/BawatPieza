"use client";

import {
  Download,
  Calendar,
  TrendingUp,
  Recycle,
  Zap,
  Leaf,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ComposedChart,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import TopNav from "@/components/TopNav";
import SideNav from "@/components/SideNav";
import BottomNav from "@/components/BottomNav";

const monthlyTrend = [
  { m: "Jan", energy: 420, waste:310, revenue:52 },
  { m: "Feb", energy:505, waste:365, revenue:68 },
  { m: "Mar", energy:470, waste:340, revenue:61 },
  { m: "Apr", energy:610, waste:420, revenue:84 },
  { m: "May", energy:560, waste:388, revenue:76 },
  { m: "Jun", energy:690, waste:460, revenue:96 },
  { m: "Jul", energy:720, waste:482, revenue:104 },
  { m: "Aug", energy:760, waste:505, revenue:112 },
  { m: "Sep", energy:740, waste:498, revenue:108 },
];

const tileStats = [
  { zone: "Gate A", sample: 1180, avg:72, peak:94, active:92 },
  { zone:"Hallway", sample: 920, avg:58, peak:88, active:84 },
  { zone:"Platform", sample: 720, avg:41, peak:76, active:61 },
  { zone:"Exit B", sample:680, avg:35, peak:69, active:52 },
];

const mixData = [
  { name: "Waste-to-Energy", value:46, color:"var(--prussian)" },
  { name: "Solar", value:32, color:"var(--butter)" },
  { name: "Grid", value:22, color:"#9db4c8" },
];

const kpis = [
  { label: "Total Energy", value: "5,490 kWh", delta: "+14.2%", up: true, icon: Zap },
  { label: "Waste Processed", value: "3,768 kg", delta: "+8.1%", up: true, icon: Recycle },
  { label: "CO2 Avoided", value: "1,842 kg", delta: "+5.4%", up: true, icon: Leaf },
  { label: "Revenue", value: "Php 12,480", delta: "+11.9%", up: true, icon: Award },
];
export default function ReportsPage() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--background)] text-[var(--text)]">
      <SideNav />
      <div className="relative flex-1 overflow-y-auto">
        <TopNav title="Monthly Reports" subtitle="Piezoelectric analytics - energy, waste and revenue" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-32 pt-6 sm:px-6 md:pb-10 lg:px-10">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--background)] text-[var(--text)]">
                <FileText className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold">September 2026</h2>
                <p className="text-sm text-[var(--muted)]">Period: Sep   1 -  30,  2026</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="flex items-center gap-2 rounded-xl border border-[var(--line-strong)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium transition hover:bg-[var(--background)]">
                <Calendar className="h-4 w-4" /> Aug 2026
              </button>
              <button type="button" className="flex items-center gap-2 rounded-xl bg-[var(--background)] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--shadow)] transition hover:bg-[var(--prussian-soft)]">
                <Download className="h-4 w-4 text-[var(--text)]" /> Export PDF
              </button>
            </div>
          </div>

          {/* KPI cards */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map(({ label, value, delta, up, icon: Icon }) => (
              <div key={label} className="rounded-2xl border border-[var(--tint10)] bg-[var(--surface)] p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--butter-20)] text-[var(--text)]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="flex items-center gap-0.5 text-xs font-semibold text-[var(--text)]">
                    {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                    {delta}
                  </span>
                </div>
                <p className="mt-4 text-2xl font-bold leading-none">{value}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{label}</p>
              </div>
            ))}
          </section>
{/* Analytics charts */}
          <section className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Monthly trend */}
            <div className="rounded-3xl border border-[var(--tint10)] bg-[var(--surface)] p-6 shadow-sm lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Monthly Performance</h3>
                  <p className="text-xs text-[var(--muted)]">Energy vs waste processed (Jan - Sep</p>
                </div>
                <span className="flex items-center gap-1 text-xs font-semibold text-[var(--text)]">
                  <TrendingUp className="h-3.5 w-3.5 text-[var(--text)]" /> +14.2%
                </span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthlyTrend} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="energy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--prussian)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="var(--butter)" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                    <XAxis dataKey="m" tick={{ fill: "var(--prussian-soft)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "var(--prussian-soft)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, color: "var(--text)" }} />
                    <Area type="monotone" dataKey="energy" name="Energy (kWh)" stroke="var(--prussian)" strokeWidth={2.5} fill="url(#energy)" />
                    <Line type="monotone" dataKey="waste" name="Waste (kg)" stroke="var(--butter)" strokeWidth={2.5} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Mix donut */}
            <div className="rounded-3xl border border-[var(--tint10)] bg-[var(--surface)] p-6 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Energy Mix</h3>
                <span className="text-xs font-medium text-[var(--soft)]">Sept 2026</span>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={mixData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={66} paddingAngle={3} stroke="none">
                      {mixData.map((s) => (
                        <Cell key={s.name} fill={s.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, color: "var(--text)" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 space-y-2">
                {mixData.map(({ name, value, color }) => (
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
{/* Tile performance */}
            <div className="rounded-3xl border border-[var(--tint10)] bg-[var(--surface)] p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Zone Performance</h3>
                <span className="text-xs font-medium text-[var(--soft)]">Most active zones</span>
              </div>
              <div className="space-y-3.5">
                {tileStats.map((z) => (
                  <div key={z.zone}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-[var(--soft)]">{z.zone}</span>
                      <span className="font-semibold text-[var(--text)]">{z.avg} psi avg</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--tint10)]">
                      <div className="h-full rounded-full bg-[var(--prussian)]" style={{ width: `${z.avg}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Monthly summary table */}
          <section className="mt-6 overflow-hidden rounded-3xl border border-[var(--tint10)] bg-[var(--surface)] shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--tint10)] px-6 py-4">
              <h3 className="text-sm font-semibold">Monthly Breakdown</h3>
              <button type="button" className="text-xs font-medium text-[var(--soft)] hover:text-[var(--text)]">View full report</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-[var(--tint10)] text-left text-xs  tracking-wider text-[var(--faint)]">
                    <th className="px-6 py-3 font-medium">Month</th>
                    <th className="px-4 py-3 font-medium">Energy (kWh)</th>
                    <th className="px-4 py-3 font-medium">Waste (kg)</th>
                    <th className="px-4 py-3 font-medium">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyTrend.map((r) => (
                    <tr key={r.m} className="border-b border-[var(--tint5)] transition hover:bg-[var(--background)]">
                      <td className="px-6 py-3 font-semibold">{r.m}</td>
                      <td className="px-4 py-3">{r.energy}</td>
                      <td className="px-4 py-3">{r.waste}</td>
                      <td className="px-4 py-3 font-medium text-[var(--soft)]">Php {r.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}