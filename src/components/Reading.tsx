"use client";

import type { Fragment } from "@/lib/calendar";

/** Renders the HTML fragments that the calendar data is made of. */
export function Reading({ fragments, className = "" }: { fragments: Fragment[]; className?: string }) {
  return (
    <div className={`reading ${className}`}>
      {fragments.map((fragment, index) =>
        fragment.kind === "html" ? (
          <div key={index} dangerouslySetInnerHTML={{ __html: fragment.value }} />
        ) : (
          <div key={index} className="whitespace-pre-line">
            {fragment.value}
          </div>
        ),
      )}
    </div>
  );
}

export function ReadingHtml({ html, className = "" }: { html: string; className?: string }) {
  return <div className={`reading ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
