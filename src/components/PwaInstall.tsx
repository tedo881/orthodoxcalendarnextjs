"use client";

import { useEffect, useState } from "react";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "pwa-install-dismissed";

/**
 * Registers the service worker and offers installing the site as an app:
 * Chrome / Edge / Android show a button, iOS Safari gets a short instruction.
 */
export function PwaInstall() {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    const dismissed = (() => {
      try {
        return window.localStorage.getItem(DISMISSED_KEY) === "1";
      } catch {
        return false;
      }
    })();

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (dismissed || standalone) return;

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
      setHidden(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // iOS has no install prompt: show how to do it by hand
    const ua = window.navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(ua) && /Safari/.test(ua) && !/CriOS|FxiOS/.test(ua)) {
      setIosHint(true);
      setHidden(false);
    }

    const onInstalled = () => setHidden(true);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const close = () => {
    setHidden(true);
    try {
      window.localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const install = async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    await promptEvent.userChoice;
    setPromptEvent(null);
    setHidden(true);
  };

  if (hidden || (!promptEvent && !iosHint)) return null;

  return (
    <div className="no-print fixed inset-x-3 bottom-3 z-50 mx-auto max-w-md">
      <div className="card flex items-center gap-3 p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon-192.png" alt="" className="h-10 w-10 rounded-xl" style={{ border: "1px solid var(--line)" }} />
        <div className="min-w-0 flex-1">
          <p className="font-[family-name:var(--font-ucnobi)] leading-tight">კალენდრის დაყენება</p>
          <p className="truncate text-sm" style={{ color: "var(--ink-soft)" }}>
            {iosHint ? "გაზიარება → „Add to Home Screen“" : "იმუშავებს ინტერნეტის გარეშეც"}
          </p>
        </div>
        {!iosHint && (
          <button type="button" className="btn btn-accent shrink-0" onClick={install}>
            დაყენება
          </button>
        )}
        <button type="button" aria-label="დახურვა" className="btn h-9 w-9 shrink-0 !p-0" onClick={close}>
          ✕
        </button>
      </div>
    </div>
  );
}
