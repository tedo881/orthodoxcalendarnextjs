"use client";
import { useEffect, useState } from "react";
import { TYPIKON_SITE } from "@/lib/typikon-site";
import { useFrameHeight } from "./useFrameHeight";

/** სრული ტიპიკონის გვერდი (ნოტები, წოდების არჩევა, ტექსტის ზომა…) ამავე საიტის შიგნით. თარიღი იკითხება მისამართიდან (?date=YYYY-MM-DD) ბრაუზერში, ამიტომ გვერდი სტატიკურია. */
export function TypikonFull() {
  const { ref, height, resized } = useFrameHeight(1200);
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    const d = new URLSearchParams(window.location.search).get("date");
    const ok = d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null;
    setSrc(`${TYPIKON_SITE}/typikon?embed=1${ok ? `&date=${ok}` : ""}`);
  }, []);
  if (!src) return <div style={{ height }} />;
  return (
    <iframe
      ref={ref}
      src={src}
      title="ტიპიკონური მითითებები"
      scrolling={resized ? "no" : "auto"}
      className="block w-full"
      style={{ border: 0, height, background: "transparent" }}
    />
  );
}
