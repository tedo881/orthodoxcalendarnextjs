"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  dayKey,
  FIRST_YEAR,
  LAST_YEAR,
  markerColor,
  MONTHS,
  sameDay,
  today,
  WEEK_HEADERS,
  weekday,
  type Day,
  type Tables,
} from "@/lib/calendar";

const MARKER_COLOR: Record<string, string> = {
  fast: "var(--ink)",
  feast: "var(--feast)",
  cheese: "var(--fastfree)",
};

export function MonthCalendar({
  tables,
  selected,
  onSelect,
}: {
  tables: Tables;
  selected: Day;
  onSelect: (day: Day) => void;
}) {
  const [cursor, setCursor] = useState({ year: selected.year, month: selected.month });
  const now = today();

  const cells = useMemo(() => {
    const first: Day = { year: cursor.year, month: cursor.month, day: 1 };
    const lead = (weekday(first) + 6) % 7; // Monday first
    const start = addDays(first, -lead);
    return Array.from({ length: 42 }, (_, i) => {
      const day = addDays(start, i);
      return { day, inMonth: day.month === cursor.month };
    });
  }, [cursor]);

  const move = (delta: number) => {
    let month = cursor.month + delta;
    let year = cursor.year;
    if (month < 1) { month = 12; year -= 1; }
    if (month > 12) { month = 1; year += 1; }
    if (year < FIRST_YEAR || year > LAST_YEAR) return;
    setCursor({ year, month });
  };

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2" style={{ backgroundColor: "var(--accent)", color: "#fffdf6" }}>
        <button type="button" className="h-9 w-9 rounded-lg text-lg" onClick={() => move(-1)} aria-label="წინა თვე">‹</button>
        <span className="font-[family-name:var(--font-ucnobi)] text-lg">
          {MONTHS[cursor.month - 1]} {cursor.year}
        </span>
        <button type="button" className="h-9 w-9 rounded-lg text-lg" onClick={() => move(1)} aria-label="შემდეგი თვე">›</button>
      </div>

      <div className="grid grid-cols-7 px-2 pt-2 text-center text-xs" style={{ color: "var(--ink-soft)" }}>
        {WEEK_HEADERS.map((name) => (
          <span key={name} className="py-1">{name}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5 p-2">
        {cells.map(({ day, inMonth }) => {
          const isSelected = sameDay(day, selected);
          const isToday = sameDay(day, now);
          const marker = inMonth ? markerColor(tables, day) : null;
          const sunday = weekday(day) === 0;
          return (
            <button
              key={dayKey(day)}
              type="button"
              onClick={() => onSelect(day)}
              className="flex h-11 flex-col items-center justify-center rounded-xl transition-colors"
              style={{
                backgroundColor: isSelected ? "var(--accent)" : "transparent",
                color: isSelected
                  ? "#fffdf6"
                  : !inMonth
                    ? "color-mix(in srgb, var(--ink-soft) 55%, transparent)"
                    : isToday
                      ? "var(--accent)"
                      : sunday
                        ? "var(--feast)"
                        : "var(--ink)",
                fontWeight: isSelected || isToday ? 700 : 400,
              }}
            >
              <span className="text-sm leading-none">{day.day}</span>
              <span
                className="mt-1 h-1 w-3.5 rounded-full"
                style={{ backgroundColor: marker ? MARKER_COLOR[marker] : "transparent", opacity: isSelected ? 0.85 : 1 }}
              />
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3 border-t px-3 py-2 text-xs" style={{ borderColor: "var(--line)", color: "var(--ink-soft)" }}>
        <Legend color={MARKER_COLOR.fast} label="მარხვა" />
        <Legend color={MARKER_COLOR.feast} label="მსგეფსი / ბრწყინვალე" />
        <Legend color={MARKER_COLOR.cheese} label="ყველიერი" />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-1 w-3.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
