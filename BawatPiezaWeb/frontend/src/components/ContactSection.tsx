"use client";

import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { TileModel, TILT, YAW, Z } from "@/components/HeroTileScroll";

/* =====================================================================
   CONTACT

   Mirror of the FAQ split: a big shiny CONTACT textmark behind, the content
   on a blurred panel on the left, the tile on the right. When the section
   scrolls into view it plays by itself:

     1. the tile drops in at the centre of the screen and lands
     2. it turns a little and slides to the right half
     3. it opens up (plate, discs, mechanism and frame lift apart)
     4. the blurred panel with the contact form glides in from the left

   It replays every time the section scrolls back into view.
   The tile uses the same TileModel + opening maths as the hero.
   ===================================================================== */

const CLOSED_W = 517;
const CLOSED_H = 300;
const CLOSED_CY = -31;

const FALL_MS = 1100;
const SLIDE_AT = 950;
const SLIDE_MS = 1000;
const OPEN_AT = 1800;
const OPEN_MS = 1700;
const PANEL_AT = 1250;
const TOTAL_MS = OPEN_AT + OPEN_MS;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const rng = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** 1 = still above the screen, 0 = landed (with a tiny bounce) */
function airborne(t: number) {
  if (t <= 0) return 1;
  if (t >= 1) return 0;
  const LAND = 0.72;
  if (t < LAND) {
    const k = t / LAND;
    return 1 - k * k;
  }
  const k = (t - LAND) / (1 - LAND);
  return 0.045 * Math.sin(Math.PI * k) * (1 - k);
}

const GRADIENT_TEXT =
  "bg-gradient-to-r from-white via-[#fff1e0] to-[#ffd2a3] bg-clip-text text-transparent";

const NEXT_STEPS = [
  ["01", "Share your pathway", "Tell us about the place and the people moving through it."],
  ["02", "Shape the opportunity", "We map the traffic pattern to a practical pilot."],
  ["03", "Power what matters", "We pick the best low-draw use for every step."],
];

const FIELD =
  "w-full rounded-xl border border-white/35 bg-white/10 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/70 focus:border-white/80 focus:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/50";

export default function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const camRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const cam = camRef.current;
    const scene = sceneRef.current;
    if (!section || !stage || !cam || !scene) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const one = (role: string) => scene.querySelector<HTMLElement>(`[data-role="${role}"]`);
    const plate = one("plate");
    const copper = one("copper");
    const mech = one("mech");
    const frame = one("frame");
    const gear = one("gear");
    const gear2 = one("gear2");
    const spindle = one("spindle");
    const glow = one("glow");
    const shade = one("shade");
    const rods = Array.from(scene.querySelectorAll<HTMLElement>('[data-role="rod"]'));
    const shadow = scene.querySelector<HTMLElement>(".t3-shadow");

    let vw = 1;
    let vh = 1;
    let scale = 1;
    let frac = 0.5;
    let dxEnd = 0;
    let fallDist = 0;

    const measure = () => {
      vw = section.clientWidth;
      vh = section.clientHeight;
      if (vw >= 1024) {
        // tile ends up centred in the right half
        scale = Math.min((vw * 0.5 * 0.72) / CLOSED_W, (vh * 0.36) / CLOSED_H);
        frac = 0.5;
        dxEnd = vw * 0.25;
      } else {
        // stacked: the tile stays centred above the panel
        const area = Math.min(vw * 0.95, 460);
        scale = Math.min((vw * 0.7) / CLOSED_W, (area * 0.45) / CLOSED_H);
        frac = area / 2 / vh;
        dxEnd = 0;
      }
      fallDist = frac * vh + 150 * scale + 40;
    };

    /** air: 1 above the screen → 0 landed. slide: 0 centre → 1 right. open: 0 closed → 1 exploded. */
    const pose = (air: number, slide: number, open: number) => {
      const s = scale * (1 - 0.14 * open);
      const x = dxEnd * slide;
      // the opened stack grows upward, so the camera drops a little to keep it centred
      const y = (frac - 0.5) * vh - CLOSED_CY * scale - fallDist * air + 120 * scale * open;
      cam.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale3d(${s.toFixed(4)}, ${s.toFixed(4)}, ${s.toFixed(4)})`;

      const sy = vh * 0.5 + y + CLOSED_CY * scale;
      stage.style.perspectiveOrigin = `${(vw / 2 + x).toFixed(1)}px ${(sy - vh * 0.05).toFixed(1)}px`;
      cam.style.opacity = smooth(clamp01((sy - 60) / 90)).toFixed(3);

      const yaw = lerp(YAW[0], YAW[1], smooth(slide)) + 70 * air;
      scene.style.transform = `rotateX(${TILT}deg) rotateZ(${yaw.toFixed(3)}deg)`;
      if (shadow) shadow.style.opacity = smooth(clamp01(1 - air * 1.4)).toFixed(3);

      // layers separate in a stagger: plate first, frame last (same as the hero)
      const zPlate = lerp(Z.plate[0], Z.plate[1], easeInOut(rng(open, 0, 0.55)));
      const zCopper = lerp(Z.copper[0], Z.copper[1], easeInOut(rng(open, 0.12, 0.75)));
      const zMech = lerp(Z.mech[0], Z.mech[1], easeInOut(rng(open, 0.28, 0.92)));
      const zFrame = lerp(Z.frame[0], Z.frame[1], easeInOut(rng(open, 0.4, 1)));
      if (plate) plate.style.transform = `translate3d(0,0,${zPlate.toFixed(2)}px)`;
      if (copper) copper.style.transform = `translate3d(0,0,${zCopper.toFixed(2)}px)`;
      if (mech) mech.style.transform = `translate3d(0,0,${zMech.toFixed(2)}px)`;
      if (frame) frame.style.transform = `translate3d(0,0,${zFrame.toFixed(2)}px)`;

      const spin = (open * 200).toFixed(2);
      if (gear) gear.style.transform = `translate3d(-45px,-45px,15px) rotateZ(${spin}deg)`;
      if (gear2) gear2.style.transform = `translate3d(-44px,-44px,13px) rotateZ(${spin}deg)`;
      if (spindle) {
        const base = zMech + 16;
        const k = Math.max(0.05, (zCopper - base) / 60);
        spindle.style.transform = `translate3d(0,0,${base.toFixed(2)}px) scale3d(1,1,${k.toFixed(4)})`;
      }
      const kRod = Math.max(0.05, (zPlate - 8) / 100);
      for (const el of rods) el.style.transform = `translate3d(0,0,8px) scale3d(1,1,${kRod.toFixed(4)})`;

      if (glow) glow.style.opacity = smooth(rng(open, 0.05, 0.5)).toFixed(3);
      if (shade) shade.style.opacity = (0.62 * smooth(rng(open, 0, 0.35))).toFixed(3);
    };

    measure();

    let rafId = 0;
    let timer = 0;
    let state: "idle" | "playing" | "done" = "idle";
    let inView = false;

    const stopAnim = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      window.clearTimeout(timer);
    };

    const hideNow = () => {
      stopAnim();
      section.classList.remove("is-play", "ct-in");
      pose(1, 0, 0);
      state = "idle";
    };

    const play = () => {
      hideNow();
      section.classList.add("is-play"); // CONTACT textmark pops in behind the falling tile
      if (reduceMotion) {
        pose(0, 1, 1);
        section.classList.add("ct-in");
        state = "done";
        return;
      }
      state = "playing";
      const t0 = performance.now();
      timer = window.setTimeout(() => section.classList.add("ct-in"), PANEL_AT);
      const step = (now: number) => {
        const t = now - t0;
        pose(
          airborne(clamp01(t / FALL_MS)),
          easeInOut(clamp01((t - SLIDE_AT) / SLIDE_MS)),
          easeInOut(clamp01((t - OPEN_AT) / OPEN_MS)),
        );
        if (t < TOTAL_MS) {
          rafId = requestAnimationFrame(step);
        } else {
          pose(0, 1, 1);
          state = "done";
        }
      };
      rafId = requestAnimationFrame(step);
    };

    pose(1, 0, 0);

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.intersectionRatio >= 0.35) {
            inView = true;
            if (state === "idle") play();
          } else if (e.intersectionRatio === 0) {
            inView = false;
            if (state !== "idle") hideNow(); // fully off screen: reset so it replays next time
          }
        }
      },
      { threshold: [0, 0.35] },
    );
    io.observe(section);

    const onVisibility = () => {
      if (document.visibilityState === "visible" && inView && state === "idle") play();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onResize = () => {
      measure();
      if (state === "done") pose(0, 1, 1);
      else if (state === "idle") pose(1, 0, 0);
    };
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(section);

    return () => {
      stopAnim();
      document.removeEventListener("visibilitychange", onVisibility);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const subject = encodeURIComponent(`Pilot enquiry from ${name || "a visitor"}`);
    const body = encodeURIComponent(`${message}\n\n${name}\n${email}`);
    window.location.href = `mailto:hello@bawatpieza.com?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <section id="contact" ref={sectionRef} className="ct-section" aria-label="Contact">
      {/* background textmark, same shiny treatment as FAQ */}
      <div className="ct-mark" aria-hidden="true">
        <span className="textmark-shine">CONTACT</span>
      </div>

      {/* the tile: drops in, slides right, opens */}
      <div ref={stageRef} className="t3-stage ct-stage" role="img" aria-label="BawatPieza energy tile opening up">
        <div ref={camRef} className="t3-cam">
          <div ref={sceneRef} className="t3-scene">
            <TileModel />
          </div>
        </div>
      </div>

      <div className="ct-grid">
        {/* right half (desktop): empty on purpose, the tile lands here */}
        <div className="ct-tile-area" aria-hidden="true" />

        {/* left half (desktop): blurred panel with the form */}
        <div className="ct-panel">
          <div className="mx-auto w-full max-w-xl">
            <span
              className="ct-rise inline-flex items-center gap-3 text-[0.7rem] font-extrabold uppercase tracking-[0.2em] text-white"
              style={{ "--i": 0 } as CSSProperties}
            >
              <span className="block h-0.5 w-6 rounded bg-white" />
              Start a conversation
            </span>
            <h2
              className="ct-rise mt-5 text-4xl font-extrabold leading-[0.98] tracking-[-0.045em] text-white sm:text-5xl"
              style={{ "--i": 1 } as CSSProperties}
            >
              Make every step <span className={GRADIENT_TEXT}>count.</span>
            </h2>
            <p
              className="ct-rise mt-4 max-w-md text-sm leading-relaxed text-white/90 sm:text-base"
              style={{ "--i": 2 } as CSSProperties}
            >
              Tell us where people walk. We’ll help you turn that everyday movement into a smarter, more useful pathway.
            </p>

            <form onSubmit={onSubmit} className="ct-rise mt-7 space-y-3" style={{ "--i": 3 } as CSSProperties}>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="sr-only">Your name</span>
                  <input name="name" type="text" required autoComplete="name" placeholder="Your name" className={FIELD} />
                </label>
                <label className="block">
                  <span className="sr-only">Email address</span>
                  <input name="email" type="email" required autoComplete="email" placeholder="Email address" className={FIELD} />
                </label>
              </div>
              <label className="block">
                <span className="sr-only">Where do people walk, and what do you want to power?</span>
                <textarea
                  name="message"
                  required
                  rows={4}
                  placeholder="Where do people walk, and what do you want to power?"
                  className={`${FIELD} resize-none`}
                />
              </label>
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <button
                  type="submit"
                  className="group inline-flex items-center gap-2 rounded-full bg-[#152238] px-6 py-3.5 text-sm font-bold text-white shadow-[0_14px_30px_-10px_rgba(21,34,56,0.6)] transition duration-300 hover:-translate-y-1 hover:bg-[#1f3252] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Send message
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                </button>
                <a
                  href="mailto:hello@bawatpieza.com"
                  className="text-xs font-medium text-white/85 transition hover:text-white hover:underline"
                >
                  or write to hello@bawatpieza.com
                </a>
              </div>
              <p className="min-h-[1rem] text-xs text-white/85" role="status" aria-live="polite">
                {sent ? "Your email app should open with the message ready to send." : ""}
              </p>
            </form>

            <ol
              className="ct-rise mt-6 grid gap-4 border-t border-white/30 pt-5 sm:grid-cols-3"
              style={{ "--i": 4 } as CSSProperties}
            >
              {NEXT_STEPS.map(([n, title, body]) => (
                <li key={n}>
                  <span className="font-mono text-xs font-bold text-[#152238]">{n}</span>
                  <h3 className="mt-1 text-sm font-bold text-white">{title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-white/85">{body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}