"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { label: "Overview", href: "#home" },
  { label: "Generation", href: "#generation" },
  { label: "How it works", href: "#how" },
  { label: "Tile inside", href: "#specs" },
  { label: "Deployments", href: "#deployments" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export default function HomeNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [deploymentsActive, setDeploymentsActive] = useState(false);
  const [activeNav, setActiveNav] = useState("Overview");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const deployments = document.getElementById("deployments");
    if (!deployments) return;

    const observer = new IntersectionObserver(
      ([entry]) => setDeploymentsActive(entry.isIntersecting),
      { threshold: 0.2 },
    );

    observer.observe(deployments);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const sections = NAV_ITEMS.map((item) => document.querySelector<HTMLElement>(item.href)).filter(
      (section): section is HTMLElement => section !== null,
    );
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top))[0];

        if (visible) {
          const item = NAV_ITEMS.find((navItem) => navItem.href === `#${visible.target.id}`);
          if (item) setActiveNav(item.label);
        }
      },
      { rootMargin: "-18% 0px -62% 0px", threshold: [0, 0.1, 0.5] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
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
        className={`fixed inset-x-0 top-0 z-50 w-full border-b border-white/20 transition-colors duration-500 ${
          deploymentsActive
            ? "bg-[#0a101a]/85 backdrop-blur-md"
            : "bg-gradient-to-r from-[#b92713] via-[#e5481d] to-[#ff7a21]"
        } ${
          scrolled ? "shadow-[0_10px_30px_-18px_rgba(126,39,12,0.5)]" : ""
        }`}
      >
        {/* painted through the footprint by HeroTileScroll, so the bar changes with the transition */}
        <span data-nav-reveal aria-hidden="true" className="nav-reveal" />
        <nav className="relative mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#home" aria-label="BawatPieza home" className="flex items-center rounded-md p-1 transition hover:bg-white/15">
          {!logoFailed ? (
            <Image
              src="/bawat-pieza-logo.png"
              alt="BawatPieza"
              width={220}
              height={120}
              className="h-12 w-auto max-w-[15rem] object-contain object-left brightness-0 invert transition"
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <span className="text-base font-bold tracking-tight text-white transition">
              Bawat<span className="text-white/90">Pieza</span>
            </span>
          )}
          </a>

          <div className="hidden items-center gap-0.5 md:flex">
            {NAV_ITEMS.map((item) => {
              const isActive = activeNav === item.label;

              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setActiveNav(item.label)}
                  className={`group relative rounded-md px-2.5 py-1.5 text-xs font-medium tracking-[0.02em] transition-colors duration-200 ${
                    isActive
                      ? "bg-white/15 text-white"
                      : "text-white/80 hover:bg-white/15 hover:text-white"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute bottom-0.5 left-2.5 right-2.5 h-0.5 origin-left rounded-full transition-transform duration-300 ease-out ${
                      "bg-[var(--neon-orange)]"
                    } ${
                      isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </a>
              );
            })}
          </div>

          <button
            type="button"
            aria-expanded={isOpen}
            aria-controls="home-menu"
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setIsOpen((open) => !open)}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-white/30 bg-white/15 text-white transition hover:border-white/60 hover:bg-white/25 md:hidden"
          >
            {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
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
        className={`fixed inset-x-0 top-16 z-40 flex h-[calc(100dvh-4rem)] flex-col gap-6 overflow-hidden border-y border-white/20 bg-gradient-to-br from-[#b92713] via-[#e5481d] to-[#ff7a21] p-4 transition-[opacity,transform] duration-300 md:hidden ${isOpen ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-3 opacity-0"}`}
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
                    ? "bg-white/15 text-white"
                    : "text-white/85 hover:bg-white/15 hover:text-white"
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