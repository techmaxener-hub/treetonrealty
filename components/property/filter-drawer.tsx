"use client";

import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatINR } from "@/lib/currency";
import {
  countActiveFilters,
  DEFAULT_SEARCH_FILTERS,
  type ListingSearchFilters,
} from "@/lib/property-filters";
import type { FacingDirection, FurnishingStatus, PossessionStatus } from "@/lib/queries/listings";
import { cn } from "@/lib/utils";

const MIN_BUDGET = 1_000_000; // 10 Lakh
const MAX_BUDGET = 150_000_000; // 15 Cr

const FURNISHING_OPTIONS: FurnishingStatus[] = ["Unfurnished", "Semi-Furnished", "Fully-Furnished"];
const POSSESSION_OPTIONS: PossessionStatus[] = ["Ready", "Under Construction"];
const FACING_OPTIONS: FacingDirection[] = ["N", "S", "E", "W", "NE", "NW", "SE", "SW"];

interface FilterDrawerProps {
  filters: ListingSearchFilters;
  onChange: (filters: ListingSearchFilters) => void;
  resultCount: number;
  localities: string[];
}

export function FilterDrawer({ filters, onChange, resultCount, localities }: FilterDrawerProps) {
  const activeCount = countActiveFilters(filters);

  function update<K extends keyof ListingSearchFilters>(key: K, value: ListingSearchFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  function toggleInList<T extends string>(key: keyof ListingSearchFilters, value: T) {
    const list = filters[key] as T[];
    const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
    update(key, next as ListingSearchFilters[typeof key]);
  }

  const priceRange: [number, number] = [filters.minPrice ?? MIN_BUDGET, filters.maxPrice ?? MAX_BUDGET];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="default" className="relative">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-gradient px-1.5 text-xs font-bold text-slate-deep">
              {activeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Refine Results</SheetTitle>
        </SheetHeader>

        <div className="mt-6 flex-1 space-y-8">
          <div className="flex items-center gap-2">
            <Checkbox
              id="rera-only"
              checked={filters.reraVerifiedOnly}
              onCheckedChange={(checked) => update("reraVerifiedOnly", checked === true)}
            />
            <Label htmlFor="rera-only">RERA Verified Only</Label>
          </div>

          {localities.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Locality
              </p>
              <div className="grid max-h-48 grid-cols-1 gap-2.5 overflow-y-auto pr-1 sm:grid-cols-2">
                {localities.map((locality) => (
                  <div key={locality} className="flex items-center gap-2">
                    <Checkbox
                      id={`locality-${locality}`}
                      checked={filters.localities.includes(locality)}
                      onCheckedChange={() => toggleInList("localities", locality)}
                    />
                    <Label htmlFor={`locality-${locality}`} className="font-normal">
                      {locality}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Budget</p>
              <span className="font-display text-sm font-semibold text-slate-deep">
                {formatINR(priceRange[0])} &ndash; {formatINR(priceRange[1])}
              </span>
            </div>
            <Slider
              min={MIN_BUDGET}
              max={MAX_BUDGET}
              step={500_000}
              value={priceRange}
              onValueChange={(v) => onChange({ ...filters, minPrice: v[0], maxPrice: v[1] })}
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Furnishing
            </p>
            <div className="flex flex-wrap gap-2">
              {FURNISHING_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => toggleInList("furnishing", option)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                    filters.furnishing.includes(option)
                      ? "border-transparent bg-gold-gradient text-slate-deep shadow-gold"
                      : "border-border text-slate-deep/70 hover:border-gold-600/50"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Possession
            </p>
            <div className="flex flex-wrap gap-2">
              {POSSESSION_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => toggleInList("possessionStatus", option)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                    filters.possessionStatus.includes(option)
                      ? "border-transparent bg-gold-gradient text-slate-deep shadow-gold"
                      : "border-border text-slate-deep/70 hover:border-gold-600/50"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Facing Direction
            </p>
            <div className="flex flex-wrap gap-2">
              {FACING_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => toggleInList("facingDirection", option)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                    filters.facingDirection.includes(option)
                      ? "border-transparent bg-gold-gradient text-slate-deep shadow-gold"
                      : "border-border text-slate-deep/70 hover:border-gold-600/50"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 mt-6 space-y-3 border-t border-border bg-white pt-4">
          <p className="text-sm text-muted-foreground">{resultCount} properties match</p>
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => onChange(DEFAULT_SEARCH_FILTERS)}>
              Clear All
            </Button>
            <SheetClose asChild>
              <Button variant="primary" className="flex-1">
                Show Results
              </Button>
            </SheetClose>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
