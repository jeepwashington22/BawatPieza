"use client";

import { useEffect, useRef, useState } from "react";
import { Activity, ChevronDown, Footprints, Gauge, Zap } from "lucide-react";
import AnimatedMetric from "@/components/AnimatedMetric";

const DAY_OPTIONS = [7, 14, 30, 90];

const consumptionMap: Record<number, { footsteps: number; generation: number; voltage: number }> = {
  7: { footsteps: 1248, generation: 42.8, voltage: 4.86 },
  14: { footsteps: 2560, generation: 88.1, voltage: 8.42 },
  30: { footsteps: 5384, generation: 174.6, voltage: 12.8 },
  90: { footsteps: 16240, generation: 536.2, voltage: 24.1 },
};

export default function AccumulatedGeneration() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [days, setDays] = useState(7);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsActive(entry.isIntersecting),
      { threshold: 0.35 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const consumption = consumptionMap[days] ?? consumptionMap[7];

  return (
    <section
      ref={sectionRef}
      id="generation"
      className={`generation-section relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8 lg:py-32 ${isActive ? "is-active" : ""}`}
    >
      <video className="how-section-video" autoPlay loop muted playsInline aria-hidden="true" tabIndex={-1}>
        <source src="/21782-321298091.mp4" type="video/mp4" />
      </video>
      <div aria-hidden="true" className="how-section-wash" />
      <div className="relative z-10 mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20">
        <div className="generation-copy">
          <span className="inline-flex items-center gap-2.5 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[var(--neon-orange)]">
            <span className="h-0.5 w-6 rounded bg-[var(--neon-orange)]" />
            Accumulated generation
          </span>
          <h2 className="mt-4 max-w-xl text-4xl font-bold leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-[3.8rem]">
            Every step adds to the <span className="generation-highlight">power bank.</span>
          </h2>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-white/70 sm:text-base">
            The hybrid tile turns pressure and spring-back into electricity, then stores the combined output for lights, signs, and charging points.
          </p>
          <div className="mt-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/55">
            <span className="generation-live-dot" />
            Live prototype accumulation
          </div>
        </div>

        <div className="generation-stats">
          <div className="generation-stats-heading flex-wrap gap-3">
            <span className="flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-white/75">
              <Activity className="h-3.5 w-3.5 text-[var(--neon-orange)]" /> Current output
            </span>

            <label className="relative inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-2.5 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-white/80 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.7)]">
              <span className="text-white/70">Days</span>
              <select
                aria-label="Filter by days of consumption"
                value={days}
                onChange={(event) => setDays(Number(event.target.value))}
                className="appearance-none bg-transparent pr-5 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--neon-orange)] outline-none"
              >
                {DAY_OPTIONS.map((option) => (
                  <option key={option} value={option} className="bg-slate-900 text-white">
                    {option} days
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 h-3 w-3 text-white/70" />
            </label>

            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-emerald-300">Active system</span>
          </div>
          <div key={`${isActive}-${days}`} className="generation-metrics grid grid-cols-1 sm:grid-cols-3">
            <AnimatedMetric
              start={isActive}
              label="Footstep count"
              value={consumption.footsteps}
              suffix="steps"
              icon={<Footprints className="h-4 w-4" />}
            />
            <AnimatedMetric
              start={isActive}
              label="Electricity generation"
              value={consumption.generation}
              decimals={1}
              suffix="W"
              icon={<Zap className="h-4 w-4" />}
            />
            <AnimatedMetric
              start={isActive}
              label="Voltage"
              value={consumption.voltage}
              decimals={2}
              suffix="V"
              icon={<Gauge className="h-4 w-4" />}
              accent="cyan"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
