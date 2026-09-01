"use client";

import { useEffect, useState } from "react";
import {
  Gauge,
  Activity,
  Thermometer,
  Info,
  Download,
  ChevronLeft,
  Zap,
  RefreshCw,
} from "lucide-react";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import SideNav from "@/components/SideNav";
import TileLoader from "@/components/TileLoader";

/* ------- Pressure scale / color mapping (piezoelectric tile array) ------- */
type ScaleStop = {
  min: number;
  color: string;
  label: string;
  desc: string;
};

const SCALE: ScaleStop[] = [
  { min: 0, color: "#0a2a4a", label: "Idle", desc: "No load · resting tile" },
  { min: 20, color: "#3b5b7a", label: "Light", desc: "Gentle contact / light step" },
  { min: 40, color: "#7d9cb8", label: "Moderate", desc: "Normal standing / walking" },
  { min: 60, color: "#f6c445", label: "High", desc: "Firm step / footfall" },
  { min: 80, color: "#d97706", label: "Critical", desc: "Heavy impact / overload" },
];

function colorFor(value: number): ScaleStop {
  let stop = SCALE[0];
  for (const s of SCALE) {
    if (value >= s.min) stop = s;
  }
  return stop;
}

/* ------- Deterministic sample pressure field (tile grid) ------- */
const ROWS = 6;
const COLS = 5;

function buildGrid(): { value: number }[][] {
  const grid: { value: number }[][] = [];
  for (let r = 0; r < ROWS; r++) {
    const row: { value: number }[] = [];
    for (let c = 0; c < COLS; c++) {
      const seed = (r * 12.9898 + c * 78.233) % 10;
      const rand = Math.abs(Math.sin(seed)) * 43758.5453;
      const frac = rand - Math.floor(rand);
      // create a "hot spot" (path of travel), scaled to the grid's own dimensions
      const hotspot =
        Math.exp(-((r - (ROWS - 2)) ** 2) / 5 - ((c - (COLS - 1)) ** 2) / 4) * 70 +
        Math.exp(-((r - 1) ** 2) / 4 - ((c - 1) ** 2) / 4) * 45;
      let value = frac * 55 + hotspot;
      value = Math.min(100, Math.max(0, Math.round(value)));
      row.push({ value });
    }
    grid.push(row);
  }
  return grid;
}

function avgPressure(g: { value: number }[][]): number {
  let sum = 0;
  let n = 0;
  for (const row of g) for (const cell of row) {
    sum += cell.value;
    n++;
  }
  return Math.round(sum / n);
}

/* ------- mini sparkline for the top stat ------- */
const spark = [22, 28, 18, 34, 41, 30, 52, 46, 61, 55];

/* Jitter helper — simulates fresh sensor readings arriving from the tile array */
function jitterGrid(prev: { value: number }[][]): { value: number }[][] {
  return prev.map((row) =>
    row.map((cell) => ({
      value: Math.min(100, Math.max(0, cell.value + Math.round((Math.random() - 0.5) * 22))),
    })),
  );
}

export default function PressureHeatmapPage() {
  const [grid, setGrid] = useState<{ value: number }[][]>(() => buildGrid());
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<string>("");

  // Simulated initial data fetch from the piezo sensor network
  useEffect(() => {
    const t = setTimeout(() => {
      setLastSync(new Date().toLocaleTimeString());
      setLoading(false);
    }, 900);
    return () => clearTimeout(t);
  }, []);

  const refresh = () => {
    setLoading(true);
    setTimeout(() => {
      setGrid((g) => jitterGrid(g));
      setLastSync(new Date().toLocaleTimeString());
      setLoading(false);
    }, 900);
  };

  const avg = avgPressure(grid);
  const peak = Math.max(...grid.flat().map((c) => c.value));
  const activeTiles = grid.flat().filter((c) => c.value >= 15).length;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--background)] text-[var(--text)]">
      <SideNav />
      <div className="relative flex-1 overflow-y-auto">
        <TopNav title="Pressure Heatmap" subtitle="Piezoelectric sensor network · live pressure distribution" />
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-[var(--butter-20)] blur-[130px]" />
          <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-[var(--tint10)] blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-32 pt-5 sm:px-6 md:pb-4 md:pt-6 lg:px-10">
                    {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-[var(--muted)]">
              Live pressure distribution across the smart tile array.
 Click a tile for its exact reading.

            </p>
            <button
              type="button"
              onClick={refresh}
              disabled={loading}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-[var(--prussian)] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--shadow)] transition hover:bg-[var(--prussian-soft)] disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Syncing..." : "Refresh"}
            </button>
          </div>

          {/* Full-panel loading state while fetching sensor data */}
          {loading ? (
            <section className="rounded-3xl border border-[var(--tint10)] bg-[var(--surface)] p-5 shadow-sm">
              <TileLoader label="Fetching live pressure readings" size="lg" />
            </section>
          ) : (
          <>
          {lastSync && (
            <p className="mb-4 text-xs text-[var(--faint)]">Last sync: {lastSync}</p>
          )}

          {/* Top stats */}
          <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-2xl border border-[var(--tint10)] bg-[var(--surface)] p-5 shadow-sm">
              <p className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-[var(--muted)]">
                <Gauge className="h-3.5 w-3.5 text-[var(--text)]" /> Avg Pressure
              </p>
              <p className="mt-2 text-3xl font-bold">{avg}<span className="text-base text-[var(--faint)]"> psi</span></p>
            </div>
            <div className="rounded-2xl border border-[var(--tint10)] bg-[var(--surface)] p-5 shadow-sm">
              <p className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-[var(--muted)]">
                <Activity className="h-3.5 w-3.5 text-[var(--text)]" /> Peak Load
              </p>
              <p className="mt-2 text-3xl font-bold">{peak}<span className="text-base text-[var(--faint)]"> psi</span></p>
            </div>
            <div className="rounded-2xl border border-[var(--tint10)] bg-[var(--surface)] p-5 shadow-sm">
              <p className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-[var(--muted)]">
                <Thermometer className="h-3.5 w-3.5 text-[var(--text)]" /> Active Tiles
              </p>
              <p className="mt-2 text-3xl font-bold">{activeTiles}<span className="text-base text-[var(--faint)]"> / 30</span></p>
            </div>
            <div className="rounded-2xl border border-[var(--tint10)] bg-[var(--surface)] p-5 shadow-sm">
              <p className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-[var(--muted)]">
                <Zap className="h-3.5 w-3.5 text-[var(--text)]" /> Harvestable
              </p>
              <p className="mt-2 text-3xl font-bold">24.5<span className="text-base text-[var(--faint)]"> W</span></p>
            </div>
          </section>

          {/* Legend - color meaning indicator */}
          <section className="mt-6 rounded-3xl border border-[var(--tint10)] bg-[var(--surface)] p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Info className="h-4 w-4 text-[var(--text)]" />
              <h2 className="text-sm font-semibold">Color Legend · What each color means</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {SCALE.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-3 rounded-xl border border-[var(--tint10)] p-3"
                >
                  <span
                    className="h-8 w-8 shrink-0 rounded-lg"
                    style={{ background: s.color }}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-tight">{s.label}</p>
                    <p className="text-[11px] leading-tight text-[var(--muted)]">
                      {s.min}-{s.min + 19} psi · {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

                {/* Heatmap grid */}
          <section className="mt-6 rounded-3xl border border-[var(--tint10)] bg-[var(--surface)] p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold">
                Tile Pressure Field <span className="font-normal text-[var(--faint)]">(5 · 6 array)</span>
              </h2>
              <button
                type="button"
                className="flex items-center gap-1 text-xs font-medium text-[var(--soft)] hover:text-[var(--text)]"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Zoom out
              </button>
            </div>

            <div className="grid w-full grid-cols-5 gap-2 sm:gap-3">
              {grid.map((row, r) =>
                row.map((cell, c) => {
                  const stop = colorFor(cell.value);
                  return (
                    <div
                      key={`${r}-${c}`}
                      title={`Tile (${r},${c}) · ${cell.value} psi · ${stop.label}`}
                      style={{ background: stop.color, opacity: 0.55 + cell.value / 220 }}
                      className="group relative aspect-square w-full rounded-xl transition hover:scale-105 hover:opacity-100"
                    >
                      <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-bold text-white opacity-0 transition-opacity group-hover:opacity-100 sm:text-base">
                        {cell.value}
                      </span>
                    </div>
                  );
                }),
              )}
            </div>

            {/* Gradient bar + low/high labels */}
            <div className="mt-5 flex items-center gap-3">
              <span className="text-xs font-medium text-[var(--text)]">Low</span>
              <div
                className="h-3 flex-1 rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, #0a2a4a 0%, #3b5b7a 25%, #7d9cb8 50%, #f6c445 75%, #d97706 100%)",
                }}
              />
              <span className="text-xs font-medium text-[var(--text)]">High</span>
            </div>
          </section>

          <p className="mt-4 text-center text-xs text-[var(--faint)]">
            Data refreshes every 5s · pressure in psi per piezoelectric tile
          </p>
          </>
          )}
        </div>

        <BottomNav />
      </div>
    </div>
  );
}