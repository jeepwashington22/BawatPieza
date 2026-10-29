"use client";

import { useEffect, useState, type CSSProperties } from "react";
import {
  Footprints,
  ArrowRight,
  Zap,
  BatteryCharging,
  Lightbulb,
} from "lucide-react";
import SmartPreloader from "@/components/ui/smart-preloader";
import AccumulatedGeneration from "@/components/AccumulatedGeneration";
import HomeNav from "@/components/HomeNav";
import ShapeGrid from "@/components/shape-grid";
import Footer from "@/components/Footer";
import Faqs01 from "@/components/ui/faqs-01";

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
  const [activeStep, setActiveStep] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [howSectionVisible, setHowSectionVisible] = useState(false);
  const [deploymentProgress, setDeploymentProgress] = useState(0);
  const activeDeployment = Math.min(2, Math.floor(deploymentProgress * 3));

  /* ---------- HOW IT WORKS: active step + progress ---------- */
  useEffect(() => {
    const stepElements = Array.from(document.querySelectorAll<HTMLElement>("[data-how-step]"));
    const howSection = document.getElementById("how");
    if (!stepElements.length && !howSection) return;

    const updateScrollProgress = () => {
      const section = document.getElementById("how");
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const totalDistance = Math.max(1, rect.height - window.innerHeight + 200);
      const ratio = (window.innerHeight * 0.5 - rect.top) / totalDistance;
      setScrollProgress(Math.min(1, Math.max(0, ratio)));
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleStep = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleStep) {
          setActiveStep(Number((visibleStep.target as HTMLElement).dataset.howStep));
        }
      },
      { rootMargin: "-38% 0px -38% 0px", threshold: [0.2, 0.5, 0.8] },
    );

    stepElements.forEach((step) => observer.observe(step));

    if (howSection) {
      const visibilityObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            setHowSectionVisible(entry.isIntersecting);
          });
        },
        { threshold: 0.2 },
      );
      visibilityObserver.observe(howSection);
      updateScrollProgress();
      window.addEventListener("scroll", updateScrollProgress, { passive: true });
      window.addEventListener("resize", updateScrollProgress);

      return () => {
        observer.disconnect();
        visibilityObserver.disconnect();
        window.removeEventListener("scroll", updateScrollProgress);
        window.removeEventListener("resize", updateScrollProgress);
      };
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  /* ---------- DEPLOYMENTS: vertical scroll -> horizontal track ---------- */
  useEffect(() => {
    const section = document.getElementById("deployments");
    if (!section) return;

    let rafId = 0;

    const update = () => {
      rafId = 0;
      const rect = section.getBoundingClientRect();
      // distance the sticky panel stays pinned = section height - one viewport
      const pinnedDistance = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = -rect.top / pinnedDistance;
      setDeploymentProgress(Math.min(1, Math.max(0, progress)));
    };

    const onScroll = () => {
      if (!rafId) rafId = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <>
     <main id="home" className="hero-shell relative flex min-h-dvh w-full flex-col overflow-clip bg-[var(--background)] text-[var(--text)]">
      {/* Preloader — covers the screen until the landing page is revealed */}
      <SmartPreloader
        overlayColor="#f4f8fb"
        progressColor="#FF8C28"
        counterColor="#152238"
        totalRevealMs={3000}
        fadeMs={1000}
      />

      <HomeNav />

      {/* ================= HERO ================= */}
      <section
        id="about"
        className="hero-section relative flex h-full min-h-[100dvh] items-center overflow-hidden px-4 pb-14 pt-20 sm:px-6 lg:px-8 lg:pt-16"
      >
        <ShapeGrid
          shape="square"
          direction="diagonal"
          lineColor="#d7dee9"
          hoverColor="#f6c445"
          hoverFillColor="#f6c445"
          fillOpacity={0.18}
          cellSize={38}
          speed={0.55}
          radius={1.2}
          glow={0.28}
          opacity={0.9}
          backgroundColor="transparent"
          className="pointer-events-none absolute inset-0 z-0 h-full w-full"
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.7),transparent_48%)]" />

        <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center justify-center text-center">
          <h1 className="mt-6 max-w-4xl text-5xl font-extrabold leading-[0.98] tracking-tight sm:text-6xl xl:text-[4.2rem]">
            Every step leaves a little <span className={GRADIENT_TEXT}>power behind.</span>
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
            BawatPieza turns everyday pressure into measurable, usable energy through a tile made
            for the way people already move.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#generation"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-[#ff9a3c] to-[#ea580c] px-6 py-3 text-sm font-bold text-white shadow-[0_12px_28px_-8px_rgba(234,88,12,0.6)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_-8px_rgba(234,88,12,0.7)]"
            >
              Explore the tile <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </a>
            <a
              href="#how"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--line-strong)] bg-white/50 px-6 py-3 text-sm font-semibold text-[var(--text)] backdrop-blur transition hover:-translate-y-0.5 hover:bg-white"
            >
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* ================= ACCUMULATED GENERATION ================= */}
      <AccumulatedGeneration />

      {/* ================= HOW IT WORKS ================= */}
      <section id="how" className="how-it-works-section relative overflow-x-clip px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(19rem,0.82fr)_minmax(0,1.18fr)] lg:gap-16">
          <div className="how-tile-panel lg:sticky lg:top-28 lg:h-[36rem]">
            <div className="how-tile-visual relative flex min-h-[26rem] flex-col items-center justify-center lg:h-full" aria-label="Isometric view of the BawatPieza energy tile">
              <div aria-hidden="true" className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--neon-orange)]/20 blur-[80px]" />
              <div className="how-showcase-status absolute left-0 top-0 flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">
                <span className="how-showcase-live" />
                Stage {String(activeStep + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
              </div>
              <div className="tile-stage">
                <div className="tile-surface">
                  <div className="tile-corner tile-corner-top" />
                  <div className="tile-corner tile-corner-bottom" />
                  <div className="tile-grid" />
                  <div className="tile-core">
                    <div className="tile-core-ring">
                      <Zap className="h-9 w-9 text-[var(--butter)]" strokeWidth={1.5} />
                    </div>
                    <span>BP / 01</span>
                  </div>
                  <span className="tile-label tile-label-top">KINETIC INPUT</span>
                  <span className="tile-label tile-label-bottom">PIEZO CORE</span>
                </div>
              </div>
              <div className="how-showcase-readout">
                <span className="how-showcase-readout-label">Now happening</span>
                <strong>{STEPS[activeStep].title}</strong>
              </div>
              <span className="how-tile-caption">Isometric prototype / active surface</span>
            </div>
          </div>

          <div className="how-content">
            <div className={howSectionVisible ? "reveal-on-scroll is-visible" : "reveal-on-scroll"}>
              <SectionHead
                eyebrow="How it works"
                lead="Every footfall presses a piezoelectric stack, while a small dynamo underneath a weatherproof plate captures the rest."
              >
                One footstep, <span className={GRADIENT_TEXT}>two harvesting paths.</span>
              </SectionHead>
            </div>
            <div className="how-steps">
              <div
                className={`how-progress how-progress-step-${activeStep}`}
                role="progressbar"
                aria-label="How it works progress"
                aria-valuemin={1}
                aria-valuemax={STEPS.length}
                aria-valuenow={activeStep + 1}
              >
                <span
                  aria-hidden="true"
                  className="how-progress-fill"
                  style={{ ["--progress" as string]: String(scrollProgress) } as CSSProperties}
                />
                {STEPS.map((step, index) => (
                  <span
                    key={step.n}
                    className={index <= activeStep ? "is-complete" : ""}
                    aria-label={`Step ${step.n}: ${step.title}`}
                  />
                ))}
              </div>
              {STEPS.map(({ n, icon: Icon, title, body }, index) => (
                <div
                  key={n}
                  className={howSectionVisible ? "how-step-wrap reveal-on-scroll is-visible" : "how-step-wrap reveal-on-scroll"}
                  data-how-step={index}
                  style={{ transitionDelay: `${index * 90}ms` }}
                >
                  <article className={`how-step-card group relative overflow-hidden rounded-xl border p-5 backdrop-blur-sm sm:p-7 ${activeStep === index ? "is-active border-[var(--neon-orange)]/60 bg-white shadow-[0_24px_50px_-30px_rgba(234,88,12,0.5)]" : index < activeStep ? "is-before border-[var(--line-strong)] bg-white/65" : "is-after border-[var(--line-strong)] bg-white/55"}`}>
                    <div aria-hidden="true" className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(255,140,40,0.25),transparent_70%)]" />
                    <div className="relative flex items-start justify-between">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--neon-orange)]/12 text-[var(--neon-orange)]">
                        <Icon className="h-4 w-4" />
                      </span>
                    </div>
                    <h3 className="relative mt-6 text-xl font-bold leading-snug tracking-tight sm:text-2xl">{title}</h3>
                    <p className="relative mt-2 max-w-xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">{body}</p>
                  </article>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= DEPLOYMENTS =================
          Outer section = tall scroll runway (NO overflow here, or sticky breaks).
          Inner div     = pinned viewport that clips the wide horizontal track.
          While the section is in view, vertical scroll drives the track sideways.
          After the 3rd panel, the sticky div releases and normal scrolling resumes. */}
      <section
        id="deployments"
        className="relative h-[400vh] shrink-0 bg-[#0a101a]"
      >
        <div className="sticky top-0 h-dvh overflow-hidden">
          <div
            className="flex h-full w-[300vw] will-change-transform"
            style={{
              transform: `translate3d(-${deploymentProgress * 200}vw, 0, 0)`,
            }}
          >
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
                     className={`mt-4 max-w-[12ch text-1xl font-extrabold leading-[0.95] tracking-[-0.04em] sm:text-5xl lg:text-6xl ${GRADIENT_TEXT}`}
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

          {/* progress bar + counter */}
          <div className="pointer-events-none absolute bottom-8 left-0 right-0 mx-auto flex w-full max-w-7xl items-center gap-3 px-6 sm:px-10 lg:px-16">
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white/55">Scroll to explore</span>
            <span className="h-px flex-1 bg-white/15">
              <span
                className="block h-px origin-left bg-[var(--neon-orange)]"
                style={{ transform: `scaleX(${deploymentProgress})` }}
              />
            </span>
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[var(--neon-orange)]">
              {String(Math.min(3, Math.floor(deploymentProgress * 3) + 1)).padStart(2, "0")} / 03
            </span>
          </div>
        </div>
      </section>

      {/* ================= SPECS ================= */}
      <section id="specs" className="relative px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHead
              eyebrow="Specs"
              lead="Details for the current prototype, as built and tested on a real pathway, not a projection from lab bench data."
            >
              What’s inside <span className={GRADIENT_TEXT}>one tile.</span>
            </SectionHead>
            <a
              href="#contact"
              className="group mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[#ff9a3c] to-[#ea580c] px-6 py-3 text-sm font-bold text-white shadow-[0_12px_28px_-8px_rgba(234,88,12,0.6)] transition hover:-translate-y-0.5"
            >
              Request a pilot <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </a>
          </div>

          <div>
            <div className="overflow-hidden rounded-3xl border border-[var(--line-strong)] bg-white/80">
              {SPECS.map(([label, value]) => (
                <div
                  key={label}
                  className="grid gap-1 border-t border-[var(--line-strong)] px-6 py-5 transition first:border-t-0 hover:bg-[var(--neon-orange)]/[0.06] sm:grid-cols-[11.5rem_1fr] sm:gap-6 sm:px-8"
                >
                  <span className="flex items-center gap-2.5 text-sm font-bold text-[#ea580c]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--neon-orange)]" />
                    {label}
                  </span>
                  <span className="text-sm text-[var(--text)] sm:text-[0.95rem]">{value}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 px-2 text-xs text-[var(--muted)]">
              Figures reflect the current prototype and may change as testing continues.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#0b1320] px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Faqs01 />
        </div>
      </section>

      {/* ================= CLOSING CTA ================= */}
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