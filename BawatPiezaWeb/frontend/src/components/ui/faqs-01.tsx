"use client";

import { ArrowUpRight, MessageCircle, Sparkles } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
const faqs = [
  {
    q: "How does a BawatPieza tile generate electricity?",
    a: "Each footfall flexes a piezoelectric stack and a small dynamo spring-back mechanism. The onboard electronics condition both pulses and store the usable charge in a local battery.",
  },
  {
    q: "How much power can one step produce?",
    a: "Output depends on the load, walking speed, and prototype configuration. The live readout above measures the current tile as it is tested, so the result is based on real foot traffic rather than a fixed lab estimate.",
  },
  {
    q: "Where can the tiles be installed?",
    a: "They are designed for surface-mounted installation on existing pathways, including campus entrances, corridors, covered walkways, and other routes with consistent foot traffic.",
  },
  {
    q: "What can the stored energy power?",
    a: "The current design is intended for low-draw loads such as LED walkway lighting, signage, sensors, and phone-charging ports.",
  },
  {
    q: "Can we request a pilot installation?",
    a: "Yes. Tell us where people walk and what you want to power. We can use that route and its traffic pattern to shape a practical pilot proposal.",
  },
];

export default function Faqs01({ defaultValue }: { defaultValue?: string }) {
  return (
    <section
      className="relative isolate overflow-hidden px-0 py-8 text-white sm:py-12 lg:py-14"
      aria-labelledby="faq-heading"
    >
      <div className="faq-orb absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(255,168,74,0.38),rgba(255,105,24,0.08)_42%,transparent_70%)] blur-2xl" />
      <div className="relative z-10 grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
        <div className="flex flex-col justify-between">
          <div>
            <span className="inline-flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[var(--neon-orange)]">
              <span className="grid h-6 w-6 place-items-center rounded-full border border-[var(--neon-orange)]/40 bg-[var(--neon-orange)]/10">
                <Sparkles className="h-3 w-3" />
              </span>
              Common questions
            </span>
            <h2 id="faq-heading" className="mt-5 max-w-md text-4xl font-extrabold leading-[0.98] tracking-[-0.045em] text-white sm:text-5xl">
              Answers for the{" "}
              <span className="bg-gradient-to-r from-[#ffcf8a] via-[var(--neon-orange)] to-[#ff6b22] bg-clip-text text-transparent">
                next step.
              </span>
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-300 sm:text-base">
              Everything you need to know about turning everyday foot traffic into useful energy.
            </p>
          </div>

          <a
            href="mailto:hello@bawatpieza.com"
            className="group mt-8 inline-flex w-fit items-center gap-3 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white transition duration-300 hover:-translate-y-1 hover:border-[var(--neon-orange)]/60 hover:bg-[var(--neon-orange)]/10"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-[#09111e]">
              <MessageCircle className="h-4 w-4" />
            </span>
            Still have a question?
            <ArrowUpRight className="h-4 w-4 text-[var(--neon-orange)] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>

        <Accordion type="single" collapsible className="space-y-2" defaultValue={defaultValue}>
          {faqs.map((faq, index) => (
            <AccordionItem
              key={faq.q}
              value={`item-${index}`}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-transparent px-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 data-[state=open]:border-[var(--neon-orange)]/40 data-[state=open]:shadow-[0_12px_30px_-18px_rgba(255,140,40,0.7)]"
            >
              <AccordionTrigger className="gap-4 py-5 text-left text-sm font-semibold text-slate-100 hover:text-white [&>svg]:text-[var(--neon-orange)] [&[data-state=open]>svg]:rotate-180 sm:text-base">
                <span className="flex items-center gap-4">
                  <span className="font-mono text-xs font-medium text-[var(--neon-orange)]/70">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {faq.q}
                </span>
              </AccordionTrigger>
              <AccordionContent className="faq-answer-fade pl-9 text-sm text-slate-300">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="relative z-10 mt-10 flex flex-col justify-between gap-3 border-t border-white/10 pt-5 text-xs text-slate-400 sm:flex-row sm:items-center">
        <p>Have a project in mind?</p>
        <a href="mailto:hello@bawatpieza.com" className="inline-flex items-center gap-1 font-semibold text-white transition hover:text-[var(--neon-orange)]">
          Talk to the team <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </section>
  );
}
