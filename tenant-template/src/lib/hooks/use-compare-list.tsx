"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "compare-list";
const MAX_COMPARE = 3;

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

// localStorage-backed, not context-backed: listing cards render in many
// independent trees (home, listings grid, locality page, advisor page)
// and don't share a common provider, so each instance just re-reads on
// mount and on the shared "compare-list-changed" event other instances
// fire after a write.
export function useCompareList() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(read());
    const handler = () => setIds(read());
    window.addEventListener("compare-list-changed", handler);
    return () => window.removeEventListener("compare-list-changed", handler);
  }, []);

  const toggle = useCallback((id: string) => {
    const current = read();
    const next = current.includes(id) ? current.filter((x) => x !== id) : current.length < MAX_COMPARE ? [...current, id] : current;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("compare-list-changed"));
    return next;
  }, []);

  const clear = useCallback(() => {
    window.localStorage.setItem(STORAGE_KEY, "[]");
    window.dispatchEvent(new Event("compare-list-changed"));
  }, []);

  return { ids, toggle, clear, max: MAX_COMPARE };
}
