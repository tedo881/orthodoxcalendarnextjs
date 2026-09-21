"use client";

import Link from "next/link";
import Script from "next/script";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "./Providers";
import { MonthCalendar } from "./MonthCalendar";
import { Reading } from "./Reading";
import { Lightbox } from "./Lightbox";
import {
  addDays,
  clampDay,
  dayView,
  formatDay,
  fromISO,
  julian,
  fallbackDayPicture,
  firstLifePicture,
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

/** Site that provides the daily reading widget (iframe + embed.js). */
const READING_SITE = "https://koveldgiurisakitxavinextjs.vercel.app";

export function DayScreen() {
  const { tables, loading, error } = useApp();
  const [day, setDay] = useState<Day>(today);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [iconOpen, setIconOpen] = useState(false);
  const [fallbackIcon, setFallbackIcon] = useState<{
    key: string;
    src: string | null;
  } | null>(null);

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
  // Days without an icon of their own show the first picture from the lives of saints.
  const dayId = toISO(day);
  const needsFallback = view !== null && view.icon === null;
  useEffect(() => {
    if (!needsFallback || lives.length === 0) return;
    let cancelled = false;
    fallbackDayPicture(day, lives.length).then((src) => {
      if (!cancelled) setFallbackIcon({ key: dayId, src });
    });
    return () => {
      cancelled = true;
    };
  }, [needsFallback, lives.length, day, dayId]);

  const iconSrc = view?.icon
    ? `/icons/${view.icon}`
    : fallbackIcon?.key === dayId && fallbackIcon.src
      ? fallbackIcon.src
      : "/icons/cross3.png";

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
            <button
              type="button"
              onClick={() => setIconOpen(true)}
              className="shrink-0 cursor-zoom-in"
              aria-label="ხატის გადიდება"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={iconSrc}
                alt="დღის ხატი"
                className="h-32 w-24 rounded-xl object-contain"
                style={{
                  backgroundColor: "var(--surface-2)",
                  border: "1px solid var(--line)",
                }}
              />
            </button>
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
        <section className="card p-3 sm:p-5">
          <h1
            className="mb-3 font-[family-name:var(--font-ucnobi)] text-xl"
            style={{ color: "var(--ink-soft)" }}
          >
            დღის ხსენებები
          </h1>
          <Reading fragments={view.fragments} />
        </section>

        <section className="grid items-start gap-4 sm:grid-cols-2">
          <Link
            href={`/troparia?date=${toISO(day)}`}
            className="card block p-5 transition-transform hover:-translate-y-0.5"
          >
            <h2 className="font-[family-name:var(--font-ucnobi)] text-lg">
              დღის ტროპარ-კონდაკი
            </h2>
            <p
              className="mt-2"
              style={{
                color: "var(--ink-soft)",
                fontSize: "var(--reading-size)",
                lineHeight: 1.6,
              }}
            >
              {troparionPreview || "ტექსტი მოიძიეთ საზოგადო ტროპარ-კონდაკებში"}
            </p>
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
              <ul
                className="mt-2 space-y-2"
                style={{ fontSize: "var(--reading-size)", lineHeight: 1.6 }}
              >
                {lives.map((title, index) => (
                  <li key={index}>
                    <LifeLink day={day} index={index} title={title} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="card overflow-hidden">
          <h2 className="px-5 pb-2 pt-4 font-[family-name:var(--font-ucnobi)] text-lg">
            დღის საკითხავი
          </h2>
          <div className="px-5 pb-5">
            <ReadingFrame src={`${READING_SITE}/embed?date=${toISO(day)}`} />
          </div>
          <Script
            src={`${READING_SITE}/embed.js`}
            strategy="afterInteractive"
          />
        </section>
      </div>

      {iconOpen && (
        <Lightbox
          images={[iconSrc]}
          index={0}
          onChange={() => undefined}
          onClose={() => setIconOpen(false)}
        />
      )}
    </div>
  );
}

/**
 * The reading widget. Its height follows the content: the embed page reports its height
 * with postMessage, and the frame is resized to it (several common message shapes are
 * accepted, so it works with embed.js as well as with a plain postMessage).
 */
function ReadingFrame({ src }: { src: string }) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(360);
  const [resized, setResized] = useState(false);

  // New day → new page inside the frame. Shrink the frame first, otherwise a page that
  // measures document height would never report less than the old frame height.
  // If the page does not answer within 1.5 s, fall back to the default height.
  useEffect(() => {
    setResized(false);
    setHeight(120);
    const fallback = window.setTimeout(() => {
      setResized((done) => {
        if (!done) setHeight(360);
        return done;
      });
    }, 1500);
    return () => window.clearTimeout(fallback);
  }, [src]);

  useEffect(() => {
    const origin = new URL(READING_SITE).origin;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== origin) return;
      if (frameRef.current && event.source !== frameRef.current.contentWindow)
        return;
      const data: unknown = event.data;
      let value: number | null = null;
      if (typeof data === "number") value = data;
      else if (typeof data === "string") {
        try {
          const parsed = JSON.parse(data) as Record<string, unknown>;
          value = Number(parsed.height ?? parsed.frameHeight ?? parsed.h);
        } catch {
          const match = data.match(/(\d+(?:\.\d+)?)/);
          value = match ? Number(match[1]) : null;
        }
      } else if (data && typeof data === "object") {
        const record = data as Record<string, unknown>;
        value = Number(record.height ?? record.frameHeight ?? record.h);
      }
      if (value && Number.isFinite(value) && value > 50 && value < 20000) {
        setHeight(Math.ceil(value));
        setResized(true);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <iframe
      ref={frameRef}
      data-saeklesio
      src={src}
      title="დღის საკითხავი"
      width="100%"
      height={height}
      loading="lazy"
      // until the page reports its height, keep the inner scrollbar as a fallback
      scrolling={resized ? "no" : "auto"}
      className="block w-full transition-[height] duration-200"
      style={{ border: 0, height }}
    />
  );
}

/**
 * Title of a life. On hover (mouse only) the first picture of that saint, if there is
 * one, follows the cursor.
 */
function LifeLink({
  day,
  index,
  title,
}: {
  day: Day;
  index: number;
  title: string;
}) {
  const [picture, setPicture] = useState<string | null>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [loaded, setLoaded] = useState(false);

  const onEnter = (event: React.MouseEvent) => {
    setPosition({ x: event.clientX, y: event.clientY });
    firstLifePicture(day, index).then(setPicture);
  };

  // keep the preview inside the window
  const style = (() => {
    if (!position) return undefined;
    const width = 180;
    const height = 240;
    const left = Math.min(position.x + 18, window.innerWidth - width - 12);
    const top =
      position.y + 18 + height > window.innerHeight
        ? position.y - height - 18
        : position.y + 18;
    return { left, top: Math.max(12, top), width, height };
  })();

  return (
    <>
      <Link
        href={`/lives?date=${toISO(day)}&i=${index}`}
        className="underline-offset-4 hover:underline"
        onMouseEnter={onEnter}
        onMouseMove={(event) =>
          setPosition({ x: event.clientX, y: event.clientY })
        }
        onMouseLeave={() => {
          setPosition(null);
          setLoaded(false);
        }}
      >
        {title || "ხსენება"}
      </Link>
      {position &&
        picture &&
        style &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[90] overflow-hidden rounded-xl shadow-2xl transition-opacity duration-200"
            style={{
              ...style,
              opacity: loaded ? 1 : 0,
              border: "1px solid var(--line)",
              backgroundColor: "var(--surface)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={picture}
              alt=""
              onLoad={() => setLoaded(true)}
              className="h-full w-full object-cover"
            />
          </div>,
          document.body,
        )}
    </>
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
