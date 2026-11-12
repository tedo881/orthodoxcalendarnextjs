"use client";
import Link from "next/link";
import { TYPIKON_SITE } from "@/lib/typikon-site";
import { useFrameHeight } from "./useFrameHeight";

/** მოკლე ტიპიკონური მითითება (ფონის გარეშე) + ღილაკი, რომელიც ამავე საიტზე სრულ ტიპიკონს ხსნის. date = "YYYY-MM-DD" */
export function TypikonShort({
  date,
  dark = false,
}: {
  date: string;
  dark?: boolean;
}) {
  const { ref, height, resized } = useFrameHeight(220);
  const src = `${TYPIKON_SITE}/typikon/embed/short?date=${date}${dark ? "&dark=1" : ""}`;
  return (
    <section className="card p-5">
      <h2 className="font-[family-name:var(--font-ucnobi)] text-lg">
        ტიპიკონური მითითებები
      </h2>
      <iframe
        ref={ref}
        src={src}
        title="ტიპიკონური მითითება"
        scrolling={resized ? "no" : "auto"}
        className="mt-2 block w-full"
        style={{ border: 0, height, background: "transparent" }}
      />
      <Link
        href={`/typikon?date=${date}`}
        className="btn btn-accent mt-3 inline-block"
      >
        სრული ტიპიკონი →
      </Link>
    </section>
  );
}
