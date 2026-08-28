"use client";

import { Ruler } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AREA_UNIT_LABELS, type AreaUnit } from "@/lib/area";
import { useUnitStore } from "@/lib/stores/unit-store";
import { cn } from "@/lib/utils";

const UNIT_OPTIONS = Object.keys(AREA_UNIT_LABELS) as AreaUnit[];

export function AreaUnitSwitcher({ className }: { className?: string }) {
  const unit = useUnitStore((state) => state.unit);
  const setUnit = useUnitStore((state) => state.setUnit);

  return (
    <Select value={unit} onValueChange={(value) => setUnit(value as AreaUnit)}>
      <SelectTrigger
        aria-label="Area unit"
        className={cn(
          "h-auto w-auto gap-1.5 rounded-full border-gold-600/40 bg-transparent px-3 py-1.5 text-xs font-medium text-slate-deep/70 hover:bg-gold-600/10",
          className
        )}
      >
        <Ruler className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {UNIT_OPTIONS.map((option) => (
          <SelectItem key={option} value={option}>
            {AREA_UNIT_LABELS[option]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
