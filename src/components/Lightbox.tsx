"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

/** Full-screen image viewer: Esc / click outside closes, ← → switch between images. */
export function Lightbox({
  images,
  index,
  onChange,
  onClose,
}: {
  images: string[];
  index: number;
  onChange: (index: number) => void;
  onClose: () => void;
}) {
  const count = images.length;
  const [mounted, setMounted] = useState(false);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  useEffect(() => setMounted(true), []);
  const prev = useCallback(
    () => onChange((index - 1 + count) % count),
    [index, count, onChange],
  );
  const next = useCallback(
    () => onChange((index + 1) % count),
    [index, count, onChange],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (count > 1 && event.key === "ArrowLeft") prev();
      if (count > 1 && event.key === "ArrowRight") next();
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [count, prev, next, onClose]);

  if (count === 0 || !mounted) return null;

  // Rendered into <body>: a parent with backdrop-filter (the cards) would otherwise
  // turn "position: fixed" into a box inside that card instead of the whole screen.
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex h-dvh w-screen items-center justify-center"
      style={{ backgroundColor: "rgb(0 0 0 / 0.92)" }}
      onClick={onClose}
    >
      {loadedSrc !== images[index] && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner light />
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={images[index]}
        src={images[index]}
        alt=""
        onLoad={() => setLoadedSrc(images[index])}
        className="h-dvh w-screen object-contain transition-opacity duration-300"
        style={{ opacity: loadedSrc === images[index] ? 1 : 0 }}
      />

      <button
        type="button"
        aria-label="დახურვა"
        onClick={onClose}
        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full text-2xl text-white"
        style={{ backgroundColor: "rgb(255 255 255 / 0.15)" }}
      >
        ✕
      </button>

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="წინა"
            onClick={(event) => {
              event.stopPropagation();
              prev();
            }}
            className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-3xl text-white"
            style={{ backgroundColor: "rgb(255 255 255 / 0.15)" }}
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="შემდეგი"
            onClick={(event) => {
              event.stopPropagation();
              next();
            }}
            className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-3xl text-white"
            style={{ backgroundColor: "rgb(255 255 255 / 0.15)" }}
          >
            ›
          </button>
          <span
            className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-sm text-white"
            style={{ backgroundColor: "rgb(255 255 255 / 0.15)" }}
          >
            {index + 1} / {count}
          </span>
        </>
      )}
    </div>,
    document.body,
  );
}

/** Small loading indicator used for pictures. */
export function Spinner({ light = false }: { light?: boolean }) {
  return (
    <span
      role="status"
      aria-label="იტვირთება"
      className="block h-8 w-8 animate-spin rounded-full border-[3px]"
      style={{
        borderColor: light
          ? "rgb(255 255 255 / 0.25)"
          : "color-mix(in srgb, var(--accent) 25%, transparent)",
        borderTopColor: light ? "#fff" : "var(--accent)",
      }}
    />
  );
}
