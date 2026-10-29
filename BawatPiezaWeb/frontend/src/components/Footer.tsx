import { ArrowUpRight } from "lucide-react";

const footerLinks = [
  { label: "Overview", href: "#home" },
  { label: "How it works", href: "#how" },
  { label: "Deployment", href: "#deployments" },
  { label: "Specs", href: "#specs" },
  { label: "Contact", href: "#contact" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#070d18] text-white">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-md">
            <p className="inline-flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[var(--neon-orange)]">
              <span className="h-0.5 w-6 rounded bg-[var(--neon-orange)]" />
              BawatPieza
            </p>
            <h3 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Powering the everyday path.
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Turning routine foot traffic into reliable, usable energy for the spaces people already move through.
            </p>
          </div>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10">
            <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
              {footerLinks.map((item) => (
                <a key={item.label} href={item.href} className="transition hover:text-[var(--neon-orange)]">
                  {item.label}
                </a>
              ))}
            </nav>

            <a
              href="mailto:hello@bawatpieza.com"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-[var(--neon-orange)] hover:text-[var(--neon-orange)]"
            >
              hello@bawatpieza.com
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 BawatPieza. All rights reserved.</p>
          <p>Built for smarter pathways.</p>
        </div>
      </div>
    </footer>
  );
}
