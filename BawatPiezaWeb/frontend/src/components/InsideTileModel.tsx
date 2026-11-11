"use client";

import { Cube, Cyl, Stand, Plane, gearPath } from "@/components/HeroTileScroll";

/* =====================================================================
   The "inside" tile: every component from the reference drawing, built
   with the same CSS-3D blocks as the hero tile (Cube / Cyl / Stand / Plane).

   Layers lift apart on `data-role="L-<layer>"` groups. WhatsInsideScroll.tsx
   drives their Z positions, so everything below only declares geometry.
   ===================================================================== */

export type LayerKey =
  | "walls"
  | "frame"
  | "mech"
  | "piezoB"
  | "piezoA"
  | "creamLow"
  | "eva"
  | "sintra";

/** Z of every layer: [assembled, exploded]. */
export const LAYERS: Record<LayerKey, readonly [number, number]> = {
  walls: [10, 20],
  frame: [14, 58],
  mech: [12, 84],
  piezoB: [44, 196],
  piezoA: [60, 256],
  creamLow: [68, 312],
  eva: [72, 340],
  sintra: [76, 372],
};

/** When each layer lifts, as a slice of the 0 → 1 opening progress (staggered, bottom first). */
export const LAYER_WINDOW: Record<LayerKey, readonly [number, number]> = {
  walls: [0.38, 0.7],
  frame: [0.3, 0.72],
  mech: [0.22, 0.78],
  piezoB: [0.32, 0.88],
  piezoA: [0.36, 0.92],
  creamLow: [0.4, 0.95],
  eva: [0.42, 0.97],
  sintra: [0.45, 1],
};

export const LAYER_KEYS = Object.keys(LAYERS) as LayerKey[];

/** Height of the exploded model, used to fit it on screen. */
export const MODEL_TOP = LAYERS.sintra[1] + 12;
/** Half the footprint of the base board. */
export const MODEL_HALF = 192;

/** The mechanism is squashed in Z while the tile is closed, so the tall central stack stays inside the plates. */
export const MECH_SQUASH: readonly [number, number] = [0.55, 1];

/** Where the spindle starts / ends, relative to the layers it links. */
export const SPINDLE_FROM = 114; // above the gear, in mech-local Z
export const SPINDLE_TO = 8; // above the upper copper cluster, in piezoA-local Z

export type Part = {
  id: string;
  name: string;
  note: string;
  body: string;
  /** "spindle" parts use `at[2]` as a 0 → 1 position along the shaft */
  layer: LayerKey | "spindle";
  at: [number, number, number];
};

/* Names and order follow the labelled drawing. Descriptions are plain-language summaries. */
export const INSIDE_PARTS: Part[] = [
  {
    id: "sintra",
    name: "5mm sintra board",
    note: "Top plate",
    body: "A rigid 5 mm board on top. It takes the footstep and spreads the load across the whole tile.",
    layer: "sintra",
    at: [120, -60, 12],
  },
  {
    id: "eva",
    name: "EVA rubber",
    note: "Ethylene-vinyl acetate",
    body: "A soft rubber layer under the board. It cushions each strike so the tile feels gentle underfoot.",
    layer: "eva",
    at: [70, 186, 10],
  },
  {
    id: "piezo",
    name: "Piezoelectric disc",
    note: "Copper-backed discs",
    body: "Each footstep flexes the discs, and every flex releases a short pulse of charge.",
    layer: "piezoA",
    at: [80, 25, 2],
  },
  {
    id: "cord",
    name: "EPDM cord",
    note: "Ethylene propylene diene monomer",
    body: "Weather-resistant rubber cord that runs around the layers to seal and cushion the joins.",
    layer: "piezoB",
    at: [158, 30, 1],
  },
  {
    id: "clutch",
    name: "Clutch housing",
    note: "One-way drive",
    body: "Lets the shaft drive the dynamo in one direction only, so spring-back keeps it turning.",
    layer: "mech",
    at: [100, 18, 34],
  },
  {
    id: "thread",
    name: "Helical thread",
    note: "Central shaft",
    body: "A threaded shaft that turns the downward press of the plate into rotation.",
    layer: "spindle",
    at: [7, 0, 0.55],
  },
  {
    id: "matting",
    name: "Rubber matting",
    note: "EPDM rubber sheet",
    body: "EPDM sheet lining the tray. It keeps water out and damps vibration from the mechanism.",
    layer: "walls",
    at: [170, 20, 34],
  },
  {
    id: "flange",
    name: "Flange coupling",
    note: "Shaft joint",
    body: "Joins the threaded shaft to the drive train so turning force passes through cleanly.",
    layer: "mech",
    at: [22, 6, 97],
  },
  {
    id: "pillow",
    name: "Pillow block bearing",
    note: "Shaft support",
    body: "A bearing block that holds the central shaft true while it spins.",
    layer: "mech",
    at: [37, 10, 12],
  },
  {
    id: "spring",
    name: "Compression spring",
    note: "Return spring",
    body: "Pushes the plate back up after each step, ready for the next one.",
    layer: "mech",
    at: [21, 0, 58],
  },
  {
    id: "lm12uu",
    name: "LM12UU linear bearings",
    note: "For the 12 mm guides",
    body: "Ball bearings that let the guide rods slide smoothly with very little friction.",
    layer: "mech",
    at: [-135, 148, 16],
  },
  {
    id: "profile",
    name: "Aluminum U profile",
    note: "5 × 5 frame",
    body: "Light aluminium channel that forms the frame carrying the mechanism.",
    layer: "frame",
    at: [-70, 124, 9],
  },
  {
    id: "gland",
    name: "Cable gland",
    note: "Sealed wiring exit",
    body: "Seals the point where the wiring leaves the tile, keeping rain and grit out.",
    layer: "mech",
    at: [-196, 70, 26],
  },
  {
    id: "guide",
    name: "Linear guide",
    note: "12 mm rods",
    body: "Hardened rods that keep the plate travelling straight up and down.",
    layer: "mech",
    at: [153, -148, 110],
  },
  {
    id: "dynamo",
    name: "Dynamo",
    note: "Generator",
    body: "A small generator that turns the slower spring-back motion into electricity.",
    layer: "mech",
    at: [-92, 0, 52],
  },
  {
    id: "bevel",
    name: "Bevel gear",
    note: "Drive gear",
    body: "Turns the drive through a right angle on its way to the dynamo.",
    layer: "mech",
    at: [-30, -22, 110],
  },
];

/* ---------- materials & shapes (unique ids, so they never clash with the hero tile's) ---------- */

const ROD_BG = "linear-gradient(90deg, #2a2d33 0%, #aeb5bd 22%, #f3f5f7 38%, #8b929b 62%, #2b2e34 100%)";
const THREAD_BG = `repeating-linear-gradient(172deg, rgba(0,0,0,0.5) 0 2px, rgba(0,0,0,0) 2px 5px), ${ROD_BG}`;
const CORD_BG = "linear-gradient(90deg, #8f8676, #efe7da 40%, #8f8676)";
const STEEL_TONE: [number, number, number, number] = [212, 7, 52, 30];
const MOTOR_TONE: [number, number, number, number] = [214, 9, 33, 24];
const GEAR_D = gearPath(60, 60, 20, 57, 48);

type Disc = [number, number, number];
const MID: Disc[] = Array.from({ length: 6 }, (_, i) => {
  const a = (i / 6) * Math.PI * 2 + 0.3;
  return [150 + Math.cos(a) * 84, 150 + Math.sin(a) * 84, 31] as Disc;
});
const OUTER: Disc[] = Array.from({ length: 6 }, (_, i) => {
  const a = (i / 6) * Math.PI * 2 + 0.3 + Math.PI / 6;
  return [150 + Math.cos(a) * 126, 150 + Math.sin(a) * 126, 21] as Disc;
});
const CLUSTER_A: Disc[] = [[150, 150, 42], ...MID];
const CLUSTER_B: Disc[] = OUTER;

const CORNERS: [number, number][] = [
  [-148, -148],
  [148, -148],
  [-148, 148],
  [148, 148],
];

function InsSpring() {
  return (
    <svg viewBox="0 0 30 64" width="100%" height="100%" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="ins-spr" x1="0" y1="0" x2="0" y2="1">
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
            <path d={`M3 ${y + 5} L27 ${y}`} stroke="url(#ins-spr)" strokeWidth="3.4" strokeLinecap="round" fill="none" />
          </g>
        );
      })}
    </svg>
  );
}

/** A cluster of copper discs, drawn as three slices so it has a little thickness. */
function Discs({ discs, tag }: { discs: Disc[]; tag: string }) {
  return (
    <>
      {[0, -1.6, -3.2].map((dz, idx) => (
        <Plane key={dz} size={300} z={dz} style={idx ? { filter: `brightness(${1 - idx * 0.32})` } : undefined}>
          <svg viewBox="0 0 300 300" width="100%" height="100%" aria-hidden="true">
            <defs>
              <radialGradient id={`ins-copper-${tag}${idx}`} cx="36%" cy="32%" r="78%">
                <stop offset="0" stopColor="#ffd2ac" />
                <stop offset="0.45" stopColor="#dd8a55" />
                <stop offset="1" stopColor="#74391a" />
              </radialGradient>
            </defs>
            {discs.map(([cx, cy, r], i) => (
              <g key={i}>
                <circle cx={cx} cy={cy} r={r} fill={`url(#ins-copper-${tag}${idx})`} stroke="#51250e" strokeWidth="1.5" />
                {idx === 0 && <circle cx={cx} cy={cy} r={r * 0.3} fill="#4a210b" opacity="0.5" />}
                {idx === 0 && (
                  <ellipse cx={cx - r * 0.3} cy={cy - r * 0.35} rx={r * 0.34} ry={r * 0.18} fill="#fff" opacity="0.22" />
                )}
              </g>
            ))}
          </svg>
        </Plane>
      ))}
    </>
  );
}

const at = (key: LayerKey) => ({ transform: `translate3d(0,0,${LAYERS[key][1]}px)` });

export default function InsideTileModel() {
  return (
    <>
      <Plane size={760} z={-2} className="t3-shadow" />
      {/* warm glow on the board, fades in as the layers lift */}
      <Plane size={330} z={10.4} className="t3-glow ins-glow" />

      {/* ---------- base board ---------- */}
      <Cube w={380} d={380} h={10} m="m-board" />

      {/* ---------- rubber matting: EPDM rubber sheet walls ---------- */}
      <div data-role="L-walls" className="t3-group" style={at("walls")}>
        <Cube w={372} d={16} h={52} y={-178} m="m-eva" />
        <Cube w={16} d={340} h={52} x={178} y={8} m="m-eva" />
      </div>

      {/* ---------- aluminium U profile 5x5 ---------- */}
      <div data-role="L-frame" className="t3-group" style={at("frame")}>
        <Cube w={290} d={14} h={8} y={-124} m="m-alu" />
        <Cube w={290} d={14} h={8} y={124} m="m-alu" />
        <Cube w={14} d={234} h={8} x={-124} m="m-alu" />
        <Cube w={14} d={234} h={8} x={124} m="m-alu" />
        {/* the channel slot */}
        <Cube w={280} d={5} h={1.2} y={-124} z={8} m="m-block" />
        <Cube w={280} d={5} h={1.2} y={124} z={8} m="m-block" />
        <Cube w={5} d={224} h={1.2} x={-124} z={8} m="m-block" />
        <Cube w={5} d={224} h={1.2} x={124} z={8} m="m-block" />
      </div>

      {/* ---------- mechanism ---------- */}
      <div
        data-role="L-mech"
        className="t3-group"
        style={{ transform: `translate3d(0,0,${LAYERS.mech[1]}px)` }}
      >
        {/* central column: pillow block → compression spring → flange coupling → bevel gear */}
        <Cube w={74} d={46} h={20} m="m-block" />
        <Cyl r={17} h={8} n={16} z={20} tone={STEEL_TONE} />
        {/* compression spring: WhatsInsideScroll squashes it (z-scale) when a part is zoomed */}
        <div data-role="spring-main" className="t3-group" style={{ transform: "translate3d(0,0,28px)" }}>
          <Stand w={42} h={64}>
            <InsSpring />
          </Stand>
        </div>
        {/* everything above the spring rides down with it while the zoomed view plays the press */}
        <div data-role="drive-top" className="t3-group">
          <Cyl r={21} h={10} n={16} z={92} tone={STEEL_TONE} />
          <Cyl r={13} h={8} n={14} z={102} tone={STEEL_TONE} />
          <div
            data-role="gear2"
            className="t3-gear t3-gear-under"
            style={{ transform: "translate3d(-44px,-44px,108.4px)" }}
          />
          <div data-role="gear" className="t3-gear" style={{ transform: "translate3d(-45px,-45px,110px) rotateZ(0deg)" }}>
            <svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true">
              <defs>
                <linearGradient id="ins-gearfill" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#eef1f4" />
                  <stop offset="0.5" stopColor="#8a929c" />
                  <stop offset="1" stopColor="#363b42" />
                </linearGradient>
              </defs>
              <path d={GEAR_D} fill="url(#ins-gearfill)" stroke="#1f2227" strokeWidth="1.6" strokeLinejoin="round" />
              <circle cx="60" cy="60" r="36" fill="none" stroke="#1f2227" strokeWidth="2" opacity="0.55" />
              <circle cx="60" cy="60" r="22" fill="#2a2e34" />
              <circle cx="60" cy="60" r="9" fill="#c9cfd6" />
            </svg>
          </div>
        </div>

        {/* dynamo, with its bracket and end plate */}
        <Cyl r={16} h={84} n={14} x={-92} y={0} z={20} axis="x" tone={MOTOR_TONE} phase={2.6} />
        <Cube w={14} d={34} h={26} x={-70} y={0} m="m-block" />
        <Cube w={8} d={40} h={36} x={-136} y={0} m="m-block" />

        {/* clutch housing */}
        <Cube w={54} d={34} h={34} x={92} y={18} m="m-block" />
        <Cyl r={13} h={36} n={14} x={58} y={18} z={9} axis="x" tone={STEEL_TONE} />

        {/* cable gland, sitting outside the tray */}
        <Cyl r={8} h={30} n={10} x={-190} y={70} z={10} axis="x" tone={STEEL_TONE} />
        <Cyl r={11} h={9} n={6} x={-176} y={70} z={7} axis="x" tone={MOTOR_TONE} />

        {/* four guide rods: LM12UU bearing at the foot, spring above it */}
        {CORNERS.map(([px, py]) => (
          <div key={`g${px}${py}`} className="t3-cube">
            <Stand w={10} h={130} x={px} y={py} z={2} bg={ROD_BG} />
            <Cyl r={13} h={24} n={12} x={px} y={py} z={4} tone={STEEL_TONE} />
            <div data-role="spring-c" className="t3-group" style={{ transform: "translate3d(0,0,28px)" }}>
              <Stand w={30} h={62} x={px} y={py}>
                <InsSpring />
              </Stand>
            </div>
          </div>
        ))}
      </div>

      {/* helical thread: stretches between the gear and the copper discs */}
      <div data-role="spindle" className="t3-group">
        <Stand w={13} h={60} bg={THREAD_BG} />
      </div>

      {/* ---------- piezoelectric discs: outer ring + EPDM cord ---------- */}
      <div data-role="L-piezoB" className="t3-group" style={at("piezoB")}>
        <Discs discs={CLUSTER_B} tag="b" />
        <Cube w={322} d={3.4} h={3.4} y={-158} z={-1.7} m="m-evacream" />
        <Cube w={322} d={3.4} h={3.4} y={158} z={-1.7} m="m-evacream" />
        <Cube w={3.4} d={316} h={3.4} x={-158} z={-1.7} m="m-evacream" />
        <Cube w={3.4} d={316} h={3.4} x={158} z={-1.7} m="m-evacream" />
        <div className="t3-cube" style={{ transform: "translate3d(0,0,0)" }}>
          <Stand w={4} h={36} x={158} y={-120} z={-34} bg={CORD_BG} />
          <Stand w={4} h={36} x={-158} y={120} z={-34} bg={CORD_BG} />
        </div>
      </div>

      {/* ---------- piezoelectric discs: centre + middle ring ---------- */}
      <div data-role="L-piezoA" className="t3-group" style={at("piezoA")}>
        <Discs discs={CLUSTER_A} tag="a" />
      </div>

      {/* ---------- top stack: board / EVA rubber / board ---------- */}
      <div data-role="L-creamLow" className="t3-group" style={at("creamLow")}>
        <Cube w={380} d={380} h={12} m="m-evacream" />
      </div>
      <div data-role="L-eva" className="t3-group" style={at("eva")}>
        <Cube w={372} d={372} h={20} m="m-eva" />
      </div>
      <div data-role="L-sintra" className="t3-group" style={at("sintra")}>
        <Cube w={380} d={380} h={12} m="m-sintra" />
      </div>
    </>
  );
}