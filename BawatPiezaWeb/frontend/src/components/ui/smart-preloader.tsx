"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

/**
 * SmartPreloader — a native (dependency-free) re-implementation of the Framer
 * "SmartPreloader" component, adapted for this Next.js app.
 *
 * Original module:
 *   https://framer.com/m/SmartPreloader-obmWs4.js@74hWOlRp08XotKDXxDIL
 * It depends on the Framer runtime ("framer" + "framer-motion"), which cannot
 * run outside Framer, so the behaviour/visuals are ported to plain React + CSS.
 *
 * Behaviour: a full-screen overlay hides the page and fills with a coloured
 * progress layer over `totalRevealMs` (after `startDelayMs`). Progress is warped
 * so it "hangs" around slowStep1/slowStep2 % to feel like real loading. When the
 * reveal completes the overlay fades out over `fadeMs`, revealing the page.
 */

type Direction = "bottom-to-top" | "left-to-right" | "top-to-bottom" | "right-to-left";
type CounterEffect = "none" | "default" | "sync";
type CounterPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
type EasingPreset = "cinematic" | "expo" | "custom";

export interface SmartPreloaderProps {
  direction?: Direction;
  overlayColor?: string;
  progressColor?: string;
  startDelayMs?: number;
  totalRevealMs?: number;
  fadeMs?: number;
  easing?: EasingPreset;
  bezierCurve?: string;
  counterEffect?: CounterEffect;
  counterColor?: string;
  counterFontSize?: string;
  counterPosition?: CounterPosition;
  counterPadding?: number;
  slowStep1?: number;
  slowStep2?: number;
  onComplete?: () => void;
}

type Bezier = { x1: number; y1: number; x2: number; y2: number };

/** Port of the original parseBezier(). */
function parseBezier(input?: string): Bezier | null {
  const raw = (input || "").trim();
  const m = raw.match(/cubic-bezier\(([^)]+)\)/i);
  const inner = (m ? m[1] : raw).replace(/\s+/g, "");
  const parts = inner
    .split(/[,\s]+/)
    .filter(Boolean)
    .map((v) => Number.parseFloat(v));
  if (parts.length >= 4 && parts.every((n) => Number.isFinite(n))) {
    return { x1: parts[0], y1: parts[1], x2: parts[2], y2: parts[3] };
  }
  return null;
}

/** Cubic-bezier easing evaluator (Newton-Raphson on x, then solve y). */
function cubicBezier({ x1, y1, x2, y2 }: Bezier) {
  const A = (a: number, b: number) => 1 - 3 * b + 3 * a;
  const B = (a: number, b: number) => 3 * b - 6 * a;
  const C = (a: number) => 3 * a;
  const calc = (t: number, a: number, b: number) => ((A(a, b) * t + B(a, b)) * t + C(a)) * t;
  const slope = (t: number, a: number, b: number) => 3 * A(a, b) * t * t + 2 * B(a, b) * t + C(a);
  const solveX = (x: number) => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const s = slope(t, x1, x2);
      if (s === 0) break;
      t -= (calc(t, x1, x2) - x) / s;
    }
    return Math.max(0, Math.min(1, t));
  };
  return (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : calc(solveX(t), y1, y2));
}

const EASING_PRESETS: Record<Exclude<EasingPreset, "custom">, Bezier> = {
  cinematic: { x1: 0.77, y1: 0, x2: 0.175, y2: 1 },
  expo: { x1: 0.16, y1: 1, x2: 0.3, y2: 1 },
};

function resolveEasing(easing: EasingPreset, bezierCurve?: string) {
  const bezier =
    easing === "custom"
      ? parseBezier(bezierCurve) ?? EASING_PRESETS.cinematic
      : EASING_PRESETS[easing];
  return cubicBezier(bezier);
}

/** Port of the original createSlowWarp(): slows progress near the given steps. */
function createSlowWarp(slowSteps: number[]) {
  const windowPct = 16;
  const slowFactor = 0.12;
  const half = windowPct / 2;
  const N = 200;
  const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
  const bump = (d: number) => {
    const ad = Math.abs(d);
    if (ad >= half) return 0;
    return 0.5 * (1 + Math.cos((Math.PI * ad) / half));
  };
  const speedAt = (pct: number) => {
    if (pct >= 100) return 1;
    if (!slowSteps.length) return 1;
    let influence = 0;
    for (const s of slowSteps) influence = Math.max(influence, bump(pct - s));
    return 1 - (1 - slowFactor) * clamp01(influence);
  };
  const timeAtPct = new Array<number>(N + 1);
  timeAtPct[0] = 0;
  let acc = 0;
  for (let i = 1; i <= N; i++) {
    const p0 = ((i - 1) / N) * 100;
    const p1 = (i / N) * 100;
    const mid = (p0 + p1) / 2;
    const sp = Math.max(1e-4, speedAt(mid));
    acc += (p1 - p0) / sp;
    timeAtPct[i] = acc;
  }
  const total = acc;
  return (tNorm: number) => {
    const t = Math.max(0, Math.min(1, tNorm));
    const target = t * total;
    let lo = 0;
    let hi = N;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (timeAtPct[mid] < target) lo = mid + 1;
      else hi = mid;
    }
    const i = Math.max(1, lo);
    const t0 = timeAtPct[i - 1];
    const t1 = timeAtPct[i];
    const alpha = t1 > t0 ? (target - t0) / (t1 - t0) : 0;
    return (i - 1 + alpha) / N;
  };
}

const DIRECTION_STYLES: Record<Direction, (p: number) => CSSProperties> = {
  "bottom-to-top": (p) => ({ transformOrigin: "center bottom", transform: `scaleY(${p})` }),
  "top-to-bottom": (p) => ({ transformOrigin: "center top", transform: `scaleY(${p})` }),
  "left-to-right": (p) => ({ transformOrigin: "left center", transform: `scaleX(${p})` }),
  "right-to-left": (p) => ({ transformOrigin: "right center", transform: `scaleX(${p})` }),
};

const COUNTER_STYLES: Record<CounterPosition, (padding: number) => CSSProperties> = {
  "top-left": (p) => ({ top: p, left: p }),
  "top-right": (p) => ({ top: p, right: p }),
  "bottom-left": (p) => ({ bottom: p, left: p }),
  "bottom-right": (p) => ({ bottom: p, right: p }),
  center: () => ({ inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }),
};

const SCROLL_KEYS = ["Space", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"];
const PRELOADER_MESSAGES = ["BawatPieza", "PiezoTechnology", "Dynamo"] as const;

export default function SmartPreloader({
  direction = "bottom-to-top",
  overlayColor = "#111111",
  progressColor = "#0099FF",
  startDelayMs = 200,
  totalRevealMs = 1600,
  fadeMs = 800,
  easing = "custom",
  bezierCurve = "0.83, 0, 0.17, 1",
  counterEffect = "sync",
  counterColor = "#FFFFFF",
  counterFontSize = "56px",
  counterPosition = "bottom-right",
  counterPadding = 40,
  slowStep1 = 27,
  slowStep2 = 82,
  onComplete,
}: SmartPreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [counter, setCounter] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [done, setDone] = useState(false);

  const ease = useMemo(() => resolveEasing(easing, bezierCurve), [easing, bezierCurve]);
  const slowWarp = useMemo(() => {
    const clampPct = (v: number) => Math.max(0, Math.min(100, Number.isFinite(v) ? v : 0));
    const steps = [clampPct(slowStep1), clampPct(slowStep2)]
      .filter((v) => v > 0 && v < 100)
      .sort((a, b) => a - b);
    return createSlowWarp(steps);
  }, [slowStep1, slowStep2]);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Drive the reveal (and then the exit) with requestAnimationFrame.
  useEffect(() => {
    let raf = 0;
    let exitTimer: ReturnType<typeof setTimeout> | undefined;
    const start = performance.now() + Math.max(0, startDelayMs);

    const tick = (now: number) => {
      const elapsed = now - start;
      if (elapsed < 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const tRaw = totalRevealMs > 0 ? Math.min(1, elapsed / totalRevealMs) : 1;
      const eased = ease(tRaw);
      const warped = slowWarp(eased);
      setProgress(warped);
      setCounter(Math.round((counterEffect === "sync" ? warped : eased) * 100));

      if (tRaw < 1) {
        raf = requestAnimationFrame(tick);
        return;
      }
      setProgress(1);
      setCounter(100);
      setExiting(true);
      exitTimer = setTimeout(() => {
        setDone(true);
        onCompleteRef.current?.();
      }, fadeMs);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      if (exitTimer) clearTimeout(exitTimer);
    };
  }, [ease, slowWarp, startDelayMs, totalRevealMs, fadeMs, counterEffect]);

  // Lock scrolling while the preloader is on screen.
  useEffect(() => {
    if (done) return;
    const body = document.body;
    const prevOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    const prevent = (e: Event) => e.preventDefault();
    const preventKeys = (e: KeyboardEvent) => {
      if (SCROLL_KEYS.includes(e.code)) e.preventDefault();
    };
    window.addEventListener("wheel", prevent, { passive: false });
    window.addEventListener("touchmove", prevent, { passive: false });
    window.addEventListener("keydown", preventKeys);

    return () => {
      body.style.overflow = prevOverflow;
      window.removeEventListener("wheel", prevent);
      window.removeEventListener("touchmove", prevent);
      window.removeEventListener("keydown", preventKeys);
    };
  }, [done]);

  if (done) return null;

  return (
    <div
      role="progressbar"
      aria-label="Loading"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={counter}
      className="fixed inset-0 z-[9999] overflow-hidden"
      style={{
        backgroundColor: overlayColor,
        opacity: exiting ? 0 : 1,
        transition: `opacity ${fadeMs}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        pointerEvents: exiting ? "none" : "auto",
      }}
    >
      <div
        className="absolute inset-0 will-change-transform"
        style={{ backgroundColor: progressColor, ...DIRECTION_STYLES[direction](progress) }}
      />
      <div
        className="absolute left-0 top-1/2 flex -translate-y-1/2 flex-col gap-2 px-8 sm:px-12"
        style={{ color: counterColor }}
      >
        {PRELOADER_MESSAGES.map((preloaderMessage, index) => (
          <span
            key={preloaderMessage}
            className="preloader-message-glide block font-semibold"
            style={{
              animationDelay: `${index * 120}ms`,
              fontSize: "clamp(2.5rem, 7vw, 7rem)",
              letterSpacing: "0",
              lineHeight: 0.95,
            }}
          >
            {preloaderMessage}
          </span>
        ))}
      </div>
      {counterEffect !== "none" && (
        <div
          className="absolute font-semibold tabular-nums"
          style={{
            ...COUNTER_STYLES[counterPosition](counterPadding),
            color: counterColor,
            fontSize: counterFontSize,
            letterSpacing: "0",
            lineHeight: 1,
          }}
        >
          {counter}%
        </div>
      )}
    </div>
  );
}

