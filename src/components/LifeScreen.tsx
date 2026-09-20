"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "./Providers";
import { ReadingHtml } from "./Reading";
import {
  formatDay,
  fromISO,
  julian,
  lifeTitles,
  lifeUrl,
  pictureUrl,
  today,
  toISO,
  type Day,
} from "@/lib/calendar";

export function LifeScreen() {
  const { tables } = useApp();
  const [day, setDay] = useState<Day>(today);
  const [index, setIndex] = useState(0);
  const [html, setHtml] = useState<string | null>(null);
  const [pictureOk, setPictureOk] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = fromISO(params.get("date"));
    if (fromUrl) setDay(fromUrl);
    const i = Number(params.get("i"));
    if (Number.isFinite(i) && i >= 0) setIndex(i);
  }, []);

  const titles = useMemo(() => (tables ? lifeTitles(tables, day) : []), [tables, day]);

  useEffect(() => {
    let cancelled = false;
    setHtml(null);
    setPictureOk(true);
    fetch(lifeUrl(day, index))
      .then((response) => (response.ok ? response.text() : Promise.reject()))
      .then((text) => {
        if (cancelled) return;
        // the same clean-up the mobile apps do
        const cleaned = text
          .replace(/<img.+\/(img)*>/g, "")
          .replace(/<a href=.+<\/a>/g, "")
          .replace(/<img.+?>/g, "");
        setHtml(cleaned);
      })
      .catch(() => {
        if (!cancelled) setHtml("");
      });
    return () => {
      cancelled = true;
    };
  }, [day, index]);

  const old = julian(day);

  return (
    <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="card p-5">
          <p className="text-sm" style={{ color: "var(--ink-soft)" }}>ძვ. სტ.</p>
          <p className="font-[family-name:var(--font-ucnobi)] text-xl">{formatDay(old)}</p>
          <Link href={`/?date=${toISO(day)}`} className="mt-3 inline-block text-sm underline-offset-4 hover:underline">
            ← დღის გვერდზე დაბრუნება
          </Link>
        </div>

        {titles.length > 0 && (
          <nav className="card divide-y overflow-hidden" style={{ borderColor: "var(--line)" }}>
            {titles.map((title, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className="block w-full px-5 py-3 text-left text-sm transition-colors"
                style={{
                  borderColor: "var(--line)",
                  backgroundColor: i === index ? "var(--surface-2)" : "transparent",
                  color: i === index ? "var(--ink)" : "var(--ink-soft)",
                }}
              >
                {title || "ხსენება"}
              </button>
            ))}
          </nav>
        )}
      </aside>

      <article className="card p-5 sm:p-8">
        {pictureOk && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pictureUrl(day, index)}
            alt=""
            onError={() => setPictureOk(false)}
            className="mx-auto mb-6 max-h-72 rounded-2xl object-contain"
          />
        )}
        {html === null ? (
          <div className="h-96 animate-pulse" />
        ) : html === "" ? (
          <p style={{ color: "var(--ink-soft)" }}>ამ ხსენებისთვის ტექსტი არ მოიძებნა.</p>
        ) : (
          <ReadingHtml html={html} />
        )}
      </article>
    </div>
  );
}
