"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useApp } from "./Providers";

const LINKS = [
  { href: "/", label: "დღე" },
  { href: "/year", label: "კალენდრული მაჩვენებლები" },
  { href: "/troparia", label: "ტროპარ-კონდაკები" },
  { href: "/saints", label: "სახელთა საძიებელი" },
  { href: "/glossary", label: "განმარტებანი" },
  { href: "/about", label: "კონტაქტი" },
];

const BASE_FONT = 14;
const MIN_FONT = 10.5;
const MENU_BUTTON_WIDTH = 48;

export function AppHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [navFont, setNavFont] = useState(BASE_FONT);
  const [collapsed, setCollapsed] = useState(false);
  const app = useApp();

  const barRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  /**
   * The links always stay on one line: first the font shrinks, and only when even the
   * smallest size does not fit do they move into the ☰ menu.
   */
  const measure = useCallback(() => {
    const bar = barRef.current;
    const nav = navRef.current;
    const logo = logoRef.current;
    const actions = actionsRef.current;
    if (!bar || !nav || !logo || !actions) return;

    nav.style.fontSize = `${BASE_FONT}px`;
    const available =
      bar.clientWidth -
      logo.offsetWidth -
      actions.offsetWidth -
      MENU_BUTTON_WIDTH -
      32;
    const natural = nav.scrollWidth;
    if (natural <= 0) return;

    if (natural <= available) {
      setNavFont(BASE_FONT);
      setCollapsed(false);
      return;
    }
    const scaled = (BASE_FONT * available) / natural;
    if (scaled >= MIN_FONT) {
      setNavFont(Math.floor(scaled * 10) / 10);
      setCollapsed(false);
    } else {
      setCollapsed(true);
    }
  }, []);

  useLayoutEffect(() => {
    measure();
    const observer = new ResizeObserver(measure);
    if (barRef.current) observer.observe(barRef.current);
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure).catch(() => undefined);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  useEffect(() => {
    if (!collapsed) setMenuOpen(false);
  }, [collapsed]);

  return (
    <header
      className="no-print sticky top-0 z-40 border-b font-[family-name:var(--font-algeti)] backdrop-blur-md"
      style={{
        borderColor: "var(--line)",
        backgroundColor: "color-mix(in srgb, var(--surface) 92%, transparent)",
      }}
    >
      <div
        ref={barRef}
        className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 sm:px-6"
      >
        <Link
          ref={logoRef}
          href="/"
          className="flex shrink-0 items-center gap-3"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon-192.png"
            alt="საეკლესიო კალენდარი"
            className="h-10 w-10 rounded-xl object-cover"
            style={{ border: "1px solid var(--line)" }}
          />
          <span className="whitespace-nowrap text-lg leading-none sm:text-xl">
            საეკლესიო კალენდარი
          </span>
        </Link>

        <nav
          ref={navRef}
          className="ml-auto flex items-center gap-1 whitespace-nowrap"
          style={
            collapsed
              ? {
                  position: "absolute",
                  left: -9999,
                  visibility: "hidden",
                  pointerEvents: "none",
                }
              : { fontSize: `${navFont}px` }
          }
          aria-hidden={collapsed}
        >
          {LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                tabIndex={collapsed ? -1 : undefined}
                className="rounded-lg px-2.5 py-2 transition-colors"
                style={{
                  backgroundColor: active ? "var(--surface-2)" : "transparent",
                  color: active ? "var(--ink)" : "var(--ink-soft)",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div
          ref={actionsRef}
          className={`flex shrink-0 items-center gap-2 ${collapsed ? "ml-auto" : "ml-2"}`}
        >
          <button
            type="button"
            aria-label="პარამეტრები"
            className="btn h-10 w-10 !p-0"
            onClick={() => setSettingsOpen((open) => !open)}
          >
            ⚙
          </button>
          {collapsed && (
            <button
              type="button"
              aria-label="მენიუ"
              aria-expanded={menuOpen}
              className="btn h-10 w-10 !p-0"
              onClick={() => setMenuOpen((open) => !open)}
            >
              ☰
            </button>
          )}
        </div>
      </div>

      {collapsed && menuOpen && (
        <nav
          className="border-t px-4 pb-4"
          style={{ borderColor: "var(--line)" }}
        >
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-lg px-3 py-3"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}

      {settingsOpen && (
        <div
          className="border-t px-4 py-4 sm:px-6"
          style={{ borderColor: "var(--line)" }}
        >
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: "var(--ink-soft)" }}>
                თემა
              </span>
              <button
                className="btn !py-1.5"
                onClick={() =>
                  app.setTheme(app.theme === "dark" ? "light" : "dark")
                }
              >
                {app.theme === "dark" ? "ბნელი" : "ღია"}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: "var(--ink-soft)" }}>
                ფონტი
              </span>
              <button
                className="btn !py-1.5"
                onClick={() => app.setFont("lort")}
                disabled={app.font === "lort"}
              >
                ფონტი 1
              </button>
              <button
                className="btn !py-1.5"
                onClick={() => app.setFont("algeti")}
                disabled={app.font === "algeti"}
              >
                ფონტი 2
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: "var(--ink-soft)" }}>
                ზომა
              </span>
              <button
                className="btn !py-1.5"
                onClick={() => app.setReadingSize(app.readingSize - 1)}
              >
                A−
              </button>
              <button
                className="btn !py-1.5"
                onClick={() => app.setReadingSize(app.readingSize + 1)}
              >
                A+
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
