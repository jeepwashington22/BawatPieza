"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { label: "Overview", href: "#home" },
  { label: "How it works", href: "#about" },
  { label: "About", href: "#about" },
  { label: "Features", href: "#about" },
  { label: "Contact", href: "mailto:hello@bawatpieza.com" },
];

export default function HomeNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeNav, setActiveNav] = useState("Overview");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full border-b border-transparent !bg-transparent transition-colors duration-300 ${
          scrolled ? "backdrop-blur-none" : ""
        }`}
      >
        <nav className="mx-auto flex h-24 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#home" aria-label="BawatPieza home" className="flex items-center rounded-md p-1 transition hover:bg-[var(--tint5)]">
          {!logoFailed ? (
            <Image
              src="/bawat-pieza-logo.png"
              alt="BawatPieza"
              width={260}
              height={160}
              className="h-20 w-auto max-w-[18rem] object-contain object-left"
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <span className="text-lg font-bold tracking-tight text-[var(--text)]">
              Bawat<span className="text-[var(--butter)]">Pieza</span>
            </span>
          )}
          </a>

          <div className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setActiveNav(item.label)}
                className={`group relative rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  activeNav === item.label
                    ? "text-[var(--neon-orange)]"
                    : "text-[var(--muted)] hover:bg-[var(--tint5)] hover:text-[var(--text)]"
                }`}
              >
                {item.label}
                <span
                  className={`absolute bottom-0.5 left-3 right-3 h-0.5 origin-left rounded-full bg-[var(--neon-orange)] transition-transform duration-300 ease-out ${
                    activeNav === item.label ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </a>
            ))}
          </div>

          <button
            type="button"
            aria-expanded={isOpen}
            aria-controls="home-menu"
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setIsOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-[var(--line-strong)] bg-[var(--tint5)] text-[var(--text)] transition hover:border-[var(--butter)] hover:text-[var(--butter)] md:hidden"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </header>

      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
        onClick={() => setIsOpen(false)}
      />

      <aside
        id="home-menu"
        aria-hidden={!isOpen}
        className={`fixed inset-x-0 top-24 z-40 flex h-[calc(100dvh-6rem)] flex-col gap-6 overflow-hidden border-y border-[var(--line)] !bg-transparent p-4 backdrop-blur-none transition-[opacity,transform] duration-300 md:hidden ${isOpen ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-3 opacity-0"}`}
      >
        <nav className="grid gap-2" aria-label="Mobile home navigation">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
                onClick={() => {
                  setActiveNav(item.label);
                  setIsOpen(false);
                }}
                className={`group relative flex items-center justify-between rounded-md px-3 py-3 text-lg font-semibold transition-colors duration-200 ${
                  activeNav === item.label
                    ? "bg-[var(--tint5)] text-[var(--neon-orange)]"
                    : "text-[var(--text)] hover:bg-[var(--tint5)] hover:text-[var(--neon-orange)]"
                }`}
            >
              {item.label}
                <span
                  className={`h-1.5 w-1.5 rounded-full bg-[var(--neon-orange)] transition-transform duration-300 ${
                    activeNav === item.label ? "scale-100" : "scale-0 group-hover:scale-100"
                  }`}
                />
            </a>
          ))}
        </nav>
      </aside>
    </>
  );
}
