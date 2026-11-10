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

export default function LandingPage() {
  const [activeDeployment, setActiveDeployment] = useState(0);
  const deployTrackRef = useRef<HTMLDivElement>(null);
  const deployBarRef = useRef<HTMLSpanElement>(null);

  /* Shared refs for the seamless tile handoff */
  const sharedStageRef = useRef<HTMLDivElement>(null);
  const sharedCamRef = useRef<HTMLDivElement>(null);
  const sharedSceneRef = useRef<HTMLDivElement>(null);
  const sharedVeilRef = useRef<HTMLDivElement>(null);
  const sharedHlRef = useRef<SVGSVGElement>(null);
  const sharedTagRef = useRef<HTMLDivElement>(null);

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
            
            <div ref={sharedVeilRef} className="wi-veil" aria-hidden="true" />
            
            <svg ref={sharedHlRef} className="wi-hl" aria-hidden="true">
              <path /><path /><path /><path />
            </svg>
            
            <div ref={sharedTagRef} className="wi-tag" aria-hidden="true">
              <b></b>
              <span></span>
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
                eyebrow="Specs"
                lead="Details for the current prototype, as built and tested on a real pathway, not a projection from lab bench data."
              >
                What’s inside <span className={GRADIENT_TEXT}>one tile.</span>
              </SectionHead>
            } 
            stageRef={sharedStageRef} 
            camRef={sharedCamRef} 
            sceneRef={sharedSceneRef}
            veilRef={sharedVeilRef}
            hlRef={sharedHlRef}
            tagRef={sharedTagRef}
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

      {/* FAQ SECTION WITH RED-ORANGE BG, BLURRED CONTAINER, AND "faq text" TEXTMARK */}
      <section id="faq" className="relative overflow-hidden bg-[#ea580c] px-4 py-24 sm:px-6 lg:px-8">
        {/* Background Textmark */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden select-none z-0 opacity-15">
          <span className="textmark-shine text-[clamp(5rem,18vw,16rem)] font-black tracking-tighter uppercase whitespace-nowrap">
            faq text
          </span>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="rounded-3xl border border-white/20 bg-white/10 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] backdrop-blur-xl sm:p-10">
            <Faqs01 />
          </div>
        </div>
      </section>

      <section id="contact" className="relative overflow-hidden bg-[var(--background)] px-4 py-20 text-[var(--text)] sm:px-6 sm:py-24 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_100%_at_78%_10%,rgba(255,140,40,0.22),transparent_70%)]" />
        <div className="pointer-events-none absolute -left-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full border border-[var(--neon-orange)]/15" />
        <div className="pointer-events-none absolute -left-12 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full border border-[var(--neon-orange)]/20" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#ea580c]/20 bg-white/60 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#ea580c] shadow-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--neon-orange)]" />
              Start a conversation
            </span>
            <h2 className="mt-6 max-w-2xl text-4xl font-extrabold leading-[0.98] tracking-[-0.045em] sm:text-6xl">
              Make every step <span className={GRADIENT_TEXT}>count.</span>
            </h2>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-[var(--muted)] sm:text-lg">
              Tell us where people walk. We’ll help you turn that everyday movement into a smarter, more useful pathway.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <a
                href="mailto:hello@bawatpieza.com"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[#ff9a3c] to-[#ea580c] px-6 py-3.5 text-sm font-bold text-white shadow-[0_14px_30px_-10px_rgba(234,88,12,0.65)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_38px_-10px_rgba(234,88,12,0.75)]"
              >
                Get in touch
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <span className="text-xs font-medium text-[var(--muted)]">hello@bawatpieza.com</span>
            </div>
          </div>

          <div className="relative">
            <div className="contact-orbit absolute -inset-5 rounded-[2rem] border border-[var(--neon-orange)]/20" />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/75 p-6 shadow-[0_24px_70px_-30px_rgba(21,34,56,0.35)] backdrop-blur-sm sm:p-8">
              <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(255,140,40,0.28),transparent_70%)]" />
              <div className="relative">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ea580c]">What happens next</p>
                <div className="mt-6 space-y-5">
                  {[
                    ["01", "Share your pathway", "Tell us about the place and the people moving through it."],
                    ["02", "Shape the opportunity", "We’ll map the traffic pattern to a practical pilot."],
                    ["03", "Power what matters", "Together, we’ll identify the best low-draw use for every step."],
                  ].map(([number, title, body]) => (
                    <div key={number} className="flex gap-4">
                      <span className="font-mono text-xs font-bold text-[var(--neon-orange)]">{number}</span>
                      <div>
                        <h3 className="text-sm font-bold text-[var(--text)]">{title}</h3>
                        <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">{body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      </main>
      <Footer />
    </>
  );
}