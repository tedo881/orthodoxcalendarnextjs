"use client";

import { useMemo, useState } from "react";
import { useApp } from "./Providers";
import { Reading } from "./Reading";
import { FIRST_YEAR, LAST_YEAR, today, yearIndicators, YEAR_SECTIONS } from "@/lib/calendar";

export function YearScreen() {
  const { tables, loading } = useApp();
  const [year, setYear] = useState(() => today().year);
  const [section, setSection] = useState(0);

  const fragments = useMemo(
    () => (tables ? yearIndicators(tables, year, section) : []),
    [tables, year, section],
  );

  return (
    <div className="space-y-6">
      <div className="card flex flex-wrap items-center justify-center gap-4 p-4">
        <button type="button" className="btn h-12 w-12 !rounded-full !p-0 text-xl" onClick={() => setYear((y) => Math.max(FIRST_YEAR, y - 1))}>−</button>
        <span className="font-[family-name:var(--font-ucnobi)] text-4xl tabular-nums">{year}</span>
        <button type="button" className="btn h-12 w-12 !rounded-full !p-0 text-xl" onClick={() => setYear((y) => Math.min(LAST_YEAR, y + 1))}>+</button>
      </div>

      <div className="flex flex-wrap gap-2">
        {YEAR_SECTIONS.map((label, index) => (
          <button
            key={label}
            type="button"
            className={`btn ${index === section ? "btn-accent" : ""}`}
            onClick={() => setSection(index)}
          >
            {label}
          </button>
        ))}
      </div>

      <section className="card p-5 sm:p-7">
        {loading ? (
          <div className="h-64 animate-pulse" />
        ) : fragments.length === 0 ? (
          <p style={{ color: "var(--ink-soft)" }}>ამ წლისთვის მონაცემები არ არის.</p>
        ) : (
          <Reading fragments={fragments} />
        )}
      </section>
    </div>
  );
}
