"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { LocalizedText } from "@/lib/types/database";

type Language = "en" | "hi" | "gu";

const LanguageContext = createContext<{ language: Language; setLanguage: (lang: Language) => void } | null>(null);

const STORAGE_KEY = "site-language";

export function LanguageProvider({ defaultLanguage, children }: { defaultLanguage: Language; children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Language | null;
    if (stored) setLanguageState(stored);
  }, []);

  function setLanguage(lang: Language) {
    setLanguageState(lang);
    window.localStorage.setItem(STORAGE_KEY, lang);
  }

  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

// Reads whatever language variants a jsonb field has and picks the
// current one, falling back to English then whatever's present -- so a
// listing missing a Hindi translation still renders something instead
// of a blank field.
export function useLocalizedText(value: LocalizedText | null | undefined) {
  const { language } = useLanguage();
  if (!value) return "";
  return value[language] ?? value.en ?? Object.values(value)[0] ?? "";
}
