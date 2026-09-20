"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { loadTables, type Tables } from "@/lib/calendar";

type Theme = "light" | "dark";
type FontChoice = "lort" | "algeti";

interface Settings {
  theme: Theme;
  font: FontChoice;
  readingSize: number;
}

interface AppContextValue extends Settings {
  tables: Tables | null;
  loading: boolean;
  error: string | null;
  setTheme: (theme: Theme) => void;
  setFont: (font: FontChoice) => void;
  setReadingSize: (size: number) => void;
}

const DEFAULTS: Settings = { theme: "light", font: "lort", readingSize: 17 };

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside <Providers>");
  return context;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [tables, setTables] = useState<Tables | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("calendar-settings");
      if (stored) setSettings({ ...DEFAULTS, ...JSON.parse(stored) });
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadTables()
      .then((value) => {
        if (!cancelled) setTables(value);
      })
      .catch(() => {
        if (!cancelled) setError("კალენდრის მონაცემები ვერ ჩაიტვირთა");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = settings.theme;
    document.body.dataset.font = settings.font;
    root.style.setProperty("--reading-size", `${settings.readingSize}px`);
    try {
      window.localStorage.setItem(
        "calendar-settings",
        JSON.stringify(settings),
      );
    } catch {
      /* ignore */
    }
  }, [settings]);

  const update = useCallback(
    <K extends keyof Settings>(key: K, value: Settings[K]) =>
      setSettings((current) => ({ ...current, [key]: value })),
    [],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      ...settings,
      tables,
      loading: tables === null && error === null,
      error,
      setTheme: (theme) => update("theme", theme),
      setFont: (font) => update("font", font),
      setReadingSize: (size) =>
        update("readingSize", Math.min(26, Math.max(14, size))),
    }),
    [settings, tables, error, update],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
