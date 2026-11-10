"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Footprints, Zap } from "lucide-react";

/* =====================================================================
   BawatPieza hero: scroll-driven 3D tile (pure SVG + CSS 3D, no video)

   Scroll timeline, 0 → 1 across the pinned runway.
   The red hero background never changes; only the tile moves.
   ===================================================================== */
const T = {
  copyOut: [0.06, 0.16], // headline, quote, stats fade away
  wordmarkOut: [0.08, 0.2], // BAWATPIEZA fades + drifts
  zoom: [0.08, 0.28], // tile zooms in a little and re-centres
  open: [0.18, 0.58], // top plate lifts, internals rise apart
  labelIn: [0.38, 0.47], // PIEZO / DYNAMO callouts draw in while it opens
  labelOut: [0.62, 0.67], // callouts leave as the circle starts
  bgWordsIn: [0.2, 0.42], // PIEZO / DYNAMO background wordmarks rise in behind the opening tile
  bgWordsOut: [0.6, 0.67], // and leave as the circle starts
  dotIn: [0.62, 0.68], // small circle appears at the centre of the tile
  grow: [0.68, 0.92], // circle grows until it fills the screen; the last 8% is a short hold so the next section is already on screen
} as const;

/* The circle fills with the Accumulated Generation section's own background,
   so the hand-off to that section has no visible seam. Keep in sync with
   .generation-section { background } in globals.css. */
const REVEAL_BG = "#26384b";

/* ---------- footstep mask ----------
   The reveal is a footprint instead of a circle. It is drawn in a 130-unit box
   (viewBox -15 -15 130 130) and tilted FOOT_TILT degrees. The foot has a big
   inscribed ellipse (the sole), which is what the "cover the whole screen"
   maths below uses. */
const FOOT_TILT = -14;
const FOOT_VB = 130;
const FOOT_CX = (56 + 15) / FOOT_VB; // sole centre, as a fraction of the box
const FOOT_CY = (62 + 15) / FOOT_VB;
const FOOT_A = 13 / FOOT_VB; // inscribed sole ellipse, half-width
const FOOT_B = 28 / FOOT_VB; // inscribed sole ellipse, half-height
const FOOT_START = 46; // px: size of the first small print at the tile centre
const FOOT_SVG =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='-15 -15 130 130'><g fill='#000' transform='rotate(${FOOT_TILT} 56 62)'>` +
      `<ellipse cx='40' cy='13' rx='7.5' ry='8.5'/><ellipse cx='54' cy='11' rx='5.2' ry='6.3'/>` +
      `<ellipse cx='64' cy='15' rx='4.6' ry='5.6'/><ellipse cx='72' cy='22' rx='4.2' ry='5'/>` +
      `<ellipse cx='78' cy='31' rx='3.8' ry='4.6'/>` +
      `<ellipse cx='53' cy='44' rx='24' ry='20'/><ellipse cx='58' cy='62' rx='17' ry='20'/>` +
      `<ellipse cx='56' cy='80' rx='17' ry='15'/></g></svg>`,
  );

/** Box size (px) at which the foot's sole alone covers the whole viewport from (cx, cy). */
function footCoverSize(cx: number, cy: number, vw: number, vh: number) {
  const t = (-FOOT_TILT * Math.PI) / 180;
  const cos = Math.cos(t);
  const sin = Math.sin(t);
  let need = 0;
  for (const dx of [-cx, vw - cx]) {
    for (const dy of [-cy, vh - cy]) {
      const lx = dx * cos - dy * sin;
      const ly = dx * sin + dy * cos;
      need = Math.max(need, Math.hypot(lx / FOOT_A, ly / FOOT_B));
    }
  }
  return need * 1.04;
}

/** Show `el` through the footprint mask, size B px, sole centred on (cx, cy). */
function paintFoot(el: HTMLElement, B: number, cx: number, cy: number, off = false) {
  if (B <= 0) {
    el.style.visibility = "hidden";
    return;
  }
  el.style.visibility = "visible";
  const set = (k: string, v: string) => {
    el.style.setProperty(k, v);
    el.style.setProperty(`-webkit-${k}`, v);
  };
  if (off) {
    set("mask-image", "none"); // fully covered: no mask needed
    return;
  }
  set("mask-image", `url("${FOOT_SVG}")`);
  set("mask-repeat", "no-repeat");
  set("mask-size", `${B.toFixed(1)}px ${B.toFixed(1)}px`);
  set("mask-position", `${(cx - FOOT_CX * B).toFixed(1)}px ${(cy - FOOT_CY * B).toFixed(1)}px`);
}

/* How "weighty" the scroll feels. Higher = snappier, lower = floatier. */
const SMOOTHING = 9;

/* ---------- tile geometry (scene units, px at scale 1) ---------- */
const S = 360; // tile footprint (square)
const WALL = 16; // wall thickness
const H = 72; // wall height

/* Z positions [closed, open] for every layer that separates. */
export const Z = {
  frame: [10, 34],
  mech: [22, 104],
  copper: [66, 216],
  plate: [72, 336],
} as const;

/* Camera: low and level, like a product shot (rotateX 90° would be side-on, 0° bird's-eye). */
export const TILT = 70; // degrees; elevation above the floor = 90 - TILT
export const YAW: readonly [number, number] = [-34, -26];

/* ---------- helpers ---------- */
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const range = (p: number, [a, b]: readonly [number, number]) => clamp01((p - a) / (b - a));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const zOf = (pair: readonly [number, number], t: number) => lerp(pair[0], pair[1], t);

/* ---------- 3D building blocks ---------- */
type CubeProps = {
  w: number; // x size
  d: number; // y size
  h: number; // z size
  x?: number; // centre x
  y?: number; // centre y
  z?: number; // bottom z
  m: string; // material class
  front?: React.ReactNode; // optional art on the front face
};

/** A box made of five flat faces. Faces facing away are culled, so it stays cheap. */
function Cube({ w, d, h, x = 0, y = 0, z = 0, m, front }: CubeProps) {
  return (
    <div className={`t3-cube ${m}`} style={{ transform: `translate3d(${x - w / 2}px, ${y - d / 2}px, ${z}px)` }}>
      <div className="t3-f t3-top" style={{ width: w, height: d, transform: `translateZ(${h}px)` }} />
      <div
        className="t3-f t3-front"
        style={{ width: w, height: h, top: d, transform: `translateZ(${h}px) rotateX(-90deg)` }}
      >
        {front}
      </div>
      <div className="t3-f t3-back" style={{ width: w, height: h, top: 0, transform: "rotateX(90deg)" }} />
      <div className="t3-f t3-left" style={{ width: h, height: d, transform: "rotateY(-90deg)" }} />
      <div
        className="t3-f t3-right"
        style={{ width: h, height: d, left: w, transform: `translateZ(${h}px) rotateY(90deg)` }}
      />
    </div>
  );
}

/**
 * A true round part built from n flat facets, each lit by its angle to the light.
 * tone = [hue, saturation %, lightness %, lightness swing %].
 */
function Cyl({
  r,
  h,
  n = 14,
  x = 0,
  y = 0,
  z = 0,
  axis = "z",
  tone,
  phase = 2.4,
  capTone,
}: {
  r: number;
  h: number;
  n?: number;
  x?: number;
  y?: number;
  z?: number;
  axis?: "z" | "x";
  tone: [number, number, number, number];
  phase?: number;
  capTone?: string;
}) {
  const [hue, sat, l, amp] = tone;
  const w = 2 * r * Math.sin(Math.PI / n) + 0.8;
  const rot = axis === "x" ? " rotateY(90deg)" : "";
  const ox = axis === "x" ? x - h / 2 : x;
  const oz = axis === "x" ? z + r : z;
  return (
    <div className="t3-cube" style={{ transform: `translate3d(${ox}px, ${y}px, ${oz}px)${rot}` }}>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        const light = Math.cos(a - phase);
        return (
          <div key={i} className="t3-cube" style={{ transform: `rotateZ(${((a * 180) / Math.PI).toFixed(2)}deg)` }}>
            <div
              className="t3-f t3-cyl"
              style={{
                width: w,
                height: h,
                left: -w / 2,
                top: -r,
                transform: "rotateX(90deg)",
                backgroundColor: `hsl(${hue} ${sat}% ${(l + amp * light).toFixed(1)}%)`,
              }}
            />
          </div>
        );
      })}
      <div
        className="t3-f t3-cap"
        style={{
          width: 2 * r,
          height: 2 * r,
          left: -r,
          top: -r,
          transform: `translateZ(${h}px)`,
          background: capTone ?? `radial-gradient(circle at 38% 34%, hsl(${hue} ${sat}% ${l + amp}%), hsl(${hue} ${sat}% ${l - amp}%))`,
        }}
      />
    </div>
  );
}

/** Two crossed upright planes. Reads as a round rod or spring from any angle. */
function Stand({
  w,
  h,
  x = 0,
  y = 0,
  z = 0,
  bg,
  children,
}: {
  w: number;
  h: number;
  x?: number;
  y?: number;
  z?: number;
  bg?: string;
  children?: React.ReactNode;
}) {
  const face = (
    <div
      className="t3-f t3-two"
      style={{ width: w, height: h, left: -w / 2, top: 0, transform: "rotateX(90deg)", background: bg }}
    >
      {children}
    </div>
  );
  return (
    <div className="t3-cube" style={{ transform: `translate3d(${x}px, ${y}px, ${z}px)` }}>
      {face}
      <div className="t3-cube" style={{ transform: "rotateZ(90deg)" }}>
        {face}
      </div>
    </div>
  );
}

/** A flat plane lying in the XY plane, centred on the group origin. */
function Plane({
  size,
  z = 0,
  className = "",
  style,
  children,
}: {
  size: number;
  z?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`t3-plane ${className}`}
      style={{ width: size, height: size, transform: `translate3d(${-size / 2}px, ${-size / 2}px, ${z}px)`, ...style }}
    >
      {children}
    </div>
  );
}

function gearPath(cx: number, cy: number, teeth: number, ro: number, ri: number) {
  const step = (Math.PI * 2) / teeth;
  const pts: string[] = [];
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const seg: [number, number][] = [
      [ri, a - step * 0.3],
      [ro, a - step * 0.15],
      [ro, a + step * 0.15],
      [ri, a + step * 0.3],
    ];
    seg.forEach(([rr, ang]) => pts.push(`${(cx + Math.cos(ang) * rr).toFixed(2)},${(cy + Math.sin(ang) * rr).toFixed(2)}`));
  }
  return `M${pts.join("L")}Z`;
}
const GEAR_D = gearPath(60, 60, 20, 57, 48);

/* copper piezo discs: [cx, cy, r] */
const DISCS: [number, number, number][] = [
  [150, 150, 42],
  ...Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    return [150 + Math.cos(a) * 84, 150 + Math.sin(a) * 84, 31] as [number, number, number];
  }),
  ...Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 + 0.3 + Math.PI / 6;
    return [150 + Math.cos(a) * 126, 150 + Math.sin(a) * 126, 21] as [number, number, number];
  }),
];

const ROD_BG = "linear-gradient(90deg, #2a2d33 0%, #aeb5bd 22%, #f3f5f7 38%, #8b929b 62%, #2b2e34 100%)";
const STEEL_TONE: [number, number, number, number] = [212, 7, 52, 30];
const MOTOR_TONE: [number, number, number, number] = [214, 9, 33, 24];

function SpringArt() {
  return (
    <svg viewBox="0 0 30 64" width="100%" height="100%" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="t3-spr" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2f4f6" />
          <stop offset="0.5" stopColor="#9aa2ab" />
          <stop offset="1" stopColor="#3a3f46" />
        </linearGradient>
      </defs>
      {Array.from({ length: 9 }, (_, i) => {
        const y = 4 + i * 6.5;
        return (
          <g key={i}>
            <path d={`M3 ${y} L27 ${y + 5}`} stroke="#23262b" strokeWidth="3.4" strokeLinecap="round" fill="none" opacity="0.7" />
            <path d={`M3 ${y + 5} L27 ${y}`} stroke="url(#t3-spr)" strokeWidth="3.4" strokeLinecap="round" fill="none" />
          </g>
        );
      })}
    </svg>
  );
}

const CORNERS: [number, number][] = [
  [-146, -146],
  [146, -146],
  [-146, 146],
  [146, 146],
];

export function TileModel() {
  return (
    <>
      {/* ground shadow */}
      <Plane size={780} z={-2} className="t3-shadow" />

      {/* ---------- base tray ---------- */}
      <Cube w={S} d={S} h={8} m="m-shell" />
      <Cube
        w={S}
        d={WALL}
        h={H}
        y={S / 2 - WALL / 2}
        m="m-shell"
        front={
          <svg viewBox={`0 0 ${S} ${H}`} width="100%" height="100%" aria-hidden="true">
            <defs>
              <radialGradient id="t3-bolt" cx="38%" cy="34%" r="70%">
                <stop offset="0" stopColor="#f2f5f8" />
                <stop offset="0.5" stopColor="#838a93" />
                <stop offset="1" stopColor="#25282d" />
              </radialGradient>
            </defs>
            <circle cx="112" cy="38" r="8" fill="url(#t3-bolt)" />
            <circle cx="222" cy="38" r="8" fill="url(#t3-bolt)" />
          </svg>
        }
      />
      <Cube w={S} d={WALL} h={H} y={-S / 2 + WALL / 2} m="m-shell" />
      <Cube w={WALL} d={S - WALL * 2} h={H} x={-S / 2 + WALL / 2} m="m-shell" />
      <Cube w={WALL} d={S - WALL * 2} h={H} x={S / 2 - WALL / 2} m="m-shell" />

      {/* rubber matting on the tray floor */}
      <Plane size={S - WALL * 2} z={8.3} className="t3-rubber" />
      {/* warm glow + the plate's shadow, both fade in as the tile opens */}
      <div
        data-role="glow"
        className="t3-plane t3-glow"
        style={{
          width: S - WALL * 2,
          height: S - WALL * 2,
          transform: `translate3d(${-(S - WALL * 2) / 2}px, ${-(S - WALL * 2) / 2}px, 8.8px)`,
        }}
      />
      <div
        data-role="shade"
        className="t3-plane t3-shade"
        style={{
          width: S - WALL * 2,
          height: S - WALL * 2,
          transform: `translate3d(${-(S - WALL * 2) / 2}px, ${-(S - WALL * 2) / 2}px, 9.2px)`,
        }}
      />

      {/* ---------- chrome guide rods (stretch as the plate lifts) ---------- */}
      {CORNERS.map(([px, py]) => (
        <div key={`rod${px}${py}`} data-role="rod" className="t3-group" style={{ transform: "translate3d(0,0,8px)" }}>
          <Stand w={9} h={100} x={px} y={py} bg={ROD_BG} />
        </div>
      ))}

      {/* ---------- lower aluminium frame ---------- */}
      <div data-role="frame" className="t3-group">
        <Cube w={252} d={14} h={10} y={-112} m="m-alu" />
        <Cube w={252} d={14} h={10} y={112} m="m-alu" />
        <Cube w={14} d={238} h={10} x={-112} m="m-alu" />
        <Cube w={14} d={238} h={10} x={112} m="m-alu" />
        {[
          [-112, -112],
          [112, -112],
          [-112, 112],
          [112, 112],
        ].map(([bx, by]) => (
          <Cube key={`b${bx}${by}`} w={28} d={28} h={18} x={bx} y={by} m="m-block" />
        ))}
      </div>

      {/* ---------- mechanism: guides, dynamos, bevel gear ---------- */}
      <div data-role="mech" className="t3-group">
        <Cube w={236} d={10} h={6} y={-62} m="m-steel" />
        <Cube w={236} d={10} h={6} y={62} m="m-steel" />
        <Cube w={10} d={236} h={6} x={-62} z={6.5} m="m-steel" />
        <Cube w={10} d={236} h={6} x={62} z={6.5} m="m-steel" />
        <Cyl r={13} h={86} n={14} x={-88} y={-14} z={13} axis="x" tone={MOTOR_TONE} phase={2.6} />
        <Cyl r={13} h={86} n={14} x={88} y={20} z={13} axis="x" tone={MOTOR_TONE} phase={2.6} />
        {/* motor end flanges */}
        <Cube w={6} d={30} h={26} x={-134} y={-14} z={13} m="m-block" />
        <Cube w={6} d={30} h={26} x={134} y={20} z={13} m="m-block" />
        {/* gear: two slices give it thickness */}
        <div data-role="gear" className="t3-gear">
          <svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true">
            <defs>
              <linearGradient id="t3-gearfill" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#eef1f4" />
                <stop offset="0.5" stopColor="#8a929c" />
                <stop offset="1" stopColor="#363b42" />
              </linearGradient>
            </defs>
            <path d={GEAR_D} fill="url(#t3-gearfill)" stroke="#1f2227" strokeWidth="1.6" strokeLinejoin="round" />
            <circle cx="60" cy="60" r="36" fill="none" stroke="#1f2227" strokeWidth="2" opacity="0.55" />
            <circle cx="60" cy="60" r="22" fill="#2a2e34" />
            <circle cx="60" cy="60" r="9" fill="#c9cfd6" />
          </svg>
        </div>
        <div data-role="gear2" className="t3-gear t3-gear-under" />
      </div>

      {/* central spindle linking gear → copper discs */}
      <div data-role="spindle" className="t3-group">
        <Stand w={11} h={60} bg={ROD_BG} />
      </div>

      {/* ---------- copper piezo discs (thick: three slices) ---------- */}
      <div data-role="copper" className="t3-group">
        {[0, -1.6, -3.2].map((dz, idx) => (
          <Plane key={dz} size={300} z={dz} style={idx ? { filter: `brightness(${1 - idx * 0.32})` } : undefined}>
            <svg viewBox="0 0 300 300" width="100%" height="100%" aria-hidden="true">
              <defs>
                <radialGradient id="t3-copper" cx="36%" cy="32%" r="78%">
                  <stop offset="0" stopColor="#ffd2ac" />
                  <stop offset="0.45" stopColor="#dd8a55" />
                  <stop offset="1" stopColor="#74391a" />
                </radialGradient>
              </defs>
              {idx === 0 && (
                <path
                  d="M150 150 C 190 112, 232 92, 266 60"
                  fill="none"
                  stroke="#ece4da"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.85"
                />
              )}
              {DISCS.map(([cx, cy, r], i) => (
                <g key={i}>
                  <circle cx={cx} cy={cy} r={r} fill="url(#t3-copper)" stroke="#51250e" strokeWidth="1.5" />
                  {idx === 0 && <circle cx={cx} cy={cy} r={r * 0.3} fill="#4a210b" opacity="0.5" />}
                  {idx === 0 && <ellipse cx={cx - r * 0.3} cy={cy - r * 0.35} rx={r * 0.34} ry={r * 0.18} fill="#fff" opacity="0.22" />}
                </g>
              ))}
            </svg>
          </Plane>
        ))}
      </div>

      {/* ---------- top plate + the springs that hang under it ---------- */}
      <div data-role="plate" className="t3-group">
        {CORNERS.map(([px, py]) => (
          <Stand key={`sp${px}${py}`} w={40} h={84} x={px} y={py} z={-82}>
            <SpringArt />
          </Stand>
        ))}
        <Cube w={S + 8} d={S + 8} h={12} m="m-plate-low" />
        <Cube w={S - 4} d={S - 4} h={16} z={12.1} m="m-plate" />
      </div>
    </>
  );
}

/* `children` is the next section (Accumulated Generation). It lives INSIDE the
   circle, so it is revealed by the circle itself and is already on screen when
   the circle is full: no extra scroll needed to reach it. */
export default function HeroTileScroll({ children }: { children?: ReactNode }) {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  const runwayRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const bgWordsRef = useRef<HTMLDivElement>(null);
  const bgPiezoRef = useRef<HTMLSpanElement>(null);
  const bgDynamoRef = useRef<HTMLSpanElement>(null);
  const quoteRef = useRef<HTMLParagraphElement>(null);
  const overviewMetricsRef = useRef<HTMLDivElement>(null);
  const technologyRef = useRef<HTMLDivElement>(null);
  const generationCountRef = useRef<HTMLSpanElement>(null);
  const footstepCountRef = useRef<HTMLSpanElement>(null);
  const camRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const piezoRef = useRef<HTMLDivElement>(null);
  const dynamoRef = useRef<HTMLDivElement>(null);
  const piezoLineRef = useRef<SVGGElement>(null);
  const dynamoLineRef = useRef<SVGGElement>(null);
  const irisRingRef = useRef<HTMLDivElement>(null);
  const irisRef = useRef<HTMLDivElement>(null);

  /* live stats count-up (unchanged) */
  useEffect(() => {
    const generation = generationCountRef.current;
    const footsteps = footstepCountRef.current;
    if (!generation || !footsteps) return;

    const finalGeneration = 42.8;
    const finalFootsteps = 1248;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      generation.textContent = finalGeneration.toFixed(1);
      footsteps.textContent = finalFootsteps.toLocaleString();
      return;
    }

    let frameId = 0;
    const startedAt = performance.now();
    const duration = 1800;
    const count = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      generation.textContent = (finalGeneration * eased).toFixed(1);
      footsteps.textContent = Math.round(finalFootsteps * eased).toLocaleString();
      if (progress < 1) frameId = requestAnimationFrame(count);
    };

    frameId = requestAnimationFrame(count);
    return () => cancelAnimationFrame(frameId);
  }, []);

  /* scroll-driven tile */
  useEffect(() => {
    const runway = runwayRef.current;
    const pin = pinRef.current;
    const cam = camRef.current;
    const scene = sceneRef.current;
    if (!runway || !pin || !cam || !scene) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // grab animated layers once; no DOM queries inside the frame loop
    const one = (role: string) => scene.querySelector<HTMLElement>(`[data-role="${role}"]`);
    const plate = one("plate");
    const copper = one("copper");
    const mech = one("mech");
    const frame = one("frame");
    const spindle = one("spindle");
    const glow = one("glow");
    const gear = one("gear");
    const gear2 = one("gear2");
    const shade = one("shade");
    const rods = Array.from(scene.querySelectorAll<HTMLElement>('[data-role="rod"]'));
    const labels = labelsRef.current;
    const piezo = piezoRef.current;
    const dynamo = dynamoRef.current;
    const piezoLine = piezoLineRef.current;
    const dynamoLine = dynamoLineRef.current;
    const iris = irisRef.current;
    const irisRing = irisRingRef.current;
    const navReveal = document.querySelector<HTMLElement>("[data-nav-reveal]"); // top bar paints through the same footprint
    const fades = [copyRef.current, quoteRef.current, overviewMetricsRef.current, technologyRef.current];

    /* camera framing, recomputed on resize */
    let restScale = 1;
    let openScale = 1;
    let restY = 0;
    let openY = 0;
    let vw = 1;
    let vh = 1;
    let persp = 2400;
    const measure = () => {
      const W = pin.clientWidth;
      const Hh = pin.clientHeight;
      vw = W;
      vh = Hh;
      persp = window.innerWidth <= 640 ? 2800 : 2400;
      labels?.classList.toggle("is-compact", W < 640);
      // measured at scale 1 (perspective included):
      //   closed ≈ 517 wide, spans y -181 → +119 around the scene origin
      //   open   ≈ 530 wide, spans y -411 → +114
      restScale = Math.min(Math.min(W * 0.95, 832) / 517, (Hh * 0.42) / 300);
      openScale = Math.max(restScale, Math.min((Hh - 130) / 525, (W * 0.92) / 530));
      restY = Hh * 0.45 - 119 * restScale; // closed tile sits at the bottom of the hero
      openY = 26 + 148 * openScale; // open tile is centred below the nav
    };

    const readTarget = () => {
      const rect = runway.getBoundingClientRect();
      const distance = Math.max(1, runway.offsetHeight - pin.offsetHeight);
      return clamp01(-rect.top / distance);
    };

    const apply = (p: number) => {
      /* camera: gentle zoom + re-centre, then slow yaw while opening */
      const z = easeInOut(range(p, T.zoom));
      const o = range(p, T.open);
      const s = lerp(restScale, openScale, z);
      const y = lerp(restY, openY, z);
      cam.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0) scale3d(${s.toFixed(4)}, ${s.toFixed(4)}, ${s.toFixed(4)})`;
      scene.style.transform = `rotateX(${TILT}deg) rotateZ(${lerp(YAW[0], YAW[1], smooth(o)).toFixed(3)}deg)`;

      const yawDeg = lerp(YAW[0], YAW[1], smooth(o));

      /* project a scene point to pin pixels (same math the browser uses) */
      const project = (px: number, py: number, pz: number): [number, number] => {
        const yw = (yawDeg * Math.PI) / 180;
        const tl = (TILT * Math.PI) / 180;
        const x1 = px * Math.cos(yw) - py * Math.sin(yw);
        const y1 = px * Math.sin(yw) + py * Math.cos(yw);
        const y2 = y1 * Math.cos(tl) - pz * Math.sin(tl);
        const z2 = y1 * Math.sin(tl) + pz * Math.cos(tl);
        const f = persp / (persp - z2 * s);
        return [vw / 2 + x1 * s * f, 0.45 * vh + (y2 * s + y + 0.05 * vh) * f];
      };

      /* layers separate in a stagger: plate first, frame last */
      const tPlate = easeInOut(range(o, [0, 0.55]));
      const tCopper = easeInOut(range(o, [0.12, 0.75]));
      const tMech = easeInOut(range(o, [0.28, 0.92]));
      const tFrame = easeInOut(range(o, [0.4, 1]));

      const zPlate = zOf(Z.plate, tPlate);
      const zCopper = zOf(Z.copper, tCopper);
      const zMech = zOf(Z.mech, tMech);
      const zFrame = zOf(Z.frame, tFrame);

      if (plate) plate.style.transform = `translate3d(0,0,${zPlate.toFixed(2)}px)`;
      if (copper) copper.style.transform = `translate3d(0,0,${zCopper.toFixed(2)}px)`;
      if (mech) mech.style.transform = `translate3d(0,0,${zMech.toFixed(2)}px)`;
      if (frame) frame.style.transform = `translate3d(0,0,${zFrame.toFixed(2)}px)`;
      const spin = (o * 200).toFixed(2);
      if (gear) gear.style.transform = `translate3d(-45px,-45px,15px) rotateZ(${spin}deg)`;
      if (gear2) gear2.style.transform = `translate3d(-44px,-44px,13px) rotateZ(${spin}deg)`;

      // spindle bridges gear → copper discs
      if (spindle) {
        const base = zMech + 16;
        const k = Math.max(0.05, (zCopper - base) / 60);
        spindle.style.transform = `translate3d(0,0,${base.toFixed(2)}px) scale3d(1,1,${k.toFixed(4)})`;
      }
      // guide rods stretch from the tray floor up to the plate
      const kRod = Math.max(0.05, (zPlate - 8) / 100);
      const rodT = `translate3d(0,0,8px) scale3d(1,1,${kRod.toFixed(4)})`;
      for (const el of rods) el.style.transform = rodT;

      if (glow) glow.style.opacity = smooth(range(o, [0.05, 0.5])).toFixed(3);
      if (shade) shade.style.opacity = (0.62 * smooth(range(o, [0, 0.35]))).toFixed(3);

      /* overview copy fades up and away */
      const c = range(p, T.copyOut);
      const fadeT = `translate3d(0, ${(-c * 40).toFixed(2)}px, 0)`;
      for (const el of fades) {
        if (!el) continue;
        el.style.opacity = String(1 - c);
        el.style.transform = fadeT;
      }
      const w = range(p, T.wordmarkOut);
      if (wordmarkRef.current) {
        wordmarkRef.current.style.opacity = String(1 - w);
        wordmarkRef.current.style.transform = `translate3d(-50%, ${(-w * 60).toFixed(2)}px, 0) scale(${(1 + w * 0.12).toFixed(4)})`;
      }

      /* PIEZO / DYNAMO background wordmarks: same look as the BAWATPIEZA mark,
         they rise in from opposite sides behind the opening tile */
      const bgIn = smooth(range(p, T.bgWordsIn));
      const bgOut = 1 - smooth(range(p, T.bgWordsOut));
      if (bgWordsRef.current) bgWordsRef.current.style.opacity = (bgIn * bgOut).toFixed(3);
      if (bgPiezoRef.current) bgPiezoRef.current.style.transform = `translate3d(${((1 - bgIn) * -80).toFixed(1)}px, ${((1 - bgIn) * 40 - o * 30).toFixed(1)}px, 0)`;
      if (bgDynamoRef.current) bgDynamoRef.current.style.transform = `translate3d(${((1 - bgIn) * 80).toFixed(1)}px, ${((1 - bgIn) * -40 + o * 30).toFixed(1)}px, 0)`;

      /* PIEZO / DYNAMO callouts follow the real parts as they rise */
      const lIn = smooth(range(p, T.labelIn));
      const lOut = 1 - smooth(range(p, T.labelOut));
      const lVis = lIn * lOut;
      if (labels) labels.style.opacity = lVis.toFixed(3);
      if (lVis > 0.001 && piezo && dynamo && piezoLine && dynamoLine) {
        const reach = vw < 640 ? vw : Math.min(Math.max(vw * 0.17, 84), 230);
        const place = (
          lineEl: SVGGElement,
          labelEl: HTMLElement,
          anchor: [number, number],
          dir: 1 | -1,
        ) => {
          const ex = Math.min(vw - 14, Math.max(14, anchor[0] + dir * reach));
          const ex2 = lerp(anchor[0], ex, lIn);
          const line = lineEl.children[0] as SVGLineElement;
          const dot = lineEl.children[1] as SVGCircleElement;
          line.setAttribute("x1", anchor[0].toFixed(1));
          line.setAttribute("y1", anchor[1].toFixed(1));
          line.setAttribute("x2", ex2.toFixed(1));
          line.setAttribute("y2", anchor[1].toFixed(1));
          dot.setAttribute("cx", anchor[0].toFixed(1));
          dot.setAttribute("cy", anchor[1].toFixed(1));
          labelEl.style.transform = `translate3d(${ex.toFixed(1)}px, ${anchor[1].toFixed(1)}px, 0)`;
        };
        place(piezoLine, piezo, project(80, 25, zCopper + 2), 1);
        place(dynamoLine, dynamo, project(-112, -14, zMech + 26), -1);
      }

      /* footprint: starts as a small print at the centre of the tile, then grows until its sole
         covers the screen (top bar included). Geometric growth keeps the shape readable for longer. */
      if (iris && irisRing) {
        const [cx, cy] = project(0, 0, (zMech + zCopper) / 2);
        const dotB = FOOT_START * smooth(range(p, T.dotIn));
        const g = easeInOut(range(p, T.grow));
        const endB = footCoverSize(cx, cy, vw, vh);
        const full = g >= 0.999;
        const B = dotB <= 0 ? 0 : full ? endB : dotB * Math.pow(endB / dotB, g);
        paintFoot(iris, B, cx, cy, full);
        paintFoot(irisRing, full ? 0 : B * 1.07 + 10, cx, cy);
        // once the footprint covers the screen, the section inside it becomes clickable
        iris.style.pointerEvents = full ? "auto" : "none";
        if (navReveal) {
          paintFoot(navReveal, B, cx, cy, full);
          // the bar goes back to the brand gradient once the section has scrolled past it
          const bottom = runway.getBoundingClientRect().bottom;
          navReveal.style.opacity = clamp01((bottom - 30) / 34).toFixed(3);
        }
      }
    };

    measure();

    if (reduceMotion) {
      // static, closed tile; CSS collapses the runway
      apply(0);
      cam.style.opacity = "1";
      const onResizeStatic = () => {
        measure();
        apply(0);
      };
      window.addEventListener("resize", onResizeStatic);
      return () => window.removeEventListener("resize", onResizeStatic);
    }

    let rafId = 0;
    let shown = readTarget();
    let lastTs = 0;

    /* Frame-rate independent smoothing: same feel at 60, 120 or 144 Hz. */
    const tick = (ts: number) => {
      const dt = lastTs ? Math.min(0.05, (ts - lastTs) / 1000) : 1 / 60;
      lastTs = ts;
      const target = readTarget(); // read first, then write: no layout thrash
      shown += (target - shown) * (1 - Math.exp(-dt * SMOOTHING));
      if (Math.abs(target - shown) < 0.00025) shown = target;
      apply(shown);
      if (shown !== target) {
        rafId = requestAnimationFrame(tick);
      } else {
        rafId = 0;
        lastTs = 0;
      }
    };
    const kick = () => {
      if (!rafId) rafId = requestAnimationFrame(tick);
    };
    const onResize = () => {
      measure();
      kick();
    };

    apply(shown);
    cam.style.opacity = "1"; // reveal after the first correct placement (no jump)

    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(pin);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
  }, []);

  return (
    <>
    <section id="about" ref={runwayRef} className="hero-runway">
      <div
        ref={pinRef}
        className="hero-section hero-pin relative flex items-center overflow-hidden px-4 pb-14 pt-20 sm:px-6 lg:px-8 lg:pt-16"
      >
        <div ref={wordmarkRef} className="hero-wordmarks" aria-hidden="true">
          <span>BAWATPIEZA</span>
        </div>
        <div ref={bgWordsRef} className="t3-bgwords" aria-hidden="true">
          <span ref={bgPiezoRef} className="t3-bgword t3-bgword-piezo">PIEZO</span>
          <span ref={bgDynamoRef} className="t3-bgword t3-bgword-dynamo">DYNAMO</span>
        </div>
        <div ref={technologyRef} className="hero-technology">
          <span className="hero-technology-kicker">Energy harvesting system</span>
          <strong>Piezo + Dynamo Technology</strong>
          <p>Two harvesting paths convert every footstep into usable energy.</p>
        </div>
        <p ref={quoteRef} className="hero-quote quote-text shiny-quote">
          Turn every footstep<br />
          into forward motion.
        </p>

        {/* 3D tile: closed at rest, zooms a little, then opens as you scroll */}
        <div className="t3-stage" role="img" aria-label="BawatPieza kinetic energy tile opening to show its piezo and dynamo parts">
          <div ref={camRef} className="t3-cam">
            <div ref={sceneRef} className="t3-scene">
              <TileModel />
            </div>
          </div>
        </div>

        {/* PIEZO / DYNAMO callouts */}
        <div ref={labelsRef} className="t3-labels" aria-hidden="true">
          <svg className="t3-leaders" width="100%" height="100%">
            <g ref={piezoLineRef}>
              <line stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" />
              <circle r="4.5" fill="#fff" stroke="#ff8c28" strokeWidth="2" />
            </g>
            <g ref={dynamoLineRef}>
              <line stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" />
              <circle r="4.5" fill="#fff" stroke="#ff8c28" strokeWidth="2" />
            </g>
          </svg>
          <div ref={piezoRef} className="t3-label t3-label-r">
            <div className="t3-label-in">
              <strong>PIEZO</strong>
              <span>Discs capture the sharp footstep strike</span>
            </div>
          </div>
          <div ref={dynamoRef} className="t3-label t3-label-l">
            <div className="t3-label-in">
              <strong>DYNAMO</strong>
              <span>Generator captures the slower spring-back</span>
            </div>
          </div>
        </div>

        {/* circle transition into Accumulated Generation */}
        <div ref={irisRingRef} className="t3-iris-ring" aria-hidden="true" />
        {!reduced && (
          <div ref={irisRef} className="t3-iris" style={{ background: REVEAL_BG }}>
            {children}
          </div>
        )}

        <div ref={copyRef} className="hero-copy">
          <span className="hero-kicker">KINETIC ENERGY / BAWATPIEZA</span>
          <h1 className="quote-text bottom-quote shiny-quote mt-4">
            <span>Every step leaves </span>
            <span>a little power behind.</span>
          </h1>
        </div>

        <div ref={overviewMetricsRef} className="hero-overview-card" aria-label="Energy generation overview">
          <div className="hero-overview-card-heading">Live statistics</div>
          <div className="hero-overview-metrics">
            <div className="hero-overview-metric">
              <Zap className="hero-overview-icon" aria-hidden="true" />
              <span className="hero-overview-value">
                <span ref={generationCountRef}>42.8</span>
                <small>kWh</small>
              </span>
              <span className="hero-overview-label">Electricity generated</span>
            </div>
            <div className="hero-overview-metric">
              <Footprints className="hero-overview-icon" aria-hidden="true" />
              <span className="hero-overview-value">
                <span ref={footstepCountRef}>1,248</span>
                <small>steps</small>
              </span>
              <span className="hero-overview-label">Footsteps captured</span>
            </div>
          </div>
        </div>
      </div>
    </section>
      {/* reduced motion: no circle, so the section just follows the hero normally */}
      {reduced && children}
    </>
  );
}