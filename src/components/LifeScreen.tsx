"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "./Providers";
import { ReadingHtml } from "./Reading";
import { Lightbox, Spinner } from "./Lightbox";
import {
  formatDay,
  fromISO,
  julian,
  lifeTitles,
  lifeHtml,
  lifePictures,
  today,
  toISO,
  type Day,
} from "@/lib/calendar";

export function LifeScreen() {
  const { tables } = useApp();
  const [day, setDay] = useState<Day>(today);
  const [index, setIndex] = useState(0);
  const [html, setHtml] = useState<string | null>(null);
  const [pictures, setPictures] = useState<string[]>([]);
  const [picturesLoading, setPicturesLoading] = useState(true);
  const [viewer, setViewer] = useState<number | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = fromISO(params.get("date"));
    if (fromUrl) setDay(fromUrl);
    const i = Number(params.get("i"));
    if (Number.isFinite(i) && i >= 0) setIndex(i);
  }, []);

  const titles = useMemo(
    () => (tables ? lifeTitles(tables, day) : []),
    [tables, day],
  );

  useEffect(() => {
    let cancelled = false;
    setHtml(null);
    setPictures([]);
    setPicturesLoading(true);
    lifePictures(day, index).then((found) => {
      if (cancelled) return;
      setPictures(found);
      setPicturesLoading(false);
    });
    lifeHtml(day, index)
      .then((value) => {
        if (!cancelled) setHtml(value ?? "");
      })
      .catch(() => {
        if (!cancelled) setHtml("");
      });
    return () => {
      cancelled = true;
    };
  }, [day, index]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const update = () => {
      setCanScrollRight(el.scrollWidth - el.clientWidth - el.scrollLeft > 8);
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pictures]);

  function scrollRight() {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth * 0.8, behavior: "smooth" });
  }

  const old = julian(day);

  return (
    <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="card p-5">
          <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
            ძვ. სტ.
          </p>
          <p className="font-[family-name:var(--font-ucnobi)] text-xl">
            {formatDay(old)}
          </p>
          <Link
            href={`/?date=${toISO(day)}`}
            className="mt-3 inline-block text-sm underline-offset-4 hover:underline"
          >
            ← დღის გვერდზე დაბრუნება
          </Link>
        </div>

        {titles.length > 0 && (
          <nav
            className="card divide-y overflow-hidden"
            style={{ borderColor: "var(--line)" }}
          >
            {titles.map((title, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className="block w-full px-5 py-3 text-left text-sm transition-colors"
                style={{
                  borderColor: "var(--line)",
                  backgroundColor:
                    i === index ? "var(--surface-2)" : "transparent",
                  color: i === index ? "var(--ink)" : "var(--ink-soft)",
                }}
              >
                {title || "ხსენება"}
              </button>
            ))}
          </nav>
        )}
      </aside>
      <article className="card p-5 sm:p-8 min-w-0">
        {picturesLoading && (
          <div
            className="mb-6 flex justify-center gap-3 pb-3"
            aria-label="სურათები იტვირთება"
          >
            {[0, 1].map((key) => (
              <div
                key={key}
                className="flex h-56 w-40 animate-pulse items-center justify-center rounded-2xl sm:h-64 sm:w-44"
                style={{
                  backgroundColor: "var(--surface-2)",
                  border: "1px solid var(--line)",
                }}
              >
                <Spinner />
              </div>
            ))}
          </div>
        )}

        {pictures.length > 0 && (
          <div className="relative mb-6">
            <div
              ref={scrollRef}
              className="pictures-scroll snap-x overflow-x-scroll pb-3"
            >
              <div className="mx-auto flex w-max gap-3 px-1">
                {pictures.map((src, pictureIndex) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setViewer(pictureIndex)}
                    className="shrink-0 snap-start cursor-zoom-in"
                    aria-label="სურათის გადიდება"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <FadeImage src={src} />
                  </button>
                ))}
              </div>
            </div>

            {canScrollRight && (
              <button
                type="button"
                onClick={scrollRight}
                aria-label="შემდეგი სურათები"
                className="absolute right-1 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full transition-opacity"
                style={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--line)",
                  boxShadow: "var(--shadow)",
                  color: "var(--ink)",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            )}
          </div>
        )}
        {html === null ? (
          <div className="h-96 animate-pulse" />
        ) : html === "" ? (
          <p style={{ color: "var(--ink-soft)" }}>
            ამ ხსენებისთვის ტექსტი არ მოიძებნა.
          </p>
        ) : (
          <ReadingHtml html={html} />
        )}
        {viewer !== null && (
          <Lightbox
            images={pictures}
            index={viewer}
            onChange={setViewer}
            onClose={() => setViewer(null)}
          />
        )}
      </article>
    </div>
  );
}

/** Picture of the row: shows a spinner until the file has loaded, then fades in. */
function FadeImage({ src }: { src: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <span
      className="relative block h-56 min-w-40 overflow-hidden rounded-2xl sm:h-64"
      style={{
        border: "1px solid var(--line)",
        backgroundColor: "var(--surface-2)",
      }}
    >
      {!loaded && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner />
        </span>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        onLoad={() => setLoaded(true)}
        className="h-full w-auto object-contain transition-opacity duration-500"
        style={{ opacity: loaded ? 1 : 0 }}
      />
    </span>
  );
}
