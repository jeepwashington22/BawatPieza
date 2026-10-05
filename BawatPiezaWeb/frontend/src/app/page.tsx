import { Footprints, Gauge, ArrowRight, Zap } from "lucide-react";
import SmartPreloader from "@/components/ui/smart-preloader";
import { Spotlight } from "@/components/ui/spotlight";
import AnimatedMetric from "@/components/AnimatedMetric";
import HomeNav from "@/components/HomeNav";

export default function LandingPage() {
  return (
    <main id="home" className="hero-shell relative flex min-h-dvh w-full flex-col overflow-x-hidden overflow-y-auto bg-[var(--background)] text-[var(--text)]">
      {/* Preloader — covers the screen until the landing page is revealed */}
      <SmartPreloader
        overlayColor="#f4f8fb"
        progressColor="#FF8C28"
        counterColor="#152238"
        totalRevealMs={3000}
        fadeMs={1000}
      />

      <HomeNav />

      {/* Hero */}
      <section
        id="about"
        className="hero-section relative grid min-h-0 flex-1 items-center overflow-hidden px-4 sm:px-6 lg:px-8"
      >
        <div
          aria-hidden="true"
          className="spotlight-grid pointer-events-none absolute inset-0 z-0"
        />
        <Spotlight className="-top-48 left-[30%] md:left-[38%]" fill="#ffd995" />
        <div className="relative z-10 grid w-full grid-cols-1  gap-10 py-10 sm:py-12 lg:grid-cols-[0.82fr_1.4fr_0.88fr] lg:gap-8 lg:py-8 xl:gap-12">
          <div className="max-w-xs">
            <h1 className="max-w-[12rem] text-4xl font-bold leading-[0.98] tracking-tight sm:text-[2.75rem] lg:text-[3rem] xl:text-[3.35rem]">
              <span className="block whitespace-nowrap">Every step</span>
              <span className="mt-1 block whitespace-nowrap">leaves a little</span>
              <span className="mt-1 block whitespace-nowrap text-[var(--butter)]">power behind.</span>
            </h1>

            <p className="mt-5 max-w-[15rem] text-xs leading-relaxed text-[var(--muted)] sm:text-sm">
              BawatPieza turns everyday pressure into measurable, usable energy through a tile made
              for the way people already move.
            </p>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
              <a
                href="#about"
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--neon-orange)] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[var(--butter)]"
              >
                Explore the tile <ArrowRight className="h-3.5 w-3.5" />
              </a>
              <a
                href="#about"
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--line-strong)] px-4 py-2.5 text-xs font-semibold text-[var(--muted)] transition hover:text-[var(--text)]"
              >
                See how it works
              </a>
            </div>
          </div>

          <div className="relative flex min-h-[22rem] items-center justify-center sm:min-h-[26rem] lg:min-h-0" aria-label="BawatPieza energy tile illustration">
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
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--faint)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--butter)]" />
              Prototype / active surface
            </div>
          </div>

          <div className="flex h-full w-full max-w-[17rem] self-end justify-self-end flex-col justify-end pb-0 lg:pb-1">
            <div className="grid gap-1.5">
              <AnimatedMetric label="Footstep count" value={1248} suffix="steps" icon={<Footprints className="h-4 w-4" />} />
              <AnimatedMetric label="Electricity generation" value={42.8} decimals={1} suffix="W" icon={<Zap className="h-4 w-4" />} />
              <AnimatedMetric label="Voltage" value={4.86} decimals={2} suffix="V" icon={<Gauge className="h-4 w-4" />} accent="cyan" />
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
