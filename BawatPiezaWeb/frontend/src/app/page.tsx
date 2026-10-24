import {
  Footprints,
  ArrowRight,
  Zap,
  BatteryCharging,
  Lightbulb,
  ChevronDown,
} from "lucide-react";
import SmartPreloader from "@/components/ui/smart-preloader";
import { Spotlight } from "@/components/ui/spotlight";
import TextMarquee from "@/components/ui/text-marque";
import AccumulatedGeneration from "@/components/AccumulatedGeneration";
import HomeNav from "@/components/HomeNav";

/* ---------- content (edit copy / image paths here) ---------- */
const STEPS = [
  { n: "01", icon: Footprints, title: "Footfall compresses the tile", body: "Each step flexes the hybrid core beneath the floor plate, without any noticeable give underfoot." },
  { n: "02", icon: Zap, title: "Two paths fire at once", body: "The piezo stack captures the sharp strike, while the dynamo captures the slower spring-back." },
  { n: "03", icon: BatteryCharging, title: "Power is converted and stored", body: "Onboard electronics condition the raw pulses and bank the charge in a local battery." },
  { n: "04", icon: Lightbulb, title: "Stored charge powers real loads", body: "Walkway lighting, signage and charging ports draw down the bank before the grid does." },
];

const DEPLOYMENTS = [
  { tag: "High traffic", title: "Campus gate pathways", body: "Covered entrances see constant, predictable foot traffic, ideal for steady daily harvest and lighting the walk home.", image: "/images/campus-gate.jpg" },
  { tag: "Everyday routes", title: "Corridors", body: "Indoor routes between classrooms and offices where lighting already runs all day, a natural fit for self-powered fixtures.", image: "/images/corridor.jpg" },
  { tag: "Off-grid ready", title: "Low-draw fixtures", body: "Signage, LED strips and phone-charging ports need very little power, exactly the loads a footstep can carry.", image: "/images/low-draw.jpg" },
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
function SectionHead({ eyebrow, children, lead }: { eyebrow: string; children: React.ReactNode; lead: string }) {
  return (
    <div className="max-w-2xl">
      <span className="inline-flex items-center gap-2.5 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[var(--neon-orange)]">
        <span className="h-0.5 w-6 rounded bg-[var(--neon-orange)]" />
        {eyebrow}
      </span>
      <h2 className="mt-4 text-3xl font-bold leading-[1.05] tracking-tight sm:text-4xl lg:text-[2.9rem]">{children}</h2>
      <p className="mt-4 text-sm leading-relaxed text-[var(--muted)] sm:text-base">{lead}</p>
    </div>
  );
}

const GRADIENT_TEXT =
  "bg-gradient-to-r from-[#ffb15c] via-[var(--neon-orange)] to-[#ea580c] bg-clip-text text-transparent";

export default function LandingPage() {
  return (
    <main id="home" className="hero-shell relative flex min-h-dvh w-full flex-col overflow-x-hidden bg-[var(--background)] text-[var(--text)]">
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
        className="hero-section relative grid min-h-[100dvh] items-center overflow-hidden px-4 pb-14 pt-28 sm:px-6 lg:px-8 lg:pt-24"
      >
        {/* depth: warm glows + grid, all behind content */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(55%_50%_at_62%_38%,rgba(255,140,40,0.22),transparent_70%),radial-gradient(40%_35%_at_6%_0%,rgba(255,177,92,0.25),transparent_70%)]" />
        <div aria-hidden="true" className="spotlight-grid pointer-events-none absolute inset-0 z-0" />
        <Spotlight className="-top-48 left-[30%] md:left-[38%]" fill="#ffd995" />

        <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-[1.05fr_1.15fr] lg:gap-10 xl:gap-14">
          {/* copy */}
          <div className="max-w-md">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line-strong)] bg-white/60 py-1.5 pl-1.5 pr-3.5 text-[0.7rem] font-semibold text-[var(--muted)] backdrop-blur">
              <span className="rounded-full bg-[var(--neon-orange)] px-2 py-0.5 text-[0.6rem] font-bold tracking-wider text-white">PROTOTYPE</span>
              Piezo + dynamo hybrid walkway tile
            </span>

            <h1 className="mt-6 text-5xl font-extrabold leading-[0.98] tracking-tight sm:text-6xl xl:text-[4.2rem]">
              Every step leaves a little{" "}
              <span className={GRADIENT_TEXT}>power behind.</span>
            </h1>

            <p className="mt-6 max-w-sm text-sm leading-relaxed text-[var(--muted)] sm:text-base">
              BawatPieza turns everyday pressure into measurable, usable energy through a tile made
              for the way people already move.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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

          {/* tile illustration (your existing tile-* markup, unchanged) */}
          <div className="relative flex min-h-[24rem] items-center justify-center sm:min-h-[28rem] lg:min-h-[30rem]" aria-label="BawatPieza energy tile illustration">
            <div aria-hidden="true" className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--neon-orange)]/25 blur-[90px]" />
            <div className="tile-energy-output" aria-hidden="true">
              <span className="tile-energy-pulse pulse-one" />
              <span className="tile-energy-pulse pulse-two" />
              <Zap className="h-3.5 w-3.5" />
              <span>Electricity generating</span>
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
            <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--faint)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--butter)]" />
              Prototype / active surface
            </div>
          </div>

        </div>
      </section>

      {/* ================= ACCUMULATED GENERATION ================= */}
      <AccumulatedGeneration />

      {/* ================= ENERGY QUOTE ================= */}
      <section
        aria-label="Energy quote"
        className="overflow-hidden border-t border-[var(--line)] bg-transparent py-7 text-[var(--text)] sm:py-8"
      >
        <TextMarquee
          delay={300}
          baseVelocity={-2}
          className="font-serif text-[clamp(1.25rem,2.8vw,2.2rem)] italic leading-none tracking-[-0.05em] text-[var(--text)]"
        >
          Every step can become a source of power.
        </TextMarquee>
        <TextMarquee
          delay={300}
          baseVelocity={2}
          className="mt-1 font-serif text-[clamp(1.25rem,2.8vw,2.2rem)] italic leading-none tracking-[-0.05em] text-[var(--neon-orange)]"
        >
          Walk forward. Leave energy behind.
        </TextMarquee>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how" className="how-it-works-section relative overflow-hidden px-4 py-16 sm:px-6 lg:h-[100dvh] lg:min-h-[42rem] lg:px-8 lg:py-20">
        <div className="mx-auto grid h-full max-w-7xl gap-10 lg:grid-cols-[3fr_7fr] lg:gap-16">
          <div className="how-tile-panel lg:sticky lg:top-32 lg:h-[30rem]">
            <div className="how-tile-visual relative flex min-h-[26rem] items-center justify-center" aria-label="Isometric view of the BawatPieza energy tile">
              <div aria-hidden="true" className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--neon-orange)]/20 blur-[80px]" />
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
              <span className="how-tile-caption">Isometric prototype / active surface</span>
            </div>
          </div>

          <div className="how-content">
            <SectionHead
              eyebrow="How it works"
              lead="Every footfall presses a piezoelectric stack while a small dynamo underneath a weatherproof plate captures the rest."
            >
              One footstep, <span className={GRADIENT_TEXT}>two harvesting paths.</span>
            </SectionHead>
            <div className="how-steps">
              {STEPS.map(({ n, icon: Icon, title, body }, index) => (
              <div key={n} className="how-step-wrap">
                <article className="how-step-card group relative overflow-hidden rounded-xl border border-[var(--line-strong)] bg-white/75 p-3.5 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-[var(--neon-orange)]/50 hover:shadow-[0_18px_36px_-24px_rgba(234,88,12,0.45)] sm:p-4">
                  <div aria-hidden="true" className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(255,140,40,0.25),transparent_70%)]" />
                  <div className="relative flex items-start justify-between">
                    <span className={`text-4xl font-extrabold leading-none tracking-tighter ${GRADIENT_TEXT}`}>{n}</span>
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--neon-orange)]/12 text-[var(--neon-orange)]">
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>
                  <h3 className="relative mt-4 text-base font-bold leading-snug tracking-tight sm:text-lg">{title}</h3>
                  <p className="relative mt-1.5 max-w-xl text-xs leading-relaxed text-[var(--muted)] sm:text-sm">{body}</p>
                </article>
                {index < STEPS.length - 1 && (
                  <div aria-hidden="true" className="how-step-arrow">
                    <ChevronDown className="h-5 w-5" />
                  </div>
                )}
              </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= DEPLOYMENTS ================= */}
      <section id="deployments" className="relative bg-gradient-to-b from-transparent via-[var(--neon-orange)]/[0.05] to-transparent px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <SectionHead
            eyebrow="Deployments"
            lead="The tile is modular, so a pathway takes as many units as its foot traffic justifies. No separate power run required."
          >
            Built for the paths <span className={GRADIENT_TEXT}>people already walk.</span>
          </SectionHead>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {DEPLOYMENTS.map(({ tag, title, body, image }) => (
              <article
                key={title}
                className="group rounded-[1.75rem] border border-[var(--line-strong)] bg-white/80 p-3 pb-7 transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-30px_rgba(21,34,56,0.35)]"
              >
                <div className="relative aspect-[4/3.2] overflow-hidden rounded-2xl bg-[var(--line-strong)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt={title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#0d1626]/45 via-transparent to-transparent" />
                  <span className="absolute left-3 top-3 rounded-full bg-[#0d1626]/70 px-3 py-1.5 text-[0.65rem] font-semibold tracking-wide text-white backdrop-blur">
                    {tag}
                  </span>
                </div>
                <h3 className="mx-3 mt-6 text-xl font-bold tracking-tight">{title}</h3>
                <p className="mx-3 mt-2 text-sm leading-relaxed text-[var(--muted)]">{body}</p>
              </article>
            ))}
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

      {/* ================= CLOSING CTA ================= */}
      <section id="contact" className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#13213a,#0a1220)] px-6 py-16 text-center text-white sm:py-20">
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(60%_120%_at_80%_0%,rgba(255,140,40,0.55),transparent_60%)]" />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Put your busiest path to <span className={GRADIENT_TEXT}>work.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-white/70 sm:text-base">
              Tell us where people walk. We’ll show you what a footstep can power.
            </p>
            <a
              href="mailto:hello@bawatpieza.com"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[#ff9a3c] to-[#ea580c] px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_28px_-8px_rgba(234,88,12,0.6)] transition hover:-translate-y-0.5"
            >
              Get in touch <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}