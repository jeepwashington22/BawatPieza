"use client";

import { useEffect, useRef, useState } from "react";
import { Activity, Footprints, Gauge, Zap } from "lucide-react";
import AnimatedMetric from "@/components/AnimatedMetric";

export default function AccumulatedGeneration() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isActive, setIsActive] = useState(false);

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
          <div className="generation-stats-heading">
            <span className="flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-white/75">
              <Activity className="h-3.5 w-3.5 text-[var(--neon-orange)]" /> Current output
            </span>
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-emerald-300">Active system</span>
          </div>
          <div key={isActive ? "active" : "inactive"} className="generation-metrics grid grid-cols-1 sm:grid-cols-3">
            <AnimatedMetric start={isActive} label="Footstep count" value={1248} suffix="steps" icon={<Footprints className="h-4 w-4" />} />
            <AnimatedMetric start={isActive} label="Electricity generation" value={42.8} decimals={1} suffix="W" icon={<Zap className="h-4 w-4" />} />
            <AnimatedMetric start={isActive} label="Voltage" value={4.86} decimals={2} suffix="V" icon={<Gauge className="h-4 w-4" />} accent="cyan" />
          </div>
        </div>
      </div>
    </section>
  );
}
