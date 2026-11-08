"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/* ---------- tweak here ---------- */
const VIDEO_SRC = "/videos/bawat-pieza-tile.mp4";
const VIDEO_POSTER = "/videos/bawat-pieza-tile-poster.jpg";

// Scroll timeline, 0 → 1 across the whole pinned runway.
const T = {
  copyOut: [0.16, 0.28], // headline + kicker fade away after the overview hold
  wordmarkOut: [0.2, 0.38], // BAWATPIEZA fades + drifts after the overview hold
  tileMove: [0.18, 0.58], // tile tilts in 3D and eases toward the video framing
  darken: [0.34, 0.54], // red hero fades to the video's dark studio
  handoff: [0.46, 0.72], // tile.svg → video cross-fade
  scrub: [0.62, 0.98], // video plays with scroll in this range
} as const;

// tiles.svg and video frame 0 are the same tile but framed slightly differently.
// These nudge the zoomed SVG so the cross-fade lands cleanly. Tune by eye.
const FIT_SCALE = 0.96;
const FIT_Y = 0.046; // fraction of pin height

// Captions follow the video's own time (seconds).
const CAPTIONS = [
  { at: 0, label: "Sealed enclosure", body: "A load-rated top plate hides the whole mechanism." },
  { at: 1.6, label: "Plate lifts away", body: "Lift the cover and the hybrid core sits right underneath." },
  { at: 3.6, label: "Piezo + dynamo exposed", body: "Piezo discs catch the strike, the dynamo catches the spring-back." },
  { at: 6.4, label: "Every part, labelled", body: "" },
];

const GRADIENT_TEXT =
  "bg-gradient-to-r from-[#ffb15c] via-[var(--neon-orange)] to-[#ea580c] bg-clip-text text-transparent";

/* ---------- helpers ---------- */
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const range = (p: number, [a, b]: readonly [number, number]) => clamp01((p - a) / (b - a));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const smooth = (t: number) => t * t * (3 - 2 * t);

export default function HeroTileScroll() {
  const runwayRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const tileRef = useRef<HTMLImageElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const darkRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const insideRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  const [caption, setCaption] = useState(0);

  useEffect(() => {
    const runway = runwayRef.current;
    const pin = pinRef.current;
    const video = videoRef.current;
    const tile = tileRef.current;
    const stage = stageRef.current;
    if (!runway || !pin || !video || !tile || !stage) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return; // CSS collapses the runway; the static hero stays as-is

    let rafId = 0;
    let targetP = 0; // real scroll progress
    let shownP = 0; // eased progress used for visuals
    let targetTime = 0;
    let shownTime = 0;
    let lastCaption = 0;
    let videoReady = false;

    // geometry of the tile at rest (offset* ignores transforms, so this is stable)
    let zoom = 1;
    let shiftY = 0;
    const measure = () => {
      const W = pin.clientWidth;
      const H = pin.clientHeight;
      const imgW = tile.offsetWidth || 1;
      const imgH = tile.offsetHeight || 1;
      const restCenterY = stage.offsetTop + tile.offsetTop + imgH / 2;
      const containSize = Math.min(W, H * (16 / 9));
      zoom = (containSize / imgW) * FIT_SCALE;
      shiftY = H / 2 + H * FIT_Y - restCenterY;
    };

    const readScroll = () => {
      const rect = runway.getBoundingClientRect();
      const distance = Math.max(1, runway.offsetHeight - pin.offsetHeight);
      targetP = clamp01(-rect.top / distance);
    };

    const render = () => {
      rafId = 0;
      // ease visuals toward the real scroll position → feels weighty, not twitchy
      shownP += (targetP - shownP) * 0.08;
      if (Math.abs(targetP - shownP) < 0.0004) shownP = targetP;
      const p = shownP;

      // tile: tilt in 3D mid-flight, land flat & full-bleed
      const m = easeInOut(range(p, T.tileMove));
      const arc = Math.sin(Math.PI * m); // 0 → 1 → 0
      tile.style.transform =
        `translate3d(0, ${shiftY * m}px, ${arc * 120}px) ` +
        `rotateX(${arc * 14}deg) rotateY(${arc * -9}deg) ` +
        `scale(${1 + (zoom - 1) * m})`;
      const tileFade = 1 - smooth(range(p, T.handoff));
      tile.style.opacity = String(tileFade);

      // headline + wordmarks
      const c = range(p, T.copyOut);
      if (copyRef.current) {
        copyRef.current.style.opacity = String(1 - c);
        copyRef.current.style.transform = `translate3d(0, ${-c * 40}px, 0)`;
      }
      const w = range(p, T.wordmarkOut);
      if (wordmarkRef.current) {
        wordmarkRef.current.style.opacity = String(1 - w);
        wordmarkRef.current.style.transform = `translate3d(-50%, ${-w * 60}px, 0) scale(${1 + w * 0.12})`;
      }

      // background + video
      if (darkRef.current) darkRef.current.style.opacity = String(smooth(range(p, T.darken)));
      video.style.opacity = String(videoReady ? smooth(range(p, T.handoff)) : 0);

      // scroll hint vs "inside the tile" readout
      if (hintRef.current) hintRef.current.style.opacity = String(1 - range(p, [0, 0.06]));
      const s = range(p, T.scrub);
      if (insideRef.current) insideRef.current.style.opacity = String(smooth(range(p, [0.24, 0.32])));
      if (barRef.current) barRef.current.style.transform = `scaleX(${s})`;

      // video scrub
      const dur = video.duration;
      if (Number.isFinite(dur) && dur > 0) {
        targetTime = s * (dur - 0.04);
        shownTime += (targetTime - shownTime) * 0.12;
        if (Math.abs(targetTime - shownTime) < 0.005) shownTime = targetTime;
        if (Math.abs(video.currentTime - shownTime) > 1 / 120) video.currentTime = shownTime;

        let idx = 0;
        CAPTIONS.forEach((cap, i) => {
          if (shownTime >= cap.at) idx = i;
        });
        if (idx !== lastCaption) {
          lastCaption = idx;
          setCaption(idx);
        }
      }

      // keep animating until visuals have caught up with the scroll
      if (Math.abs(targetP - shownP) > 0.0004 || Math.abs(targetTime - shownTime) > 0.01) {
        rafId = requestAnimationFrame(render);
      }
    };

    const kick = () => {
      if (!rafId) rafId = requestAnimationFrame(render);
    };
    const onScroll = () => {
      readScroll();
      kick();
    };
    const onResize = () => {
      measure();
      onScroll();
    };

    // prime the video so the first seek is instant
    video.pause();
    video.load();
    const onReady = () => {
      videoReady = true;
      video.currentTime = 0;
      kick();
    };
    video.addEventListener("loadeddata", onReady);
    video.addEventListener("canplay", onReady);

    measure();
    readScroll();
    shownP = targetP;
    render();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    // the tile image may finish loading after mount → re-measure
    tile.addEventListener("load", onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(pin);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("canplay", onReady);
      tile.removeEventListener("load", onResize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
  }, []);

  const cap = CAPTIONS[caption];

  return (
    <section id="about" ref={runwayRef} className="hero-runway">
      <div
        ref={pinRef}
        className="hero-section hero-pin relative flex items-center overflow-hidden px-4 pb-14 pt-20 sm:px-6 lg:px-8 lg:pt-16"
      >
        <div ref={wordmarkRef} className="hero-wordmarks" aria-hidden="true">
          <span>BAWATPIEZA</span>
        </div>
        <p className="hero-quote">
          “Every step leaves a little<br />
          power behind.”
        </p>

        {/* dark studio layer: red hero → black, so the video hand-off has no red bleed */}
        <div ref={darkRef} className="hero-dark" aria-hidden="true" />

        {/* scroll-scrubbed video (muted, no controls, never autoplays) */}
        <video
          ref={videoRef}
          className="hero-video"
          src={VIDEO_SRC}
          poster={VIDEO_POSTER}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          aria-hidden="true"
          tabIndex={-1}
        />

        <div ref={stageRef} className="hero-product-stage" aria-label="BawatPieza kinetic energy tile">
          <Image
            ref={tileRef}
            src="/tiles.svg"
            alt=""
            width={1920}
            height={1080}
            priority
            className="hero-product-box"
          />
        </div>

        <div ref={copyRef} className="hero-copy">
          <span className="hero-kicker">KINETIC ENERGY / BAWATPIEZA</span>
          <h1 className="mt-4 max-w-xl text-4xl font-extrabold leading-[0.98] tracking-tight text-white sm:text-5xl xl:text-[4.2rem]">
            Every step leaves a little<br />
            <span className={GRADIENT_TEXT}>power behind.</span>
          </h1>
        </div>

        {/* scroll hint (only at the very top) */}
        <div ref={hintRef} className="hero-hint" aria-hidden="true">
          <span>Scroll to open the tile</span>
          <i />
        </div>

        {/* "inside the tile" readout while the video plays */}
        <div ref={insideRef} className="hero-inside" style={{ opacity: 0 }}>
          <span className="hero-inside-eyebrow">Inside the tile</span>
          <strong key={caption} className="hero-inside-label">{cap.label}</strong>
          {cap.body && <p key={`b${caption}`} className="hero-inside-body">{cap.body}</p>}
          <span className="hero-inside-track" aria-hidden="true">
            <span ref={barRef} className="hero-inside-fill" />
          </span>
        </div>
      </div>
    </section>
  );
}