"use client";

import { useEffect, useRef, type ComponentType } from "react";
import { TILT, YAW, Z } from "./HeroTileScroll";

export type HowStep = {
  n: string;
  icon: ComponentType<{ className?: string }>;
  title: string;
  body: string;
};

const FALL_MS = 1100;
const SETTLE_AT = 900; // the tile only turns a little after landing, it no longer slides
const SETTLE_MS = 700;
const CONTENT_AT = 1100;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const CLOSED_W = 517;
const CLOSED_H = 300;
const CLOSED_CY = -31;

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

export default function HowItWorks({
  steps = [],
  stageRef,
  camRef,
  sceneRef,
}: {
  steps: HowStep[];
  stageRef?: React.RefObject<HTMLDivElement | null>;
  camRef?: React.RefObject<HTMLDivElement | null>;
  sceneRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef?.current;
    const cam = camRef?.current;
    const scene = sceneRef?.current;

    if (!section || !cam || !scene) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const shadow = scene.querySelector<HTMLElement>(".t3-shadow");

    const one = (role: string) => scene.querySelector<HTMLElement>(`[data-role="${role}"]`);
    const zPlate = Z.plate[0];
    const zCopper = Z.copper[0];
    const zMech = Z.mech[0];
    const zFrame = Z.frame[0];

    const place = (el: HTMLElement | null, z: number) => {
      if (el) el.style.transform = `translate3d(0,0,${z}px)`;
    };

    place(one("plate"), zPlate);
    place(one("copper"), zCopper);
    place(one("mech"), zMech);
    place(one("frame"), zFrame);

    const gear = one("gear");
    const gear2 = one("gear2");
    if (gear) gear.style.transform = "translate3d(-45px,-45px,15px) rotateZ(0deg)";
    if (gear2) gear2.style.transform = "translate3d(-44px,-44px,13px) rotateZ(0deg)";

    const spindle = one("spindle");
    if (spindle) {
      const base = zMech + 16;
      const k = Math.max(0.05, (zCopper - base) / 60);
      spindle.style.transform = `translate3d(0,0,${base}px) scale3d(1,1,${k.toFixed(4)})`;
    }

    const kRod = Math.max(0.05, (zPlate - 8) / 100);
    for (const rod of Array.from(scene.querySelectorAll<HTMLElement>('[data-role="rod"]'))) {
      rod.style.transform = `translate3d(0,0,8px) scale3d(1,1,${kRod.toFixed(4)})`;
    }

    let vw = 1;
    let vh = 1;
    let scale = 1; // one size for the whole fall: the tile lands and stays
    let fallDist = 0;
    let frac = 0.5; // where the tile's centre sits, as a fraction of the section height

    const measure = () => {
      vw = section.clientWidth;
      vh = section.clientHeight;
      if (vw < 1024) {
        const area = Math.min(vw * 0.85, 440);
        scale = Math.min((vw * 0.74) / CLOSED_W, (area * 0.6) / CLOSED_H);
        frac = area / 2 / vh;
      } else {
        // centred between the small heading on top and the glass row at the bottom
        scale = Math.min((vw * 0.5) / CLOSED_W, (vh * 0.46) / CLOSED_H);
        frac = 0.47;
      }
      fallDist = frac * vh + 150 * scale + 40;
    };

    // air: 1 = still above the screen, 0 = landed. settle: yaw turn only, no sliding.
    const pose = (air: number, settle: number) => {
      const y = (frac - 0.5) * vh - CLOSED_CY * scale - fallDist * air;
      cam.style.transform = `translate3d(0px, ${y.toFixed(2)}px, 0) scale3d(${scale.toFixed(4)}, ${scale.toFixed(4)}, ${scale.toFixed(4)})`;

      const sy = vh * 0.5 + y + CLOSED_CY * scale;
      if (stage) stage.style.perspectiveOrigin = `${(vw / 2).toFixed(1)}px ${(sy - vh * 0.05).toFixed(1)}px`;

      cam.style.opacity = smooth(clamp01((sy - 60) / 90)).toFixed(3);

      const yaw = lerp(YAW[0], YAW[1], settle) + 70 * air;
      scene.style.transform = `rotateX(${TILT}deg) rotateZ(${yaw.toFixed(3)}deg)`;
      if (shadow) shadow.style.opacity = smooth(clamp01(1 - air * 1.4)).toFixed(3);
    };

    measure();

    let rafId = 0;
    let timer = 0;
    let resetTimer = 0;
    let state: "idle" | "playing" | "in" = "idle";
    let inView = false;

    const stopAnim = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      window.clearTimeout(timer);
      window.clearTimeout(resetTimer);
    };

    const hideNow = () => {
      stopAnim();
      cam.style.transition = "none";
      section.classList.remove("is-in", "is-play");
      pose(1, 0);
      state = "idle";
    };

    const play = () => {
      hideNow();
      cam.style.transition = "none";
      section.classList.add("is-play"); // BAWATPIEZA wordmark fades in behind the falling tile
      if (reduceMotion) {
        pose(0, 1);
        section.classList.add("is-in");
        state = "in";
        return;
      }
      state = "playing";
      const t0 = performance.now();
      timer = window.setTimeout(() => section.classList.add("is-in"), CONTENT_AT);
      const frame = (now: number) => {
        const t = now - t0;
        pose(airborne(clamp01(t / FALL_MS)), easeInOut(clamp01((t - SETTLE_AT) / SETTLE_MS)));
        if (t < SETTLE_AT + SETTLE_MS) {
          rafId = requestAnimationFrame(frame);
        } else {
          pose(0, 1);
          state = "in";
        }
      };
      rafId = requestAnimationFrame(frame);
    };

    const exit = () => {
      if (state === "idle") return;
      stopAnim();
      state = "idle";
      section.classList.remove("is-in", "is-play");
      if (reduceMotion) {
        hideNow();
        return;
      }
      cam.style.transition = "opacity 450ms ease";
      cam.style.opacity = "0";
      resetTimer = window.setTimeout(hideNow, 520);
    };

    pose(1, 0);

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.intersectionRatio >= 0.35) {
            inView = true;
            if (state === "idle") play();
          } else if (e.intersectionRatio < 0.2) {
            inView = false;
            // Only hide the tile when scrolling UP out of the section into the Hero
            if (e.boundingClientRect.top > 0) {
              exit();
            }
          }
        }
      },
      { threshold: [0, 0.2, 0.35] },
    );
    io.observe(section);

    const onVisibility = () => {
      if (document.visibilityState === "visible" && inView) play();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onResize = () => {
      measure();
      if (state === "in") pose(0, 1);
      else if (state === "idle") pose(1, 0);
    };
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(section);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.clearTimeout(timer);
      window.clearTimeout(resetTimer);
      document.removeEventListener("visibilitychange", onVisibility);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section id="how" ref={sectionRef} className="hw-section">
      {/* same big background mark as the hero, sits behind the tile */}
      <div className="hw-wordmark" aria-hidden="true">
        <span className="textmark-shine">BAWATPIEZA</span>
      </div>

      <div className="hw-head">
        <div className="hw-head-l">
          <span className="hw-eyebrow">How it works</span>
          <h2 className="hw-title">
            One footstep, <span className="hw-title-accent">two harvesting paths.</span>
          </h2>
        </div>
        <p className="hw-lead">
          Every footfall presses a piezoelectric stack, while a small dynamo underneath a weatherproof plate
          captures the rest.
        </p>
      </div>

      <div className="hw-steps">
        {steps?.map(({ n, icon: Icon, title, body }, i) => (
          <article key={n} className="hw-card" style={{ ["--i" as string]: i, ["--r" as string]: steps.length - 1 - i }}>
            <div className="hw-card-top">
              <span className="hw-card-icon">
                <Icon aria-hidden="true" />
              </span>
              <span className="hw-card-n">{n}</span>
            </div>
            <h3>{title}</h3>
            <p>{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}