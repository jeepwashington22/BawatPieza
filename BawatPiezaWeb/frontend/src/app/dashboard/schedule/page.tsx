"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  Zap,
  BatteryCharging,
  Save,
  CheckCircle2,
} from "lucide-react";
import TopNav from "@/components/TopNav";
import SideNav from "@/components/SideNav";
import BottomNav from "@/components/BottomNav";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function buildMonth(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (first.getDay() + 6) % 7;
  const cells: (number | null)[] = Array.from({ length: offset }, () => null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function SchedulePage() {
  const today = new Date();
  const [monthCursor, setMonthCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<number>(today.getDate());
  const [operatingDays, setOperatingDays] = useState<boolean[]>([true, true, true, true, true, false, false]);
  const [lightsOn, setLightsOn] = useState("6:00 PM");
  const [lightsOff, setLightsOff] = useState("6:00 AM");
  const [alwaysOn, setAlwaysOn] = useState(false);
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("High");
  const [powerSource, setPowerSource] = useState<"Grid" | "Battery">("Battery");
  const [autoSwitch, setAutoSwitch] = useState(true);
  const [saved, setSaved] = useState(false);

  const monthCells = buildMonth(monthCursor);
  const monthLabel = monthCursor.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const isThisMonth = monthCursor.getMonth() === today.getMonth() && monthCursor.getFullYear() === today.getFullYear();

  function shiftMonth(delta: number) {
    setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + delta, 1));
  }
  function toggleDay(i: number) {
    setOperatingDays((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  }
  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--background)] text-[var(--text)]">
      <SideNav />
      <div className="relative flex-1 overflow-y-auto">
        <TopNav title="Zone Schedule" subtitle="Operating days, hours and power priority per zone" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-32 pt-6 sm:px-6 md:pb-10 lg:px-10">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button type="button" className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--tint10)] bg-[var(--surface)] shadow-sm transition hover:bg-[var(--background)]" aria-label="Back">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--faint)]">Zone Control</p>
                <h2 className="text-xl font-bold">Bldg 4 - 1F Hallway A</h2>
              </div>
            </div>
            <span className="rounded-full border border-[var(--tint10)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold shadow-sm">
              Zone ID: <span className="text-[var(--muted)]">BP-Z-041</span>
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
            {/* Calendar card */}
            <section className="rounded-3xl border border-[var(--tint10)] bg-[var(--surface)] p-6 shadow-sm lg:col-span-2">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--background)] text-[var(--text)]">
                  <CalendarDays className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold">Availability Calendar</h3>
                  <p className="text-xs text-[var(--muted)]">Today is highlighted</p>
                </div>
              </div>

              <div className="mb-4 flex items-center justify-between">
                <button type="button" onClick={() => shiftMonth(-1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--tint10)] transition hover:bg-[var(--background)]" aria-label="Previous month">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <p className="text-sm font-bold">{monthLabel}</p>
                <button type="button" onClick={() => shiftMonth(1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--tint10)] transition hover:bg-[var(--background)]" aria-label="Next month">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-2 grid grid-cols-7 text-center text-[11px] font-semibold uppercase tracking-wider text-[var(--faint)]">
                {DAY_LABELS.map((d, i) => (
                  <span key={i}>{d}</span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {monthCells.map((day, i) => {
                  if (day === null) return <span key={i} />;
                  const isToday = isThisMonth && day === today.getDate();
                  const isSelected = isThisMonth && day === selectedDate;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => isThisMonth && setSelectedDate(day)}
                      className={`flex h-9 items-center justify-center rounded-xl text-sm font-medium transition ${
                        isToday
                          ? "bg-[var(--background)] font-bold text-white shadow-md shadow-[var(--shadow)]"
                          : isSelected
                            ? "bg-[var(--line-strong)] font-semibold text-[var(--text)]"
                            : "text-[var(--muted)] hover:bg-[var(--background)]"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-[var(--tint10)] pt-4 text-[11px] text-[var(--muted)]">
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-md bg-[var(--background)]" /> Current date
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-md bg-[var(--butter)]" /> Selected
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Available for scheduling
                </span>
              </div>
            </section>

            {/* Zone control panel */}
            <section className="space-y-5 lg:col-span-3">
              <div className="rounded-3xl border border-[var(--tint10)] bg-[var(--surface)] p-6 shadow-sm">
                <h3 className="text-base font-bold">Operating Days</h3>
                <p className="mb-4 text-xs text-[var(--muted)]">Which days this schedule applies</p>
                <div className="flex flex-wrap gap-3">
                  {DAY_LABELS.map((label, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleDay(i)}
                      aria-pressed={operatingDays[i]}
                      className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold transition ${
                        operatingDays[i]
                          ? "bg-[var(--prussian)] text-white shadow-md shadow-[var(--shadow)]"
                          : "bg-[var(--background)] text-[var(--faint)] hover:text-[var(--soft)]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-[var(--tint10)] bg-[var(--surface)] p-6 shadow-sm">
                <h3 className="text-base font-bold">Operating Hours</h3>
                <p className="mb-4 text-xs text-[var(--muted)]">Custom ON/OFF window for this zone</p>
                <div className={`flex items-center justify-center gap-4 rounded-2xl bg-[var(--background)] p-5 transition ${alwaysOn ? "pointer-events-none opacity-40" : ""}`}>
                  <div className="flex-1 rounded-2xl border border-[var(--tint10)] bg-[var(--surface)] py-4 text-center shadow-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--faint)]">Lights On</p>
                    <input value={lightsOn} onChange={(e) => setLightsOn(e.target.value)} className="w-full bg-transparent text-center text-2xl font-bold outline-none" aria-label="Lights on time" />
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-[var(--line-strong)]" />
                  <div className="flex-1 rounded-2xl border border-[var(--tint10)] bg-[var(--surface)] py-4 text-center shadow-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--faint)]">Lights Off</p>
                    <input value={lightsOff} onChange={(e) => setLightsOff(e.target.value)} className="w-full bg-transparent text-center text-2xl font-bold outline-none" aria-label="Lights off time" />
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-[var(--tint10)] pt-4">
                  <div>
                    <p className="text-sm font-bold">Always On</p>
                    <p className="text-xs text-[var(--muted)]">Ignore schedule, stay lit 24/7</p>
                  </div>
                  <button type="button" role="switch" aria-checked={alwaysOn} onClick={() => setAlwaysOn((v) => !v)} className={`relative h-7 w-12 shrink-0 rounded-full transition ${alwaysOn ? "bg-[var(--background)]" : "bg-[var(--line-strong)]"}`}>
                    <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-[var(--surface)] shadow transition-all ${alwaysOn ? "left-[22px]" : "left-0.5"}`} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="rounded-3xl border border-[var(--tint10)] bg-[var(--surface)] p-6 shadow-sm">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--faint)]">Priority Level</p>
                  <div className="flex gap-2">
                    {(["Low", "Medium", "High"] as const).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setPriority(level)}
                        className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
                          priority === level ? "bg-[var(--prussian)] text-white shadow-md shadow-[var(--shadow)]" : "bg-[var(--background)] text-[var(--faint)] hover:text-[var(--text)]"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-[var(--tint10)] bg-[var(--surface)] p-6 shadow-sm">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--faint)]">Power Source</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPowerSource("Grid")}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition ${
                        powerSource === "Grid" ? "bg-[var(--prussian)] text-white shadow-md shadow-[var(--shadow)]" : "bg-[var(--background)] text-[var(--faint)] hover:text-[var(--text)]"
                      }`}
                    >
                      <Zap className="h-4 w-4" /> Grid
                    </button>
                    <button
                      type="button"
                      onClick={() => setPowerSource("Battery")}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition ${
                        powerSource === "Battery" ? "bg-[var(--prussian)] text-white shadow-md shadow-[var(--shadow)]" : "bg-[var(--background)] text-[var(--faint)] hover:text-[var(--text)]"
                      }`}
                    >
                      <BatteryCharging className="h-4 w-4" /> Battery
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-[var(--tint10)] bg-[var(--surface)] p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold">Follow Auto-Switch</p>
                    <p className="text-xs text-[var(--muted)]">Let the system pick source automatically</p>
                  </div>
                  <button type="button" role="switch" aria-checked={autoSwitch} onClick={() => setAutoSwitch((v) => !v)} className={`relative h-7 w-12 shrink-0 rounded-full transition ${autoSwitch ? "bg-[var(--background)]" : "bg-[var(--line-strong)]"}`}>
                    <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-[var(--surface)] shadow transition-all ${autoSwitch ? "left-[22px]" : "left-0.5"}`} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleSave}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--butter)] to-[#f59e0b] py-4 text-sm font-bold text-[var(--text)] shadow-lg shadow-[var(--faint)] transition hover:brightness-105 active:scale-[0.99]"
                >
                  {saved ? <CheckCircle2 className="h-5 w-5" /> : <Save className="h-5 w-5" />}
                  {saved ? "Settings Saved!" : "Save Zone Settings"}
                </button>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] text-[var(--faint)]">
                  <Clock className="h-3 w-3" />
                  Applies from the next scheduling cycle
                </p>
              </div>
            </section>
          </div>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
