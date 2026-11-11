"use client";

import type { CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";

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
      className="relative isolate overflow-hidden px-0 py-0 text-white"
      aria-label="Frequently asked questions"
    >
      <div className="faq-orb absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(255,168,74,0.38),rgba(255,105,24,0.08)_42%,transparent_70%)] blur-2xl" />
      {/* heading, intro and "Still have a question?" now live in page.tsx (right column) */}
      <div className="relative z-10">
        <Accordion type="single" collapsible className="space-y-2" defaultValue={defaultValue}>
          {faqs.map((faq, index) => (
            <AccordionItem
              key={faq.q}
              value={`item-${index}`}
              style={{ "--i": index } as CSSProperties}
              /* the open / close motion itself lives in globals.css (.faq-pop) */
              className="faq-pop group overflow-hidden rounded-2xl border border-white/10 bg-transparent px-5 hover:-translate-y-0.5 hover:border-white/20 data-[state=open]:border-white/50 data-[state=open]:shadow-[0_12px_30px_-18px_rgba(21,34,56,0.6)]"
            >
              <AccordionTrigger className="gap-4 py-5 text-left text-sm font-semibold text-slate-100 hover:text-white [&>svg]:text-white [&>svg]:transition-transform [&>svg]:duration-500 [&>svg]:ease-[cubic-bezier(0.22,1,0.36,1)] [&[data-state=open]>svg]:rotate-180 sm:text-base">
                <span className="flex items-center gap-4">
                  <span className="font-mono text-xs font-bold text-white">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {faq.q}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pl-9 text-sm text-slate-300">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="relative z-10 mt-8 flex flex-col justify-between gap-3 border-t border-white/15 pt-5 text-xs text-white/70 sm:flex-row sm:items-center">
        <p>Have a project in mind?</p>
        <a href="mailto:hello@bawatpieza.com" className="inline-flex items-center gap-1 font-semibold text-white transition hover:text-[#152238]">
          Talk to the team <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </section>
  );
}