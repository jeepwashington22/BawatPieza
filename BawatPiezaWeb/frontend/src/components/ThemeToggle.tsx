"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setDark(document.documentElement.classList.contains("dark"));
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("bp-theme", next ? "dark" : "light");
    } catch {
      /* ignore */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      aria-label="Toggle dark mode"
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      data-dark={dark}
      className="theme-toggle relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-[var(--line-strong)] bg-[var(--tint10)] text-[var(--soft)] shadow-sm backdrop-blur-sm transition-colors duration-300 hover:text-[var(--text)]"
    >
      <Sun
        className="theme-toggle-sun absolute h-5 w-5"
      />
      <Moon
        className="theme-toggle-moon absolute h-5 w-5"
      />
    </button>
  );
}
