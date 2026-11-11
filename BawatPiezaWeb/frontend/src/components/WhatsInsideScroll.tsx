"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode, type RefObject } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import { TILT, YAW } from "@/components/HeroTileScroll";
import InsideTileModel, {
  INSIDE_PARTS,
  LAYERS,
  LAYER_KEYS,
  LAYER_WINDOW,
  MECH_SQUASH,
  MODEL_HALF,
  MODEL_TOP,
  SPINDLE_FROM,
  SPINDLE_TO,
  type LayerKey,
  type Part,
} from "@/components/InsideTileModel";

/* =====================================================================
   WHAT'S INSIDE ONE TILE

   1. Scrolling in: the INSIDE TILE textmark pops up behind the closed tile
      (shine effect) and zooms in as you scroll. The tile stays where
      HowItWorks left it and a "click to open" hotspot appears on it.
   2. Click: a footprint grows from the tile until it covers the screen
      (same transition as the hero), revealing the opened tile. Its layers
      lift apart and every part from the drawing gets a leader line + label.
   3. Drag to turn the tile, hover / tap a part to read about it, Close (or
      Esc) shrinks the footprint back onto the closed tile.

   The closed tile is the shared one in page.tsx (stageRef / camRef /
   sceneRef). The opened tile has its own scene inside the reveal.
   ===================================================================== */

const SMOOTHING = 8;
const OPEN_MS = 2400;
const CLOSE_MS = 1500;
/* opening is two steps: the bolt grows over the closed tile first (0 → FOOT_END),
   and only then do the layers lift and the camera glides out (OPEN_SPLIT → 1). */
const FOOT_END = 0.5;
const OPEN_SPLIT = 0.42;
const NAV = 72; // px kept clear for the fixed site nav
/* clickable area over the closed tile, in tile units (multiplied by the tile's on-screen scale) */
const HIT_W = 460;
const HIT_H = 300;

/* ---------- lightning-bolt mask (the transition shape) ----------
   BOLT_PATH is drawn in a 100 x 100 box. To use your own logo, paste its path here and
   set the 4 numbers below to the middle band of the bolt that is solid on every row:
   BOLT_CX / BOLT_CY = centre of that band, BOLT_HX / BOLT_HY = its half width / half height
   (all as fractions of the box). The reveal grows until that band covers the whole screen. */
const BOLT_PATH = "M60 2 L20 56 L45 56 L36 98 L82 38 L56 38 L74 2 Z";
const BOLT_CX = 0.51;
const BOLT_CY = 0.47;
const BOLT_HX = 0.17;
const BOLT_HY = 0.09;
const FOOT_START = 150; // size (px) of the bolt when it first appears on the tile
const FOOT_SVG =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>` +
      `<path d='${BOLT_PATH}' fill='#000' stroke='#000' stroke-width='3' stroke-linejoin='round'/></svg>`,
  );

/** Mask size at which the solid middle band of the bolt covers the whole screen from (cx, cy). */
function footCoverSize(cx: number, cy: number, vw: number, vh: number) {
  const dx = Math.max(cx, vw - cx);
  const dy = Math.max(cy, vh - cy);
  return Math.max(dx / BOLT_HX, dy / BOLT_HY) * 1.04;
}

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
    set("mask-image", "none");
    return;
  }
  set("mask-image", `url("${FOOT_SVG}")`);
  set("mask-repeat", "no-repeat");
  set("mask-size", `${B.toFixed(1)}px ${B.toFixed(1)}px`);
  set("mask-position", `${(cx - BOLT_CX * B).toFixed(1)}px ${(cy - BOLT_CY * B).toFixed(1)}px`);
}

/* ---------- helpers ---------- */
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const range = (p: number, [a, b]: readonly [number, number]) => clamp01((p - a) / (b - a));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutBack = (t: number) => {
  const c1 = 1.5;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const D2R = Math.PI / 180;

/* ---------- zoom view ---------- */
/** How far the camera pushes in on each part (1 = the normal fitted view). Tweak per part here. */
const PART_ZOOM: Record<string, number> = {
  sintra: 1.5,
  eva: 1.5,
  piezo: 2.2,
  cord: 1.9,
  clutch: 3.2,
  thread: 3.2,
  matting: 1.9,
  flange: 3.6,
  pillow: 3.6,
  spring: 3.4,
  lm12uu: 3.4,
  profile: 2.2,
  gland: 4.2,
  guide: 3,
  dynamo: 3,
  bevel: 3.6,
};
/** How far a part's own layer is pushed down by the "footstep" while it is zoomed. */
const PART_BOB: Partial<Record<LayerKey, number>> = { sintra: 12, eva: 12, creamLow: 12, piezoA: 5, piezoB: 5 };
const PRESS_SPEED = 2.6; // radians / second of the press cycle (about 2.4 s per step)
const SPRING_MAIN_SQUASH = 0.34; // 64 * 0.34 ≈ 22 units of travel
const SPRING_CORNER_SQUASH = 0.3;
const DRIVE_TRAVEL = 64 * SPRING_MAIN_SQUASH;

/** "How it works" line shown in the side panel, one per part id. */
const HOW: Record<string, string> = {
  sintra: "The foot pushes the top plate down. It moves as one stiff piece, so every step reaches the parts below evenly.",
  eva: "The rubber squashes a little on each step, then springs back. This softens the impact and the noise.",
  piezo: "Each step bends the copper discs. Bending a piezo disc makes a short voltage pulse. Watch the glow flash with each press.",
  cord: "The cord sits between the disc layers and flexes with them, keeping them spaced and sealed from water.",
  clutch: "When the shaft turns forward the clutch locks and drives the dynamo. On the way back it freewheels, so no turning force is lost.",
  thread: "As the plate goes down, the helical thread forces the shaft to turn. Straight pushing becomes rotation.",
  matting: "This part stays still. It seals the tray and absorbs vibration while the parts above it move.",
  flange: "It travels down with the shaft and passes the turning force on to the gear above it.",
  pillow: "A fixed bearing block. The shaft spins inside it, so the block takes the load and the shaft does not wobble.",
  spring: "It compresses as you step and stores the energy. When you step off, it pushes the plate back up.",
  lm12uu: "The guide rod slides through these ball bearings, so the plate travels up and down with very little friction.",
  profile: "A fixed aluminium frame. It holds the mechanism square while the plate moves.",
  gland: "This part stays still. It is the sealed exit through which the cable carries the electricity out.",
  guide: "Four rods keep the plate travelling straight, so the thread and springs are never pushed sideways.",
  dynamo: "The turning shaft spins the generator. Magnets and coils inside it turn that rotation into electricity.",
  bevel: "It turns with the shaft and changes the direction of the drive by 90 degrees, toward the dynamo.",
};

/** World position (x, y, z) of a part when the tile is fully exploded. */
const worldOf = (p: Part): [number, number, number] => {
  if (p.layer === "spindle") {
    return [p.at[0], p.at[1], lerp(LAYERS.mech[1] + SPINDLE_FROM, LAYERS.piezoA[1] + SPINDLE_TO, p.at[2])];
  }
  return [p.at[0], p.at[1], LAYERS[p.layer][1] + p.at[2]];
};

/** Same projection as the CSS stage: scene → rotateZ(yaw) → rotateX(TILT) → camera (tx, ty, s) → perspective. */
function proj(
  x: number,
  y: number,
  z: number,
  yawDeg: number,
  s: number,
  tx: number,
  ty: number,
  vw: number,
  vh: number,
  persp: number,
): [number, number] {
  const yw = yawDeg * D2R;
  const tl = TILT * D2R;
  const x1 = x * Math.cos(yw) - y * Math.sin(yw);
  const y1 = x * Math.sin(yw) + y * Math.cos(yw);
  const y2 = y1 * Math.cos(tl) - z * Math.sin(tl);
  const z2 = y1 * Math.sin(tl) + z * Math.cos(tl);
  const f = persp / (persp - z2 * s);
  return [vw / 2 + (tx + x1 * s) * f, 0.45 * vh + (ty + 0.05 * vh + y2 * s) * f];
}

type Ctrl = { open: () => void; close: () => void; refresh: () => void; zoom: (i: number) => void };

export default function WhatsInsideScroll({
  specs,
  head,
  camRef,
  sceneRef,
}: {
  specs: [string, string][];
  head: ReactNode;
  stageRef?: RefObject<HTMLDivElement | null>;
  camRef?: RefObject<HTMLDivElement | null>;
  sceneRef?: RefObject<HTMLDivElement | null>;
}) {
  const [reduced, setReduced] = useState(false);
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [hot, setHot] = useState(-1);
  const [sel, setSel] = useState(-1);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const runwayRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const hotspotRef = useRef<HTMLButtonElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const irisRef = useRef<HTMLDivElement>(null);
  const iCamRef = useRef<HTMLDivElement>(null);
  const iSceneRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<SVGSVGElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const uiRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const labelEls = useRef<(HTMLButtonElement | null)[]>([]);
  const lineEls = useRef<(SVGGElement | null)[]>([]);
  const yawRef = useRef(0);
  const dragRef = useRef({ down: false, x: 0 });
  const ctrlRef = useRef<Ctrl | null>(null);
  const selRef = useRef(-1);

  /* ---------- scroll + open/close engine ---------- */
  useEffect(() => {
    if (reduced) return;
    const runway = runwayRef.current;
    const pin = pinRef.current;
    const mark = markRef.current;
    const intro = introRef.current;
    const hotspot = hotspotRef.current;
    const ring = ringRef.current;
    const iris = irisRef.current;
    const iCam = iCamRef.current;
    const iScene = iSceneRef.current;
    const lines = linesRef.current;
    const labels = labelsRef.current;
    const ui = uiRef.current;
    if (!runway || !pin || !mark || !intro || !hotspot || !ring || !iris || !iCam || !iScene || !lines || !labels || !ui) return;

    // shared closed tile (owned by HowItWorks until we scroll into this section)
    const cam = camRef?.current ?? null;
    const scene = sceneRef?.current ?? null;
    const shadow = scene?.querySelector<HTMLElement>(".t3-shadow") ?? null;

    // opened tile
    const q = (role: string) => iScene.querySelector<HTMLElement>(`[data-role="${role}"]`);
    const layerEls = {} as Record<LayerKey, HTMLElement | null>;
    for (const k of LAYER_KEYS) layerEls[k] = q(`L-${k}`);
    const spindle = q("spindle");
    const gear = q("gear");
    const glow = iScene.querySelector<HTMLElement>(".ins-glow");
    const springMain = q("spring-main");
    const driveTop = q("drive-top");
    const springsC = Array.from(iScene.querySelectorAll<HTMLElement>('[data-role="spring-c"]'));

    let vw = 1;
    let vh = 1;
    let persp = 2400;
    let isCompact = false;
    // where HowItWorks parks the closed tile (same maths as HowItWorks.measure)
    let baseY = 0;
    let baseScale = 1;
    // opened-tile fit
    let iS = 1;
    let iTx = 0;
    let iTy = 0;
    let colW = 220;
    let xl = 0;
    let xr = 0;
    let hotY = 0;
    // pose of the closed tile (set by apply), so the opened tile can start exactly where it is
    let closedK = 1;
    let closedTk = 0;

    let openT = 0;
    let openGoal = 0;
    let controlled = false;

    // zoom on a selected part
    let zIdx = -1; // part being shown
    let zLastIdx = -1; // last part shown (kept while zooming back out)
    let zk = 0; // 0 = normal view, 1 = fully zoomed
    let cS = 1; // camera actually used while zoomed
    let cTx = 0;
    let cTy = 0;
    let clock = 0;
    let spin = 0;
    let zRaf = 0;
    let zLast = 0;

    const measure = () => {
      vw = pin.clientWidth;
      vh = pin.clientHeight;
      persp = window.innerWidth <= 640 ? 2800 : 2400;

      const how = document.getElementById("how");
      const hw = how ? how.clientWidth : vw;
      const hh = how ? how.clientHeight : vh;
      let frac = 0.47;
      if (hw < 1024) {
        const area = Math.min(hw * 0.85, 440);
        baseScale = Math.min((hw * 0.74) / 517, (area * 0.6) / 300);
        frac = area / 2 / hh;
      } else {
        baseScale = Math.min((hw * 0.5) / 517, (hh * 0.46) / 300);
      }
      baseY = (frac - 0.5) * hh + 31 * baseScale;

      const nowCompact = vw < 1000;
      if (nowCompact !== isCompact) {
        isCompact = nowCompact;
        setCompact(nowCompact);
      }
      fit();
    };

    /** Fit the opened tile between the top bar and the caption, with room for label columns. */
    const fit = () => {
      const topPad = NAV + (isCompact ? 70 : 56);
      const botPad = isCompact ? 214 : 124;
      const availH = Math.max(160, vh - topPad - botPad);
      const availW = isCompact ? vw * 0.94 : Math.min(vw * 0.44, 660);
      const yaw = YAW[1];
      const corners: [number, number, number][] = [];
      for (const x of [-MODEL_HALF - 14, MODEL_HALF]) {
        for (const y of [-MODEL_HALF, MODEL_HALF]) {
          for (const z of [0, MODEL_TOP]) corners.push([x, y, z]);
        }
      }
      const bnd = (s: number, tx: number, ty: number) => {
        let l = Infinity;
        let r = -Infinity;
        let t = Infinity;
        let b = -Infinity;
        for (const [x, y, z] of corners) {
          const [px, py] = proj(x, y, z, yaw, s, tx, ty, vw, vh, persp);
          l = Math.min(l, px);
          r = Math.max(r, px);
          t = Math.min(t, py);
          b = Math.max(b, py);
        }
        return { l, r, t, b };
      };
      // perspective stretches the nearer parts, so fit scale and centring together
      let s = 1;
      let tx = 0;
      let ty = 0;
      const tcx = vw / 2;
      const tcy = topPad + availH / 2;
      for (let i = 0; i < 5; i++) {
        let b = bnd(s, tx, ty);
        s = Math.max(0.2, s * Math.min(availW / (b.r - b.l), availH / (b.b - b.t)));
        b = bnd(s, tx, ty);
        tx += tcx - (b.l + b.r) / 2;
        ty += tcy - (b.t + b.b) / 2;
      }
      iS = s;
      iTx = tx;
      iTy = ty;
      const b = bnd(s, tx, ty);
      xl = b.l - 18;
      xr = b.r + 18;
      colW = Math.max(120, Math.min(250, xl - 14, vw - xr - 14));
    };

    /** Camera while the tile opens: starts on the closed tile, then glides to the fitted view. */
    const pose = (t: number): [number, number, number, number] => {
      const ce = easeInOut(range(range(t, [OPEN_SPLIT, 1]), [0, 0.9]));
      return [lerp(baseScale * closedK, iS, ce), lerp(0, iTx, ce), lerp(baseY, iTy, ce), ce];
    };

    /* ---------- opened tile ---------- */
    const paintModel = (t: number) => {
      const m = range(t, [OPEN_SPLIT, 1]); // layer / label progress, starts after the footprint has grown
      const [pS, pTx, pTy, ce] = pose(t);
      const yaw = YAW[1] + yawRef.current + 16 * closedTk * (1 - ce);
      const zoomOn = zk > 0.001;
      const useZ = zoomOn || (zIdx >= 0 && openGoal === 1);
      const S = useZ ? cS : pS;
      const TX = useZ ? cTx : pTx;
      const TY = useZ ? cTy : pTy;
      iCam.style.transform = `translate3d(${TX.toFixed(2)}px, ${TY.toFixed(2)}px, 0) scale3d(${S.toFixed(4)}, ${S.toFixed(4)}, ${S.toFixed(4)})`;
      iScene.style.transform = `rotateX(${TILT}deg) rotateZ(${yaw.toFixed(3)}deg)`;

      // zoomed: which part, and where we are in the press cycle (0 = relaxed, 1 = fully pressed)
      const cur = zLastIdx >= 0 ? INSIDE_PARTS[zLastIdx] : null;
      const driveOn = !!cur && (cur.layer === "mech" || cur.layer === "spindle");
      const press = zoomOn ? smooth(0.5 - 0.5 * Math.cos(clock * PRESS_SPEED)) : 0;
      const d = driveOn ? press * zk : 0;
      const dz = DRIVE_TRAVEL * d;
      const iso = !!cur && zk > 0.3; // hide the layers that are not the selected part's
      const keep = (k: LayerKey) => cur?.layer === k || (driveOn && k === "mech");

      const z = {} as Record<LayerKey, number>;
      for (const k of LAYER_KEYS) z[k] = lerp(LAYERS[k][0], LAYERS[k][1], easeInOut(range(m, LAYER_WINDOW[k])));
      if (cur && zoomOn && cur.layer !== "spindle") z[cur.layer] -= (PART_BOB[cur.layer] ?? 0) * press * zk;
      const cz = lerp(MECH_SQUASH[0], MECH_SQUASH[1], easeInOut(range(m, LAYER_WINDOW.mech)));
      for (const k of LAYER_KEYS) {
        const el = layerEls[k];
        if (!el) continue;
        el.style.visibility = iso && !keep(k) ? "hidden" : "";
        el.style.transform =
          k === "mech"
            ? `translate3d(0,0,${z[k].toFixed(2)}px) scale3d(1,1,${cz.toFixed(4)})`
            : `translate3d(0,0,${z[k].toFixed(2)}px)`;
      }

      // the press: springs squash, the drive top rides down, the thread turns
      if (springMain) {
        springMain.style.transform = `translate3d(0,0,28px) scale3d(1,1,${(1 - SPRING_MAIN_SQUASH * d).toFixed(4)})`;
      }
      for (const el of springsC) {
        el.style.transform = `translate3d(0,0,28px) scale3d(1,1,${(1 - SPRING_CORNER_SQUASH * d).toFixed(4)})`;
      }
      if (driveTop) driveTop.style.transform = `translate3d(0,0,${(-dz).toFixed(2)}px)`;

      const sBase = z.mech + SPINDLE_FROM * cz;
      const sTop = z.piezoA + SPINDLE_TO;
      if (spindle) {
        const k = Math.max(0.05, (sTop - sBase) / 60);
        spindle.style.visibility = iso && !driveOn ? "hidden" : "";
        spindle.style.transform = `translate3d(0,0,${(sBase - dz).toFixed(2)}px) scale3d(1,1,${k.toFixed(4)})`;
        // scrolling the stripes along the shaft reads as the thread turning
        const off = driveOn && zoomOn ? (clock * 38) % 5 : 0;
        spindle.querySelectorAll<HTMLElement>("*").forEach((e) => {
          e.style.backgroundPositionY = `${off.toFixed(2)}px`;
        });
      }
      if (gear) {
        gear.style.transform = `translate3d(-45px,-45px,110px) rotateZ(${(m * 260 + yawRef.current * 2 + spin).toFixed(2)}deg)`;
      }
      if (glow) {
        const base = 0.55 * smooth(range(m, [0.25, 0.8]));
        // the board glow flashes with the press when a plate or the discs are shown
        const gk = zoomOn && !driveOn ? lerp(1, 0.25 + 0.75 * press, zk) : 1;
        glow.style.opacity = (base * gk).toFixed(3);
      }

      // leader lines + labels
      const pts = INSIDE_PARTS.map((p) => {
        let wz: number;
        if (p.layer === "spindle") wz = lerp(sBase - dz, sTop - dz, p.at[2]);
        else if (p.layer === "mech") {
          let lz = p.at[2];
          if (p.id === "flange" || p.id === "bevel") lz -= dz;
          else if (p.id === "spring") lz = 28 + (lz - 28) * (1 - SPRING_MAIN_SQUASH * d);
          wz = z.mech + lz * cz;
        } else wz = z[p.layer] + p.at[2];
        const [px, py] = proj(p.at[0], p.at[1], wz, yaw, S, TX, TY, vw, vh, persp);
        return { px, py };
      });

      const fade = smooth(range(m, [0.82, 1])).toFixed(3);
      lines.style.opacity = fade;
      labels.style.opacity = fade;
      ui.style.opacity = smooth(range(m, [0.7, 1])).toFixed(3);

      const side: ("l" | "r")[] = pts.map(() => "r");
      const rowY: number[] = pts.map(() => 0);
      if (!isCompact) {
        const order = pts.map((_, i) => i).sort((a, b) => pts[a].px - pts[b].px);
        const half = Math.floor(order.length / 2);
        const cols: number[][] = [order.slice(0, half), order.slice(half)];
        const rowTop = NAV + 70;
        const rowBottom = vh - 134;
        cols.forEach((col, ci) => {
          col.sort((a, b) => pts[a].py - pts[b].py);
          const rh = (rowBottom - rowTop) / col.length;
          col.forEach((idx, k) => {
            side[idx] = ci === 0 ? "l" : "r";
            rowY[idx] = rowTop + (k + 0.5) * rh;
          });
        });
      }

      INSIDE_PARTS.forEach((_, i) => {
        const g = lineEls.current[i];
        if (g) {
          const line = g.children[0] as SVGLineElement;
          const dot = g.children[1] as SVGCircleElement;
          const hit = g.children[2] as SVGCircleElement;
          dot.setAttribute("cx", pts[i].px.toFixed(1));
          dot.setAttribute("cy", pts[i].py.toFixed(1));
          hit.setAttribute("cx", pts[i].px.toFixed(1));
          hit.setAttribute("cy", pts[i].py.toFixed(1));
          if (!isCompact) {
            const sx = side[i] === "l" ? xl + 8 : xr - 8;
            line.setAttribute("x1", sx.toFixed(1));
            line.setAttribute("y1", rowY[i].toFixed(1));
            line.setAttribute("x2", pts[i].px.toFixed(1));
            line.setAttribute("y2", pts[i].py.toFixed(1));
          }
        }
        const el = labelEls.current[i];
        if (el && !isCompact) {
          const x = side[i] === "l" ? xl - colW : xr;
          el.style.width = `${colW.toFixed(0)}px`;
          el.style.transform = `translate3d(${x.toFixed(1)}px, ${rowY[i].toFixed(1)}px, 0) translateY(-50%)`;
          el.classList.toggle("ins-label-l", side[i] === "l");
          el.classList.toggle("ins-label-r", side[i] === "r");
        }
      });
    };

    /** footprint grows from the tile, then the layers lift apart inside it */
    const paintOpen = () => {
      const t = openT;
      if (t <= 0) {
        paintFoot(iris, 0, 0, 0);
        paintFoot(ring, 0, 0, 0);
        iris.style.pointerEvents = "none";
        return;
      }
      const cx = vw / 2;
      const cy = hotY;
      const dotB = FOOT_START * smooth(range(t, [0, 0.08]));
      const g = easeInOut(range(t, [0, FOOT_END]));
      const endB = footCoverSize(cx, cy, vw, vh);
      const full = g >= 0.999;
      const B = dotB <= 0 ? 0 : full ? endB : dotB * Math.pow(endB / dotB, g);
      paintFoot(iris, B, cx, cy, full);
      paintFoot(ring, full ? 0 : B * 1.07 + 10, cx, cy);
      iris.style.pointerEvents = full && openGoal ? "auto" : "none";
      paintModel(t);
    };

    /* ---------- closed tile + textmark, driven by scroll ---------- */
    const setTile = (k: number, yaw: number) => {
      if (!cam || !scene) return;
      cam.style.transition = "none";
      cam.style.opacity = "1";
      const sc = (baseScale * k).toFixed(4);
      cam.style.transform = `translate3d(0px, ${baseY.toFixed(2)}px, 0) scale3d(${sc}, ${sc}, ${sc})`;
      scene.style.transform = `rotateX(${TILT}deg) rotateZ(${yaw.toFixed(3)}deg)`;
      if (shadow) shadow.style.opacity = "1";
    };

    const apply = (p: number) => {
      const rect = runway.getBoundingClientRect();
      const enter = clamp01((vh - rect.top) / vh);

      // INSIDE TILE: pops up as the section arrives, then zooms in with the scroll
      const pop = 0.58 + 0.42 * easeOutBack(range(enter, [0.3, 1]));
      const zoom = easeInOut(range(p, [0.02, 0.95]));
      mark.style.opacity = (smooth(range(enter, [0.3, 0.8])) * (1 - smooth(range(p, [0.86, 1])))).toFixed(3);
      mark.style.transform = `translate3d(-50%, -50%, 0) scale(${(pop * (1 + 1.15 * zoom)).toFixed(4)})`;

      const iv = smooth(range(enter, [0.55, 1])) * (1 - smooth(range(p, [0.9, 1])));
      intro.style.opacity = iv.toFixed(3);
      intro.style.transform = `translate3d(0, ${((1 - smooth(range(enter, [0.55, 1]))) * 24).toFixed(1)}px, 0)`;
      intro.style.visibility = iv < 0.01 ? "hidden" : "visible";

      // the closed tile pushes in a little and turns while the mark zooms
      const tk = easeInOut(range(p, [0, 0.55]));
      const k = 1 + 0.09 * tk;
      closedK = k;
      closedTk = tk;
      if (p > 0.0005) {
        controlled = true;
        setTile(k, YAW[1] + 16 * tk);
      } else if (controlled) {
        controlled = false;
        setTile(1, YAW[1]);
      }

      // click-to-open hotspot, sitting on the tile's top face
      hotY = vh / 2 + baseY - 94 * baseScale * k;
      const hv = smooth(range(p, [0.46, 0.6])) * (1 - clamp01(openT * 5));
      hotspot.style.left = `${(vw / 2).toFixed(1)}px`;
      hotspot.style.top = `${hotY.toFixed(1)}px`;
      hotspot.style.width = `${(HIT_W * baseScale * k).toFixed(0)}px`;
      hotspot.style.height = `${(HIT_H * baseScale * k).toFixed(0)}px`;
      hotspot.style.opacity = hv.toFixed(3);
      hotspot.style.visibility = hv < 0.01 ? "hidden" : "visible";
      hotspot.style.pointerEvents = hv > 0.6 && openGoal === 0 ? "auto" : "none";
    };

    /* ---------- scroll smoothing ---------- */
    const readTarget = () => {
      const r = runway.getBoundingClientRect();
      const distance = Math.max(1, runway.offsetHeight - pin.offsetHeight);
      return clamp01(-r.top / distance);
    };

    let rafId = 0;
    let shown = readTarget();
    let lastTs = 0;
    const tick = (ts: number) => {
      const dt = lastTs ? Math.min(0.05, (ts - lastTs) / 1000) : 1 / 60;
      lastTs = ts;
      const target = readTarget();
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

    /* ---------- open / close ---------- */
    let openRaf = 0;
    let openLast = 0;
    const openStep = (ts: number) => {
      const dt = openLast ? Math.min(60, ts - openLast) : 16;
      openLast = ts;
      openT = clamp01(openT + (openGoal ? dt / OPEN_MS : -dt / CLOSE_MS));
      paintOpen();
      apply(shown);
      if (openT !== openGoal) {
        openRaf = requestAnimationFrame(openStep);
      } else {
        openRaf = 0;
        openLast = 0;
        if (!openGoal) {
          setOpen(false);
          setHot(-1);
          setSel(-1);
        }
      }
    };
    const runOpen = () => {
      if (!openRaf) openRaf = requestAnimationFrame(openStep);
    };

    /* ---------- zoom on a part ---------- */
    /** Where the zoomed part sits on screen: the free area beside the side panel (or above it on narrow screens). */
    const focus = (): [number, number] =>
      isCompact
        ? [vw / 2, (NAV + 60 + (vh - 250)) / 2]
        : [(vw - Math.min(368, vw * 0.36) - 20) / 2, (NAV + 56 + (vh - 40)) / 2];

    /** Camera (scale, tx, ty) that puts the selected part on the focus point. */
    const targetCam = (): [number, number, number] => {
      if (zIdx < 0 || !openGoal) {
        const [ps, ptx, pty] = pose(openT);
        return [ps, ptx, pty];
      }
      const p = INSIDE_PARTS[zIdx];
      const s = iS * (PART_ZOOM[p.id] ?? 2.6);
      const [x, y, wz] = worldOf(p);
      const yaw = YAW[1] + yawRef.current;
      const [a0, b0] = proj(x, y, wz, yaw, s, 0, 0, vw, vh, persp);
      const [a1, b1] = proj(x, y, wz, yaw, s, 1, 1, vw, vh, persp);
      const [fx, fy] = focus();
      return [s, (fx - a0) / (a1 - a0), (fy - b0) / (b1 - b0)];
    };

    const stepZoom = (dt: number) => {
      const goal = zIdx >= 0 && openGoal === 1 ? 1 : 0;
      zk += (goal - zk) * (1 - Math.exp(-dt * 5));
      if (Math.abs(goal - zk) < 0.002) zk = goal;
      if (!goal && zk === 0) {
        [cS, cTx, cTy] = pose(openT);
      } else {
        const [ts, tx, ty] = targetCam();
        const a = 1 - Math.exp(-dt * 5.5);
        cS += (ts - cS) * a;
        cTx += (tx - cTx) * a;
        cTy += (ty - cTy) * a;
      }
      clock += dt;
      const cur = zLastIdx >= 0 ? INSIDE_PARTS[zLastIdx] : null;
      if (cur && (cur.layer === "mech" || cur.layer === "spindle")) spin += dt * 150 * zk;
    };

    const zoomTick = (ts: number) => {
      const dt = zLast ? Math.min(0.05, (ts - zLast) / 1000) : 1 / 60;
      zLast = ts;
      stepZoom(dt);
      if (openT > 0) paintModel(openT);
      if ((zIdx >= 0 && openGoal === 1) || zk > 0) {
        zRaf = requestAnimationFrame(zoomTick);
      } else {
        zRaf = 0;
        zLast = 0;
      }
    };
    const runZoom = () => {
      if (!zRaf) zRaf = requestAnimationFrame(zoomTick);
    };

    const ctrl: Ctrl = {
      zoom: (i: number) => {
        if (i >= 0 && !openGoal) return;
        if (i >= 0 && zk <= 0) [cS, cTx, cTy] = pose(openT);
        zIdx = i;
        if (i >= 0) zLastIdx = i;
        runZoom();
      },
      open: () => {
        if (openGoal === 1) return;
        measure();
        apply(shown);
        openGoal = 1;
        setOpen(true);
        runOpen();
        window.setTimeout(() => {
          if (openGoal) closeRef.current?.focus({ preventScroll: true });
        }, OPEN_MS * 0.85);
      },
      close: () => {
        if (openGoal === 0) return;
        openGoal = 0;
        zIdx = -1;
        setSel(-1);
        runOpen();
        runZoom();
        window.setTimeout(() => {
          if (!openGoal) hotspotRef.current?.focus({ preventScroll: true });
        }, CLOSE_MS);
      },
      refresh: () => {
        if (openT > 0) paintOpen();
      },
    };
    ctrlRef.current = ctrl;

    // while the tile is open the page behind it stays put
    const stop = (e: Event) => {
      if (openGoal) e.preventDefault();
    };
    iris.addEventListener("wheel", stop, { passive: false });
    iris.addEventListener("touchmove", stop, { passive: false });
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || !openGoal) return;
      // first Esc leaves the zoomed part, the next one closes the tile
      if (selRef.current >= 0) setSel(-1);
      else ctrl.close();
    };
    window.addEventListener("keydown", onKey);

    const onResize = () => {
      measure();
      paintOpen();
      kick();
    };

    measure();
    apply(shown);
    paintOpen();

    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(pin);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (openRaf) cancelAnimationFrame(openRaf);
      if (zRaf) cancelAnimationFrame(zRaf);
      iris.removeEventListener("wheel", stop);
      iris.removeEventListener("touchmove", stop);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      ctrlRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  /* hover / selection highlight, applied with classList so the engine's inline positioning is never touched */
  useEffect(() => {
    const active = sel >= 0 ? sel : hot;
    INSIDE_PARTS.forEach((_, i) => {
      const isHot = i === active;
      const dim = active >= 0 && !isHot;
      for (const el of [labelEls.current[i], lineEls.current[i]]) {
        if (!el) continue;
        el.classList.toggle("is-hot", isHot);
        el.classList.toggle("is-dim", dim);
      }
    });
  }, [hot, sel]);

  /* selecting a part zooms the camera onto it (the engine does the moving) */
  useEffect(() => {
    selRef.current = sel;
    ctrlRef.current?.zoom(sel);
  }, [sel]);

  /* ---------- reduced motion: static list, no pinned scene ---------- */
  if (reduced) {
    return (
      <section id="specs" className="relative px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">{head}</div>
          <div className="space-y-8">
            <div className="overflow-hidden rounded-3xl border border-[var(--line-strong)] bg-white/80">
              {specs.map(([label, value]) => (
                <div
                  key={label}
                  className="grid gap-1 border-t border-[var(--line-strong)] px-6 py-5 first:border-t-0 sm:grid-cols-[11.5rem_1fr] sm:gap-6 sm:px-8"
                >
                  <span className="flex items-center gap-2.5 text-sm font-bold text-[#ea580c]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--neon-orange)]" />
                    {label}
                  </span>
                  <span className="text-sm text-[var(--text)] sm:text-[0.95rem]">{value}</span>
                </div>
              ))}
            </div>
            <div className="grid gap-px overflow-hidden rounded-3xl border border-[var(--line-strong)] bg-[var(--line-strong)] sm:grid-cols-2">
              {INSIDE_PARTS.map((p) => (
                <div key={p.id} className="bg-white/80 px-6 py-4">
                  <b className="text-sm text-[#ea580c]">{p.name}</b>
                  <p className="mt-1 text-sm text-[var(--muted)]">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  const active = sel >= 0 ? sel : hot;
  const part = active >= 0 ? INSIDE_PARTS[active] : null;
  const picked = sel >= 0 ? INSIDE_PARTS[sel] : null;
  const total = INSIDE_PARTS.length;

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    dragRef.current = { down: true, x: e.clientX };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.down) return;
    yawRef.current += (e.clientX - dragRef.current.x) * 0.35;
    dragRef.current.x = e.clientX;
    ctrlRef.current?.refresh();
  };
  const onUp = () => {
    dragRef.current.down = false;
  };

  return (
    <section id="specs" ref={runwayRef} className="ins-runway">
      {/* INSIDE TILE textmark: behind the shared tile (z 5 < 10) */}
      <div className="ins-bg" aria-hidden="true">
        <div className="ins-bg-pin">
          <div ref={markRef} className="ins-mark">
            <span className="ins-mark-text">INSIDE TILE</span>
          </div>
        </div>
      </div>

      {/* pinned layer: above the shared tile (z 20) */}
      <div ref={pinRef} className="ins-pin">
        <div className="ins-panel-wrap">
          <div className="ins-panel">
            <div ref={introRef} className="ins-intro">
              {head}
            </div>
          </div>
        </div>

        <button
          ref={hotspotRef}
          type="button"
          className="ins-hotspot"
          onClick={() => ctrlRef.current?.open()}
          aria-label="Open the tile to see what is inside"
        >
          <span className="ins-hotspot-label">Click the tile to open</span>
        </button>

        <div ref={ringRef} className="ins-iris-ring" aria-hidden="true" />

        {/* the opened tile, revealed through the footprint */}
        <div
          ref={irisRef}
          className={`ins-iris${compact ? " is-compact" : ""}${sel >= 0 ? " is-zoom" : ""}`}
          role="dialog"
          aria-label="Inside one tile"
          aria-hidden={!open}
        >
          <div className="ins-iris-glow" />
          <span className="ins-iris-mark textmark-shine" aria-hidden="true">
            INSIDE TILE
          </span>

          <div
            className="ins-drag"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
          />

          <div className="t3-stage ins-stage" role="img" aria-label="Exploded view of the BawatPieza tile">
            <div ref={iCamRef} className="t3-cam" style={{ opacity: 1 }}>
              <div ref={iSceneRef} className="t3-scene">
                <InsideTileModel />
              </div>
            </div>
          </div>

          <svg ref={linesRef} className="ins-lines" aria-hidden="true">
            {INSIDE_PARTS.map((p, i) => (
              <g
                key={p.id}
                ref={(el) => {
                  lineEls.current[i] = el;
                }}
              >
                <line />
                <circle r="3" />
                {/* invisible click target. Inline style, because .ins-lines circle in the CSS would otherwise paint it as a big white disc */}
                <circle
                  r="9"
                  className="ins-hit"
                  style={{ fill: "transparent", stroke: "none", pointerEvents: "all", cursor: "pointer" }}
                  onMouseEnter={() => setHot(i)}
                  onMouseLeave={() => setHot(-1)}
                  onClick={() => setSel((s) => (s === i ? -1 : i))}
                />
              </g>
            ))}
          </svg>

          <div ref={labelsRef} className="ins-labels">
            {INSIDE_PARTS.map((p, i) => (
              <button
                key={p.id}
                type="button"
                className="ins-label"
                ref={(el) => {
                  labelEls.current[i] = el;
                }}
                onMouseEnter={() => setHot(i)}
                onMouseLeave={() => setHot(-1)}
                onFocus={() => setHot(i)}
                onBlur={() => setHot(-1)}
                onClick={() => setSel((s) => (s === i ? -1 : i))}
                aria-pressed={sel === i}
              >
                <strong>{p.name}</strong>
                <small>{p.note}</small>
              </button>
            ))}
          </div>

          <div ref={uiRef} className="ins-ui" style={{ opacity: 0 }}>
            <div className="ins-top">
              <span className="ins-top-kicker">
                <span className="ins-top-bar" />
                Inside tile <em>{INSIDE_PARTS.length} parts</em>
              </span>
              <div className="ins-top-actions">
                <a href="#contact" className="ins-btn ins-btn-solid" onClick={() => ctrlRef.current?.close()}>
                  Request a pilot <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
                <button ref={closeRef} type="button" className="ins-btn" onClick={() => ctrlRef.current?.close()}>
                  <X className="h-3.5 w-3.5" aria-hidden="true" /> Close
                </button>
              </div>
            </div>

            <div className="ins-chips">
              {INSIDE_PARTS.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  className={sel === i ? "is-hot" : undefined}
                  onClick={() => setSel((s) => (s === i ? -1 : i))}
                >
                  {p.name}
                </button>
              ))}
            </div>

            {picked && (
              <aside key={picked.id} className="ins-detail" aria-live="polite">
                <span className="ins-detail-kicker">
                  Part {sel + 1} of {total}
                </span>
                <h3>{picked.name}</h3>
                <small>{picked.note}</small>
                <div className="ins-detail-block">
                  <b>What it is for</b>
                  <p>{picked.body}</p>
                </div>
                <div className="ins-detail-block">
                  <b>How it works</b>
                  <p>{HOW[picked.id]}</p>
                </div>
                <div className="ins-detail-nav">
                  <button type="button" onClick={() => setSel((sel - 1 + total) % total)} aria-label="Previous part">
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button type="button" className="ins-detail-back" onClick={() => setSel(-1)}>
                    All parts
                  </button>
                  <button type="button" onClick={() => setSel((sel + 1) % total)} aria-label="Next part">
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </aside>
            )}

            <div className="ins-caption" aria-live="polite">
              {part ? (
                <>
                  <b>{part.name}</b>
                  <span>{part.body}</span>
                </>
              ) : (
                <div className="ins-hint">
                  <span>Drag to turn the tile</span>
                  <i />
                  <span>{compact ? "Tap a part below to zoom in" : "Click a part to zoom in"}</span>
                  <i />
                  <a href="#contact" className="ins-cta" onClick={() => ctrlRef.current?.close()}>
                    Request a pilot <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}