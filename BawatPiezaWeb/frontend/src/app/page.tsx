"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  Footprints,
  ArrowRight,
  Zap,
  BatteryCharging,
  Lightbulb,
} from "lucide-react";
import SmartPreloader from "@/components/ui/smart-preloader";
import AccumulatedGeneration from "@/components/AccumulatedGeneration";
import HeroTileScroll, { TileModel } from "@/components/HeroTileScroll";
import HowItWorks from "@/components/HowItWorks";
import WhatsInsideScroll from "@/components/WhatsInsideScroll";
import Footer from "@/components/Footer";
import Faqs01 from "@/components/ui/faqs-01";
import HomeNav from "@/components/HomeNav";
import ContactSection from "@/components/ContactSection";

/* ---------- content (edit copy / image paths here) ---------- */
const STEPS = [
  { n: "01", icon: Footprints, title: "Footfall compresses the tile", body: "Each step flexes the hybrid core beneath the floor plate, without any noticeable give underfoot." },
  { n: "02", icon: Zap, title: "Two paths fire at once", body: "The piezo stack captures the sharp strike, while the dynamo captures the slower spring-back." },
  { n: "03", icon: BatteryCharging, title: "Power is converted and stored", body: "Onboard electronics condition the raw pulses and bank the charge in a local battery." },
  { n: "04", icon: Lightbulb, title: "Stored charge powers real loads", body: "Walkway lighting, signage and charging ports draw down the bank before the grid does." },
];

const DEPLOYMENTS = [
  { tag: "High traffic", title: "Campus gate pathways", body: "Covered entrances see constant, predictable foot traffic, ideal for steady daily harvest and lighting the walk home.", image: "/images/campus.jpg" },
  { tag: "Everyday routes", title: "Corridors", body: "Indoor routes between classrooms and offices where lighting already runs all day, a natural fit for self-powered fixtures.", image: "/images/school-corridor.jpeg" },
  { tag: "Off-grid ready", title: "Low-draw fixtures", body: "Signage, LED strips and phone-charging ports need very little power, exactly the loads a footstep can carry.", image: "/images/sidewalk.jpg" },
];

const SPECS: [string, string][] = [
  ["Tile footprint", "Modular unit sized for standard walkway slabs"],
  ["Harvesting method", "Piezoelectric stack plus dynamo spring-back"],
  ["Output per footstep", "Measured live on the prototype (see the readout above)"],
  ["Storage", "Onboard battery bank with automatic bank switching"],
  ["Protection", "Short-circuit cutoff and low-battery alerts"],
  ["Enclosure", "Weatherproof, load-rated top plate"],
  ["Installation", "Surface-mounted on existing pathways"],
  ["Result", "Powers lighting, signage and charging ports"],
];

/* ---------- small helpers ---------- */
function SectionHead({ eyebrow, children, lead, dark = false }: { eyebrow: string; children: React.ReactNode; lead: string; dark?: boolean }) {
  return (
    <div className="max-w-2xl">
      <span className="inline-flex items-center gap-2.5 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[var(--neon-orange)]">
        <span className="h-0.5 w-6 rounded bg-[var(--neon-orange)]" />
        {eyebrow}
      </span>
      <h2 className={`mt-4 text-3xl font-bold leading-[1.05] tracking-tight sm:text-4xl lg:text-[2.9rem] ${dark ? "text-white" : ""}`}>{children}</h2>
      <p className={`mt-4 text-sm leading-relaxed sm:text-base ${dark ? "text-white/70" : "text-[var(--muted)]"}`}>{lead}</p>
    </div>
  );
}

const GRADIENT_TEXT =
  "bg-gradient-to-r from-[#ffb15c] via-[var(--neon-orange)] to-[#ea580c] bg-clip-text text-transparent";

/* ---------- FAQ: typing title + gliding pop-up questions ---------- */

/** true while the element is on screen: turns on when it scrolls into view, off once it has fully left, so the animation replays every time */
function useSeen<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= threshold) setSeen(true);
        else if (entry.intersectionRatio === 0) setSeen(false);
      },
      { threshold: [0, threshold] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, seen] as const;
}

/** Types `text` out letter by letter once `start` is true. The full text is kept in the layout, so nothing jumps. */
function TypedText({ text, start, speed = 60, delay = 250 }: { text: string; start: boolean; speed?: number; delay?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!start) {
      setN(0); // reset, so the title types again the next time the section is active
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(text.length);
      return;
    }
    let i = 0;
    let timer = 0;
    const begin = window.setTimeout(() => {
      timer = window.setInterval(() => {
        i += 1;
        setN(i);
        if (i >= text.length) window.clearInterval(timer);
      }, speed);
    }, delay);
    return () => {
      window.clearTimeout(begin);
      window.clearInterval(timer);
    };
  }, [start, text, speed, delay]);

  const done = n >= text.length;
  return (
    <>
      <span className="sr-only">{text}</span>
      <span className="invisible" aria-hidden="true">
        {text}
      </span>
      <span className="absolute inset-0" aria-hidden="true">
        {text.slice(0, n)}
        <span className={`faq-caret${done ? " is-done" : ""}${start ? "" : " is-idle"}`} />
      </span>
    </>
  );
}

function FaqSection() {
  const [ref, seen] = useSeen<HTMLElement>(0.15);
  return (
    <section ref={ref} id="faq" className="relative min-h-screen overflow-hidden bg-[#ea580c]">
      {/* Background textmark */}
      <div className="pointer-events-none absolute inset-0 z-0 flex select-none items-center justify-center overflow-hidden" aria-hidden="true">
        <span className="textmark-shine whitespace-nowrap text-[clamp(10rem,40vw,42rem)] font-black uppercase leading-none tracking-tighter">
          FAQ
        </span>
      </div>

      <div className="relative z-10 grid min-h-screen lg:grid-cols-2">
        {/* title + intro copy on the left */}
        <div className="flex items-center px-6 pb-6 pt-28 sm:px-10 lg:px-16 lg:py-24">
          <div className="max-w-md">
            <span className="inline-flex items-center gap-3 text-[0.7rem] font-extrabold uppercase tracking-[0.2em] text-white">
              <span className="block h-0.5 w-6 rounded bg-white" />
              Common questions
            </span>
            <h2 className="relative mt-5 text-4xl font-extrabold leading-[0.98] tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">
              <TypedText text="Answers for the next step." start={seen} />
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/85 sm:text-lg">
              Everything you need to know about turning everyday foot traffic into useful energy.
            </p>
            <a
              href="mailto:hello@bawatpieza.com"
              className="group mt-8 inline-flex items-center gap-2 rounded-full bg-[#152238] px-6 py-3.5 text-sm font-bold text-white shadow-[0_14px_30px_-10px_rgba(21,34,56,0.6)] transition duration-300 hover:-translate-y-1 hover:bg-[#1f3252]"
            >
              Still have a question?
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>
        </div>

        {/* questions: blurred panel on the right, runs the full height of the section */}
        <div className="flex items-center border-t border-white/20 bg-white/10 px-6 py-14 backdrop-blur-xl sm:px-10 lg:border-l lg:border-t-0 lg:px-14 lg:py-24">
          <div className={`faq-reveal mx-auto w-full max-w-2xl${seen ? " faq-in" : ""}`}>
            <Faqs01 />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const [activeDeployment, setActiveDeployment] = useState(0);
  const deployTrackRef = useRef<HTMLDivElement>(null);
  const deployBarRef = useRef<HTMLSpanElement>(null);

  /* Shared refs for the seamless tile handoff */
  const sharedStageRef = useRef<HTMLDivElement>(null);
  const sharedCamRef = useRef<HTMLDivElement>(null);
  const sharedSceneRef = useRef<HTMLDivElement>(null);

  /* ---------- DEPLOYMENTS: vertical scroll -> smooth horizontal track ---------- */
  useEffect(() => {
    const section = document.getElementById("deployments");
    const track = deployTrackRef.current;
    const bar = deployBarRef.current;
    if (!section || !track) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const last = DEPLOYMENTS.length - 1;
    const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
    const smooth = (t: number) => t * t * (3 - 2 * t);
    const SMOOTHING = 7;

    const readTarget = () => {
      const rect = section.getBoundingClientRect();
      const pinned = Math.max(1, section.offsetHeight - window.innerHeight);
      return clamp01(-rect.top / pinned);
    };

    const position = (p: number) => {
      const raw = p * last;
      const base = Math.min(Math.floor(raw), last);
      return Math.min(last, base + smooth(clamp01((raw - base - 0.25) / 0.5)));
    };

    let activeNow = 0;
    const apply = (p: number) => {
      const pos = position(p);
      track.style.transform = `translate3d(${(-pos * 100).toFixed(3)}vw, 0, 0)`;
      if (bar) bar.style.transform = `scaleX(${p.toFixed(4)})`;
      const idx = Math.round(pos);
      if (idx !== activeNow) {
        activeNow = idx;
        setActiveDeployment(idx);
      }
    };

    let rafId = 0;
    let shown = readTarget();
    let lastTs = 0;

    const tick = (ts: number) => {
      const dt = lastTs ? Math.min(0.05, (ts - lastTs) / 1000) : 1 / 60;
      lastTs = ts;
      const target = readTarget();
      shown = reduceMotion ? target : shown + (target - shown) * (1 - Math.exp(-dt * SMOOTHING));
      if (Math.abs(target - shown) < 0.0002) shown = target;
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

    apply(shown);
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
    };
  }, []);

  return (
    <>
     <main id="home" className="hero-shell relative flex min-h-dvh w-full flex-col overflow-clip bg-[var(--background)] text-[var(--text)]">
      <HomeNav />

      <SmartPreloader
        overlayColor="#f4f8fb"
        progressColor="#FF8C28"
        counterColor="#152238"
        totalRevealMs={3000}
        fadeMs={1000}
      />

      <HeroTileScroll>
        <AccumulatedGeneration />
      </HeroTileScroll>

      {/* ================= SEAMLESS JOURNEY ================= */}
      <div className="relative">
        
        {/* Layer 1: Global Sticky Tile (z-[10]) */}
        <div className="absolute inset-0 pointer-events-none z-[10]">
          <div className="sticky top-0 h-dvh w-full overflow-hidden">
            <div ref={sharedStageRef} className="t3-stage wi-stage !absolute !inset-0 !w-full !h-full" role="img" aria-label="BawatPieza energy tile">
              <div ref={sharedCamRef} className="t3-cam">
                <div ref={sharedSceneRef} className="t3-scene">
                  <TileModel />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Layer 2: Content sections interleaved via z-indexes */}
        <div className="relative">
          <HowItWorks 
            steps={STEPS} 
            stageRef={sharedStageRef} 
            camRef={sharedCamRef} 
            sceneRef={sharedSceneRef} 
          />
          <WhatsInsideScroll 
            specs={SPECS} 
            head={
              <SectionHead
                eyebrow="Inside the tile"
                lead="Every layer, from the top board down to the base, in one exploded view. Click the tile to open it."
              >
                What’s inside <span className={GRADIENT_TEXT}>one tile.</span>
              </SectionHead>
            } 
            stageRef={sharedStageRef} 
            camRef={sharedCamRef} 
            sceneRef={sharedSceneRef}
          />
        </div>
      </div>

      <section
        id="deployments"
        className="relative h-[400vh] shrink-0 bg-[#0a101a]"
      >
        <div className="sticky top-0 h-dvh overflow-hidden">
          <div ref={deployTrackRef} className="flex h-full w-[300vw] will-change-transform">
            {DEPLOYMENTS.map(({ tag, title, body, image }, index) => (
              <article
                key={title}
                className={`group relative flex h-dvh w-screen shrink-0 items-center overflow-hidden transition-[opacity] duration-700 ${activeDeployment === index ? "opacity-100" : "opacity-90"}`}
                style={{
                  backgroundImage: `url(${image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="pointer-events-none absolute inset-0 bg-black/45" />
                <div className={`relative z-10 mx-auto flex h-full w-full max-w-7xl items-end px-6 pb-24 transition-all duration-700 sm:px-10 sm:pb-28 lg:px-16 ${activeDeployment === index ? "translate-y-0 opacity-100" : "translate-y-5 opacity-60"}`}>
                  <div className="max-w-2xl">
                    {index === 0 && (
                      <>
                        <span className="inline-flex items-center gap-2.5 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[var(--neon-orange)]">
                          <span className="h-0.5 w-6 rounded bg-[var(--neon-orange)]" />
                          Deployments
                        </span>
                        <h2
                     className={`mt-4 max-w-[12ch] text-4xl font-extrabold leading-[0.95] tracking-[-0.04em] sm:text-5xl lg:text-6xl ${GRADIENT_TEXT}`}
                        >
                          Built for the paths people already walk.
                        </h2>
                        <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
                          The tile is modular, so a pathway takes as many units as its foot traffic justifies. No separate power run required.
                        </p>
                      </>
                    )}
                    <div className="mt-5">
                    <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.22em] text-[var(--neon-orange)]">
                      {tag}
                    </span>
                    <h3 className={`mt-4 max-w-[12ch] text-2xl font-extrabold leading-[0.95] tracking-[-0.04em] sm:text-6xl lg:text-7xl ${GRADIENT_TEXT}`}>
                      {title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-200 sm:text-base">{body}</p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="pointer-events-none absolute bottom-8 left-0 right-0 mx-auto flex w-full max-w-7xl items-center gap-3 px-6 sm:px-10 lg:px-16">
            
            <span className="h-px flex-1 bg-white/15">
              <span
                ref={deployBarRef}
                className="block h-px origin-left scale-x-0 bg-[var(--neon-orange)] will-change-transform"
              />
            </span>
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[var(--neon-orange)]">
              {String(activeDeployment + 1).padStart(2, "0")} / {String(DEPLOYMENTS.length).padStart(2, "0")}
            </span>
          </div>
        </div>
      </section>

      {/* FAQ: full-page, shiny "FAQ" textmark behind a 50/50 split. Questions on a blurred panel (left), intro copy (right). */}
      <FaqSection />

      <ContactSection />

      </main>
      <Footer />
    </>
  );
}