"use client";

import { useEffect, useState } from "react";
import { Activity, BatteryCharging, Footprints, Gauge, Zap } from "lucide-react";

type Stat = {
  label: string;
  value: string;
  unit: string;
  icon: React.ReactNode;
  color: string;
  glow: string;
};

export default function StatsBar() {
  const [stats, setStats] = useState({
    voltage: 12.4,
    watts: 8.6,
    steps: 1247,
    energy: 3.2,
    efficiency: 78,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        voltage: +(prev.voltage + (Math.random() - 0.48) * 0.8).toFixed(1),
        watts: +(prev.watts + (Math.random() - 0.47) * 0.5).toFixed(1),
        steps: prev.steps + Math.floor(Math.random() * 4),
        energy: +(prev.energy + (Math.random() - 0.45) * 0.15).toFixed(1),
        efficiency: Math.min(95, Math.max(60, prev.efficiency + Math.round((Math.random() - 0.5) * 3))),
      }));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const items: Stat[] = [
    { label: "Voltage", value: stats.voltage.toFixed(1), unit: "V", icon: <Zap className="h-4 w-4" />, color: "text-yellow-300", glow: "rgba(250,204,21,0.3)" },
    { label: "Power", value: stats.watts.toFixed(1), unit: "W", icon: <BatteryCharging className="h-4 w-4" />, color: "text-lime-300", glow: "rgba(163,230,53,0.3)" },
    { label: "Steps", value: stats.steps.toLocaleString(), unit: "", icon: <Footprints className="h-4 w-4" />, color: "text-orange-300", glow: "rgba(255,140,40,0.3)" },
    { label: "Energy", value: stats.energy.toFixed(1), unit: "kWh", icon: <Gauge className="h-4 w-4" />, color: "text-cyan-300", glow: "rgba(0,229,255,0.3)" },
    { label: "Efficiency", value: stats.efficiency.toString(), unit: "%", icon: <Activity className="h-4 w-4" />, color: "text-emerald-300", glow: "rgba(52,211,153,0.3)" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((s) => (
        <div
          key={s.label}
          className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] p-4 backdrop-blur-sm transition-all duration-300 hover:border-white/10 hover:bg-white/[0.06]"
          style={{ boxShadow: `0 0 0 0 ${s.glow}` }}
          onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 0 20px 0 ${s.glow}`)}
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = `0 0 0 0 ${s.glow}`)}
        >
          <div className="flex items-center justify-between">
            <div className={`rounded-lg bg-white/5 p-2 ${s.color}`}>{s.icon}</div>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-black tabular-nums ${s.color}`}>{s.value}</span>
              {s.unit && <span className="text-xs font-medium text-white/40">{s.unit}</span>}
            </div>
          </div>
          <p className="mt-3 text-[11px] font-medium uppercase tracking-widest text-white/40">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
