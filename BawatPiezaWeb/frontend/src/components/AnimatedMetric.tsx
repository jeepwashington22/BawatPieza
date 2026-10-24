"use client";

import { useEffect, useState } from "react";

type AnimatedMetricProps = {
  label: string;
  value: number;
  decimals?: number;
  suffix?: string;
  icon: React.ReactNode;
  accent?: "butter" | "cyan";
  start?: boolean;
};

export default function AnimatedMetric({
  label,
  value,
  decimals = 0,
  suffix = "",
  icon,
  accent = "butter",
  start = true,
}: AnimatedMetricProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!start) {
      return;
    }

    let frameId = 0;
    const startedAt = performance.now();
    const duration = 1400;

    const animate = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(value * easedProgress);
      if (progress < 1) frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [start, value]);

  const formattedValue = displayValue.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <div className="metric-glass">
      <div className={`metric-icon metric-icon-${accent}`}>{icon}</div>
      <p className="mt-0 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-[var(--faint)]">
        {label}
      </p>
      <p className="mt-0 text-xl font-bold tracking-tight text-[var(--text)] sm:text-2xl">
        {formattedValue}
        <span className="ml-1 text-sm font-medium text-[var(--muted)]">{suffix}</span>
      </p>
    </div>
  );
}
