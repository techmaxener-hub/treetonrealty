"use client";

import { useLanguage } from "@/lib/hooks/use-language";
import { cn } from "@/lib/utils";

const OPTIONS: { value: "en" | "hi" | "gu"; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "hi", label: "हि" },
  { value: "gu", label: "ગુ" },
];

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center rounded-full border p-0.5 text-xs">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setLanguage(opt.value)}
          className={cn(
            "rounded-full px-2 py-1 font-medium transition-colors",
            language === opt.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
          aria-pressed={language === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
