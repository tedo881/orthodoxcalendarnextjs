"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useApp } from "./Providers";

export function SaintsScreen() {
  const { tables, loading } = useApp();
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);

  const results = useMemo(() => {
    if (!tables) return [];
    const needle = deferred.trim().toLocaleUpperCase("ka");
    if (!needle) return tables.saints;
    return tables.saints.filter((saint) => saint.name.toLocaleUpperCase("ka").includes(needle));
  }, [tables, deferred]);

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <h1 className="font-[family-name:var(--font-ucnobi)] text-2xl">სახელთა საძიებელი</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--ink-soft)" }}>
          იპოვე, როდის არის შენი ანგელოზის დღე.
        </p>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="მოძებნე..."
          className="mt-4 w-full rounded-xl px-4 py-3 outline-none"
          style={{ backgroundColor: "var(--surface-2)", border: "1px solid var(--line)", color: "var(--ink)" }}
        />
      </div>

      {loading ? (
        <div className="card h-96 animate-pulse" />
      ) : (
        <>
          <p className="text-sm" style={{ color: "var(--ink-soft)" }}>{results.length} ჩანაწერი</p>
          <ul className="card divide-y" style={{ borderColor: "var(--line)" }}>
            {results.slice(0, 400).map((saint) => (
              <li key={`${saint.name}|${saint.date}`} className="px-5 py-3" style={{ borderColor: "var(--line)" }}>
                <span className="font-[family-name:var(--font-ucnobi)]">{saint.name}</span>{" "}
                <span style={{ color: "var(--ink-soft)" }}>ხსენება {saint.date} (ძვ. სტ.)</span>
              </li>
            ))}
          </ul>
          {results.length > 400 && (
            <p className="text-center text-sm" style={{ color: "var(--ink-soft)" }}>
              ნაჩვენებია პირველი 400 — დააზუსტე ძიება.
            </p>
          )}
        </>
      )}
    </div>
  );
}
