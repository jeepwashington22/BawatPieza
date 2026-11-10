"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Z, TILT, YAW } from "@/components/HeroTileScroll";

const W = {
  travel: [0.0, 0.27], 
  grow: [0.0, 0.42], 
  introIn: [0.14, 0.27], 
  introOut: [0.4, 0.49], 
  cardIn: [0.46, 0.55],
  open: [0.3, 0.52], 
  stages: [0.53, 0.98], 
} as const;

const SMOOTHING = 8; 

const PARTS = [
  {
    tag: "TOP PLATE",
    title: "Load-rated top plate",
    body: "Takes every footstep and spreads it across the whole tile, sealed against rain and grit.",
    specs: [5, 0],
  },
  {
    tag: "PIEZO STACK",
    title: "Piezo disc stack",
    body: "Copper discs flex under the sharp strike and release a quick pulse of charge.",
    specs: [1, 2],
  },
  {
    tag: "DYNAMO",
    title: "Dynamo & power electronics",
    body: "Springs push the plate back up and spin the generator, banking the slower energy.",
    specs: [3, 4],
  },
  {
    tag: "BASE TRAY",
    title: "Base tray & frame",
    body: "A rigid tray carries the guide rods and wiring, and mounts straight onto an existing pathway.",
    specs: [6, 7],
  },
] as const;

const H = 72;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const range = (p: number, [a, b]: readonly [number, number]) => clamp01((p - a) / (b - a));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const zOf = (pair: readonly [number, number], t: number) => lerp(pair[0], pair[1], t);

type P3 = [number, number, number];
const rect = (hx: number, hy: number, cx: number, cy: number, z: number): P3[] => [
  [cx - hx, cy - hy, z],
  [cx + hx, cy - hy, z],
  [cx + hx, cy + hy, z],
  [cx - hx, cy + hy, z],
];
const circle = (r: number, z: number, n = 44): P3[] =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [Math.cos(a) * r, Math.sin(a) * r, z] as P3;
  });

export default function WhatsInsideScroll({
  specs,
  head,
  stageRef,
  camRef,
  sceneRef,
  veilRef,
  hlRef,
  tagRef
}: {
  specs: [string, string][];
  head: ReactNode;
  stageRef?: React.RefObject<HTMLDivElement | null>;
  camRef?: React.RefObject<HTMLDivElement | null>;
  sceneRef?: React.RefObject<HTMLDivElement | null>;
  veilRef?: React.RefObject<HTMLDivElement | null>;
  hlRef?: React.RefObject<SVGSVGElement | null>;
  tagRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const [reduced, setReduced] = useState(false);
  const [active, setActive] = useState(-1);
  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const runwayRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<SVGSVGElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const segRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const runway = runwayRef.current;
    const pin = pinRef.current;
    const cam = camRef?.current;
    const scene = sceneRef?.current;
    
    if (!runway || !pin || !cam || !scene) return;

    const one = (role: string) => scene.querySelector<HTMLElement>(`[data-role="${role}"]`);
    const plate = one("plate");
    const copper = one("copper");
    const mech = one("mech");
    const frame = one("frame");
    const spindle = one("spindle");
    const glow = one("glow");
    const shade = one("shade");
    const gear = one("gear");
    const gear2 = one("gear2");
    const rods = Array.from(scene.querySelectorAll<HTMLElement>('[data-role="rod"]'));
    const trail = trailRef.current;
    const trailLine = trail?.querySelector("line") ?? null;
    const veil = veilRef?.current;
    const hlPaths = hlRef?.current ? Array.from(hlRef.current.querySelectorAll("path")) : [];
    const tag = tagRef?.current;
    const intro = introRef.current;
    const card = cardRef.current;

    let vw = 1;
    let vh = 1;
    let persp = 2400;
    let desktop = true;
    let openScale = 1;
    let startScale = 1;
    let startCx = 0;
    let startCy = 0;
    let endCx = 0;
    let endCy = 0;

    const measure = () => {
      vw = pin.clientWidth;
      vh = pin.clientHeight;
      desktop = vw >= 1024;
      persp = window.innerWidth <= 640 ? 2800 : 2400;
      
      const availW = desktop ? vw * 0.54 : vw * 0.96;
      const availH = desktop ? vh - 170 : vh * 0.54;
      openScale = Math.max(0.3, Math.min(availH / 525, availW / 530));
      
      if (desktop) {
        // must match where HowItWorks leaves the tile: centred, no slide
        startScale = Math.min((vw * 0.5) / 517, (vh * 0.46) / 300);
        startCx = vw / 2;
        startCy = vh * 0.47;
        endCx = vw * 0.68;
        endCy = vh / 2 + 34;
      } else {
        const area = Math.min(vw * 0.85, 440);
        startScale = Math.min((vw * 0.74) / 517, (area * 0.6) / 300);
        startCx = vw / 2;
        startCy = area / 2;
        endCx = vw / 2;
        endCy = 56 + availH / 2;
      }
    };

    const readTarget = () => {
      const rect0 = runway.getBoundingClientRect();
      const distance = Math.max(1, runway.offsetHeight - pin.offsetHeight);
      return clamp01(-rect0.top / distance);
    };

    let activeNow = -1;

    const apply = (p: number) => {
      cam.style.transition = "none";
      cam.style.opacity = "1";

      const d = easeInOut(range(p, W.travel));
      const o = range(p, W.open);
      const s = lerp(startScale, openScale, easeInOut(range(p, W.grow)));
      const cx = lerp(startCx, endCx, d);
      const cy = lerp(startCy, endCy, d);
      
      const centreOff = lerp(-31, -148.5, smooth(o));
      const tx = cx - vw / 2;
      const ty = cy - vh / 2 - centreOff * s;

      const gate = smooth(range(p, [0.48, 0.55]));
      const sp = range(p, W.stages) * PARTS.length;
      const h = PARTS.map((_, i) => {
        const u = sp - i;
        const inn = smooth(clamp01(u / 0.18));
        const out = i === PARTS.length - 1 ? 1 : 1 - smooth(clamp01((u - 0.86) / 0.14));
        return inn * out * gate;
      });

      const nudge = [2, 5, -5, 2];
      let stageYaw = 0;
      h.forEach((v, i) => (stageYaw += v * nudge[i]));
      const yawDeg = lerp(YAW[1], YAW[0], d) + (YAW[1] - YAW[0]) * smooth(o) + stageYaw;

      cam.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) scale3d(${s.toFixed(4)}, ${s.toFixed(4)}, ${s.toFixed(4)})`;
      scene.style.transform = `rotateX(${TILT}deg) rotateZ(${yawDeg.toFixed(3)}deg)`;

      const tPlate = easeInOut(range(o, [0, 0.55]));
      const tCopper = easeInOut(range(o, [0.12, 0.75]));
      const tMech = easeInOut(range(o, [0.28, 0.92]));
      const tFrame = easeInOut(range(o, [0.4, 1]));
      
      const zPlate = zOf(Z.plate, tPlate) + 26 * h[0];
      const zCopper = zOf(Z.copper, tCopper) + 30 * h[1];
      const zMech = zOf(Z.mech, tMech) + 26 * h[2];
      const zFrame = zOf(Z.frame, tFrame) + 20 * h[3];

      if (plate) plate.style.transform = `translate3d(0,0,${zPlate.toFixed(2)}px)`;
      if (copper) copper.style.transform = `translate3d(0,0,${zCopper.toFixed(2)}px)`;
      if (mech) mech.style.transform = `translate3d(0,0,${zMech.toFixed(2)}px)`;
      if (frame) frame.style.transform = `translate3d(0,0,${zFrame.toFixed(2)}px)`;
      
      const spin = (o * 200 + clamp01(sp - 2) * 160).toFixed(2);
      if (gear) gear.style.transform = `translate3d(-45px,-45px,15px) rotateZ(${spin}deg)`;
      if (gear2) gear2.style.transform = `translate3d(-44px,-44px,13px) rotateZ(${spin}deg)`;
      
      if (spindle) {
        const base = zMech + 16;
        const k = Math.max(0.05, (zCopper - base) / 60);
        spindle.style.transform = `translate3d(0,0,${base.toFixed(2)}px) scale3d(1,1,${k.toFixed(4)})`;
      }
      
      const kRod = Math.max(0.05, (zPlate - 8) / 100);
      const rodT = `translate3d(0,0,8px) scale3d(1,1,${kRod.toFixed(4)})`;
      for (const el of rods) el.style.transform = rodT;
      
      if (glow) glow.style.opacity = smooth(range(o, [0.05, 0.5])).toFixed(3);
      if (shade) shade.style.opacity = (0.62 * smooth(range(o, [0, 0.35]))).toFixed(3);

      const yw = (yawDeg * Math.PI) / 180;
      const tl = (TILT * Math.PI) / 180;
      const project = (px: number, py: number, pz: number): [number, number] => {
        const x1 = px * Math.cos(yw) - py * Math.sin(yw);
        const y1 = px * Math.sin(yw) + py * Math.cos(yw);
        const y2 = y1 * Math.cos(tl) - pz * Math.sin(tl);
        const z2 = y1 * Math.sin(tl) + pz * Math.cos(tl);
        const f = persp / (persp - z2 * s);
        return [vw / 2 + (tx + x1 * s) * f, 0.45 * vh + (ty + 0.05 * vh + y2 * s) * f];
      };

      if (trail && trailLine) {
        trailLine.setAttribute("x1", startCx.toFixed(1));
        trailLine.setAttribute("y1", startCy.toFixed(1));
        trailLine.setAttribute("x2", cx.toFixed(1));
        trailLine.setAttribute("y2", cy.toFixed(1));
        trail.style.opacity = (smooth(range(p, [0.01, 0.06])) * (1 - smooth(range(p, [0.24, 0.36])))).toFixed(3);
      }

      const shapes: P3[][] = [
        rect(182, 182, 0, 0, zPlate + 29),
        circle(152, zCopper + 2),
        rect(140, 44, 0, 3, zMech + 30),
        rect(182, 182, 0, 0, H + 1), 
      ];
      
      let best = -1;
      let bestV = 0.002;
      let box = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
      
      shapes.forEach((pts, i) => {
        const path = hlPaths[i];
        if (!path) return;
        if (h[i] <= 0.002) {
          path.style.opacity = "0";
          return;
        }
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;
        let dStr = "";
        pts.forEach(([x, y, z], k) => {
          const [px, py] = project(x, y, z);
          dStr += `${k ? "L" : "M"}${px.toFixed(1)},${py.toFixed(1)}`;
          minX = Math.min(minX, px);
          maxX = Math.max(maxX, px);
          minY = Math.min(minY, py);
          maxY = Math.max(maxY, py);
        });
        path.setAttribute("d", dStr + "Z");
        path.style.opacity = h[i].toFixed(3);
        if (h[i] > bestV) {
          bestV = h[i];
          best = i;
          box = { minX, maxX, minY, maxY };
        }
      });

      if (veil) {
        if (best >= 0) {
          const r = Math.max(box.maxX - box.minX, box.maxY - box.minY) / 2;
          veil.style.setProperty("--sx", `${((box.minX + box.maxX) / 2).toFixed(1)}px`);
          veil.style.setProperty("--sy", `${((box.minY + box.maxY) / 2).toFixed(1)}px`);
          veil.style.setProperty("--sr", `${(r * 0.9 + 30).toFixed(1)}px`);
        }
        veil.style.opacity = bestV > 0.002 ? bestV.toFixed(3) : "0";
      }
      
      if (tag) {
        if (best >= 0 && desktop) {
          const tx2 = Math.min(box.maxX + 16, vw - 190);
          const ty2 = (box.minY + box.maxY) / 2;
          tag.style.transform = `translate3d(${tx2.toFixed(1)}px, ${ty2.toFixed(1)}px, 0) translateY(-50%)`;
          tag.style.opacity = bestV.toFixed(3);
          
          const tagN = tag.querySelector('b');
          const tagText = tag.querySelector('span');
          if (tagN) tagN.textContent = String(best + 1).padStart(2, "0");
          if (tagText) tagText.textContent = PARTS[best].tag;
        } else {
          tag.style.opacity = "0";
        }
      }

      if (intro) {
        const v = smooth(range(p, W.introIn)) * (1 - smooth(range(p, W.introOut)));
        intro.style.opacity = v.toFixed(3);
        intro.style.transform = `translate3d(0, ${((1 - smooth(range(p, W.introIn))) * 24 - smooth(range(p, W.introOut)) * 18).toFixed(1)}px, 0)`;
        intro.style.visibility = v < 0.01 ? "hidden" : "visible";
      }
      
      if (card) {
        const v = smooth(range(p, W.cardIn));
        card.style.opacity = v.toFixed(3);
        card.style.transform = `translate3d(0, ${((1 - v) * 24).toFixed(1)}px, 0)`;
        card.style.visibility = v < 0.01 ? "hidden" : "visible";
      }
      
      segRefs.current.forEach((el, i) => {
        if (el) el.style.transform = `scaleX(${clamp01(sp - i).toFixed(4)})`;
      });

      const idx = p < 0.5 ? -1 : Math.min(PARTS.length - 1, Math.floor(sp));
      if (idx !== activeNow) {
        activeNow = idx;
        setActive(idx);
      }
    };

    measure();

    let rafId = 0;
    let shown = readTarget();
    let lastTs = 0;

    const tick = (ts: number) => {
      const dt = lastTs ? Math.min(0.05, (ts - lastTs) / 1000) : 1 / 60;
      lastTs = ts;
      const target = readTarget();
      shown += (target - shown) * (1 - Math.exp(-dt * SMOOTHING));
      if (Math.abs(target - shown) < 0.00025) shown = target;
      
      // Let HowItWorks command the tile until we scroll downwards into WhatsInsideScroll.
      if (shown > 0 || target > 0) {
        apply(shown);
      }
      
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

    // Protect initialization so it doesn't break the starting state of the upper component.
    if (shown > 0) {
      apply(shown);
    }

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
  }, [reduced]);

  if (reduced) {
    return (
      <section id="specs" className="relative px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">{head}</div>
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
        </div>
      </section>
    );
  }

  const part = PARTS[Math.max(0, active)];

  return (
    <section id="specs" ref={runwayRef} className="wi-runway">
      <div ref={pinRef} className="wi-pin">
        <svg ref={trailRef} className="wi-trail" aria-hidden="true">
          <line stroke="var(--neon-orange)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 14" />
        </svg>

        <div className="wi-panel-wrap relative z-[20]">
          <div className="wi-panel">
            <div ref={introRef} className="wi-intro">
              {head}
              <a
                href="#contact"
                className="group mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[#ff9a3c] to-[#ea580c] px-6 py-3 text-sm font-bold text-white shadow-[0_12px_28px_-8px_rgba(234,88,12,0.6)] transition hover:-translate-y-0.5"
              >
                Request a pilot <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </a>
            </div>

            <div ref={cardRef} className="wi-card" aria-live="polite">
              <div className="wi-progress" aria-hidden="true">
                {PARTS.map((p, i) => (
                  <span key={p.tag}>
                    <i
                      ref={(el) => {
                        segRefs.current[i] = el;
                      }}
                    />
                  </span>
                ))}
              </div>
              <div key={active} className="wi-card-body">
                <span className="wi-kicker">
                  {String(Math.max(0, active) + 1).padStart(2, "0")} / {String(PARTS.length).padStart(2, "0")}
                </span>
                <h3>{part.title}</h3>
                <p>{part.body}</p>
                <div className="wi-specs">
                  {part.specs.map((i) => (
                    <div key={specs[i][0]} className="wi-spec">
                      <b>{specs[i][0]}</b>
                      <span>{specs[i][1]}</span>
                    </div>
                  ))}
                </div>
                {active === PARTS.length - 1 && (
                  <a href="#contact" className="wi-card-cta">
                    Request a pilot <ArrowRight className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}