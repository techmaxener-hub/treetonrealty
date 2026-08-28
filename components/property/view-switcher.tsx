"use client";

import { LayoutGrid, List, Map } from "lucide-react";

import { cn } from "@/lib/utils";

export type ViewMode = "grid" | "list" | "map";

const OPTIONS: { value: ViewMode; label: string; icon: typeof LayoutGrid }[] = [
  { value: "grid", label: "Grid", icon: LayoutGrid },
  { value: "list", label: "List", icon: List },
  { value: "map", label: "Full Map", icon: Map },
];

export function ViewSwitcher({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-slate-deep/5 p-1">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-300 ease-luxury",
            value === option.value
              ? "bg-gold-gradient text-slate-deep shadow-gold"
              : "text-slate-deep/60 hover:text-slate-deep"
          )}
        >
          <option.icon className="h-4 w-4" />
          <span className="hidden sm:inline">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
