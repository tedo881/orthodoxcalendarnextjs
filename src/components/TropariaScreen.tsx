"use client";

import { useEffect, useMemo, useState } from "react";
import { useApp } from "./Providers";
import { ReadingHtml } from "./Reading";
import { GENERAL_TROPARIA } from "@/lib/generalTroparia";
import { formatDay, fromISO, julian, today, troparionHtml, type Day } from "@/lib/calendar";

export function TropariaScreen() {
  const { tables, loading } = useApp();
  const [day, setDay] = useState<Day>(today);
  const [tab, setTab] = useState<"day" | "general">("day");

  useEffect(() => {
    const fromUrl = fromISO(new URLSearchParams(window.location.search).get("date"));
    if (fromUrl) setDay(fromUrl);
  }, []);

  const dayHtml = useMemo(() => (tables ? troparionHtml(tables, day) : ""), [tables, day]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={`btn ${tab === "day" ? "btn-accent" : ""}`} onClick={() => setTab("day")}>
          დღის ტროპარ-კონდაკი
        </button>
        <button type="button" className={`btn ${tab === "general" ? "btn-accent" : ""}`} onClick={() => setTab("general")}>
          საზოგადო ტროპარ-კონდაკები
        </button>
        {tab === "day" && (
          <span className="pill px-4 py-2 text-sm" style={{ color: "var(--ink-soft)" }}>
            {formatDay(day)} (ახ. სტ.) · {formatDay(julian(day))} (ძვ. სტ.)
          </span>
        )}
      </div>

      <article className="card p-5 sm:p-7">
        {tab === "general" ? (
          <ReadingHtml html={GENERAL_TROPARIA} />
        ) : loading ? (
          <div className="h-64 animate-pulse" />
        ) : dayHtml.trim() ? (
          <ReadingHtml html={dayHtml} />
        ) : (
          <p style={{ color: "var(--ink-soft)" }}>
            ამ დღისთვის ცალკე ტროპარი არ არის — ტექსტი მოიძიეთ საზოგადო ტროპარ-კონდაკებში.
          </p>
        )}
      </article>
    </div>
  );
}
