"use client";

import { Zap } from "lucide-react";

/**
 * TileLoader — a custom loading indicator styled as a grid of piezoelectric
 * tiles that "harvest" energy in sequence (butter-yellow glow pulse).
 *
 * Use it for route transitions (see app/dashboard/loading.tsx) or inline
 * data fetching:  <TileLoader label="Loading sensor data..." />
 */
export default function TileLoader({
  label = "Harvesting energy...",
  size = "md",
}: {
  label?: string;
  size?: "sm" | "md" | "lg";
}) {
  const dims = {
    sm: { tile: "h-2.5 w-2.5", text: "text-xs" },
    md: { tile: "h-3.5 w-3.5", text: "text-sm" },
    lg: { tile: "h-4 w-4", text: "text-base" },
  }[size];

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-10">
      {/* Piezo tile grid */}
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <span
            key={i}
            className={`${dims.tile} rounded-[4px] border border-[var(--line)] bg-[var(--butter)] bp-tile-pulse`}
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        ))}
      </div>

      {/* Center bolt that flashes with the pulse */}
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--prussian)] shadow-lg shadow-[var(--shadow)]">
        <Zap className="h-4.5 w-4.5 text-[var(--butter)] bp-bolt-flash" />
      </span>

      {label && (
        <p className={`${dims.text} font-medium tracking-wide text-[var(--muted)]`}>
          {label}
          <span className="bp-dots" />
        </p>
      )}
    </div>
  );
}
