"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useApp } from "./Providers";
import { MonthCalendar } from "./MonthCalendar";
import { Reading } from "./Reading";
import {
  addDays,
  clampDay,
  dayView,
  formatDay,
  fromISO,
  julian,
  lifeTitles,
  plainText,
  sameDay,
  today,
  toISO,
  troparionHtml,
  WEEKDAYS,
  weekday,
  type Day,
} from "@/lib/calendar";

export function DayScreen() {
  const { tables, loading, error } = useApp();
  const [day, setDay] = useState<Day>(today);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // deep link: /?date=2026-04-12
  useEffect(() => {
    const fromUrl = fromISO(
      new URLSearchParams(window.location.search).get("date"),
    );
    if (fromUrl) setDay(fromUrl);
  }, []);

  const go = useCallback((next: Day) => {
    const value = clampDay(next);
    setDay(value);
    const url = new URL(window.location.href);
    if (sameDay(value, today())) url.searchParams.delete("date");
    else url.searchParams.set("date", toISO(value));
    window.history.replaceState(null, "", url);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return;
      if (event.key === "ArrowLeft") go(addDays(day, -1));
      if (event.key === "ArrowRight") go(addDays(day, 1));
      if (event.key.toLowerCase() === "t") go(today());
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [day, go]);

  const swipe = useSwipe(
    () => go(addDays(day, 1)),
    () => go(addDays(day, -1)),
  );

  const view = useMemo(
    () => (tables ? dayView(tables, day) : null),
    [tables, day],
  );
  const lives = useMemo(
    () => (tables ? lifeTitles(tables, day) : []),
    [tables, day],
  );
  const troparionPreview = useMemo(() => {
    if (!tables) return "";
    const text = plainText(troparionHtml(tables, day));
    return text.length > 220 ? `${text.slice(0, 220)}…` : text;
  }, [tables, day]);

  if (error) {
    return <p className="card p-6 text-center">{error}</p>;
  }
  if (loading || !tables || !view) {
    return <SkeletonScreen />;
  }

  const old = julian(day);
  const feast = view.isFeast;

  return (
    <div className="grid gap-6 lg:grid-cols-[22rem_1fr]" {...swipe}>
      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <section className="card overflow-hidden">
          <div className="flex items-start gap-4 p-5">
            <div className="flex-1">
              <p
                className="font-[family-name:var(--font-ucnobi)] text-2xl"
                style={{ color: feast ? "var(--feast)" : "var(--ink)" }}
              >
                {WEEKDAYS[weekday(day)]}
              </p>
              <p
                className="mt-3 text-lg"
                style={{ color: feast ? "var(--feast)" : "var(--ink)" }}
              >
                {formatDay(day)}{" "}
                <span className="text-sm" style={{ color: "var(--ink-soft)" }}>
                  (ახ. სტ.)
                </span>
              </p>
              <p
                className="text-lg"
                style={{ color: feast ? "var(--feast)" : "var(--ink)" }}
              >
                {formatDay(old)}{" "}
                <span className="text-sm" style={{ color: "var(--ink-soft)" }}>
                  (ძვ. სტ.)
                </span>
              </p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/icons/${view.icon ?? "cross3.png"}`}
              alt="დღის ხატი"
              className="h-32 w-24 rounded-xl object-contain"
              style={{
                backgroundColor: "var(--surface-2)",
                border: "1px solid var(--line)",
              }}
            />
          </div>

          {view.fasting.out && (
            <div
              className="flex items-center justify-center gap-2 border-t px-5 py-3"
              style={{ borderColor: "var(--line)" }}
            >
              <span
                className="font-[family-name:var(--font-ucnobi)] text-xl"
                style={{
                  color:
                    view.fasting.fer === -1
                      ? "var(--fastfree)"
                      : view.fasting.fer === 1
                        ? "var(--feast)"
                        : "var(--ink)",
                }}
              >
                {view.fasting.out}
              </span>
              {view.fasting.tevz && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src="/icons/fish3.png"
                  alt="თევზით ხსნილი"
                  title="თევზით ხსნილი"
                  className="h-5 w-5"
                />
              )}
            </div>
          )}

          <div
            className="grid grid-cols-3 gap-2 border-t p-3"
            style={{ borderColor: "var(--line)" }}
          >
            <button
              type="button"
              className="btn"
              onClick={() => go(addDays(day, -1))}
            >
              ← წინა
            </button>
            <button
              type="button"
              className="btn btn-accent"
              onClick={() => go(today())}
            >
              დღეს
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => go(addDays(day, 1))}
            >
              შემდეგი →
            </button>
          </div>
        </section>

        <div className="lg:hidden">
          <button
            type="button"
            className="btn w-full"
            onClick={() => setCalendarOpen((open) => !open)}
          >
            {calendarOpen ? "კალენდრის დახურვა" : "კალენდრის გახსნა"}
          </button>
        </div>

        <div className={calendarOpen ? "block" : "hidden lg:block"}>
          <MonthCalendar
            tables={tables}
            selected={day}
            onSelect={(value) => {
              go(value);
              setCalendarOpen(false);
            }}
          />
        </div>
      </aside>

      <div className="space-y-6">
        <section className="card p-5 sm:p-7">
          <h1
            className="mb-3 font-[family-name:var(--font-ucnobi)] text-xl"
            style={{ color: "var(--ink-soft)" }}
          >
            დღის ხსენებები
          </h1>
          <Reading fragments={view.fragments} />
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <Link
            href={`/troparia?date=${toISO(day)}`}
            className="card p-5 transition-transform hover:-translate-y-0.5"
          >
            <h2 className="font-[family-name:var(--font-ucnobi)] text-lg">
              დღის ტროპარ-კონდაკი
            </h2>
            {troparionPreview ? (
              <p
                className="mt-2 text-sm leading-relaxed"
                style={{ color: "var(--ink-soft)" }}
              >
                {troparionPreview}
              </p>
            ) : (
              <p className="mt-2 text-sm" style={{ color: "var(--ink-soft)" }}>
                ტექსტი მოიძიეთ საზოგადო ტროპარ-კონდაკებში
              </p>
            )}
          </Link>

          <div className="card p-5">
            <h2 className="font-[family-name:var(--font-ucnobi)] text-lg">
              წმინდანთა ცხოვრება
            </h2>
            {lives.length === 0 ? (
              <p className="mt-1 text-sm" style={{ color: "var(--ink-soft)" }}>
                ამ დღისთვის ტექსტი არ არის
              </p>
            ) : (
              <ul className="mt-2 space-y-1">
                {lives.map((title, index) => (
                  <li key={index}>
                    <Link
                      href={`/lives?date=${toISO(day)}&i=${index}`}
                      className="text-sm underline-offset-4 hover:underline"
                    >
                      {title || "ხსენება"}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function SkeletonScreen() {
  return (
    <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
      <div className="card h-64 animate-pulse" />
      <div className="card h-96 animate-pulse" />
    </div>
  );
}

function useSwipe(onLeft: () => void, onRight: () => void) {
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  return {
    onTouchStart: (event: React.TouchEvent) => {
      const touch = event.touches[0];
      setStart({ x: touch.clientX, y: touch.clientY });
    },
    onTouchEnd: (event: React.TouchEvent) => {
      if (!start) return;
      const touch = event.changedTouches[0];
      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      setStart(null);
      if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy)) return;
      if (dx < 0) onLeft();
      else onRight();
    },
  };
}
