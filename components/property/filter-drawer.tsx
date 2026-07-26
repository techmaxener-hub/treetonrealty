"use client";

import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { ALL_AMENITIES, DEVELOPERS, formatIndianPrice } from "@/lib/mock-data";
import {
  countActiveFilters,
  DEFAULT_FILTERS,
  type PossessionFilter,
  type PropertyFilters,
} from "@/lib/property-filters";
import { cn } from "@/lib/utils";

const POSSESSION_OPTIONS: { value: PossessionFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "ready", label: "Ready" },
  { value: "2026", label: "2026" },
  { value: "2027", label: "2027" },
  { value: "2028", label: "2028" },
];

interface FilterDrawerProps {
  filters: PropertyFilters;
  onChange: (filters: PropertyFilters) => void;
  resultCount: number;
}

export function FilterDrawer({ filters, onChange, resultCount }: FilterDrawerProps) {
  const activeCount = countActiveFilters(filters);

  function update<K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  function toggleAmenity(amenity: string) {
    const next = filters.amenities.includes(amenity)
      ? filters.amenities.filter((a) => a !== amenity)
      : [...filters.amenities, amenity];
    update("amenities", next);
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="default" className="relative">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-champagne-gradient px-1.5 text-xs font-bold text-charcoal">
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
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Checkbox
                id="gujrera-only"
                checked={filters.gujreraVerifiedOnly}
                onCheckedChange={(checked) => update("gujreraVerifiedOnly", checked === true)}
              />
              <Label htmlFor="gujrera-only">GUJRERA Verified Only</Label>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Possession
            </p>
            <div className="flex flex-wrap gap-2">
              {POSSESSION_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => update("possession", option.value)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                    filters.possession === option.value
                      ? "border-transparent bg-champagne-gradient text-charcoal shadow-gold"
                      : "border-border text-charcoal/70 hover:border-champagne/50"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Developer
            </p>
            <Select
              value={filters.developer}
              onValueChange={(v) => update("developer", v as PropertyFilters["developer"])}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Developers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Developers</SelectItem>
                {DEVELOPERS.map((dev) => (
                  <SelectItem key={dev} value={dev}>
                    {dev}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Budget
              </p>
              <span className="font-display text-sm font-semibold text-charcoal">
                {formatIndianPrice(filters.priceRange[0])} &ndash;{" "}
                {filters.priceRange[1] >= 15 ? "₹15+ Cr" : formatIndianPrice(filters.priceRange[1])}
              </span>
            </div>
            <Slider
              min={0.75}
              max={15}
              step={0.25}
              value={filters.priceRange}
              onValueChange={(v) => update("priceRange", [v[0], v[1]])}
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Amenities
            </p>
            <div className="grid max-h-64 grid-cols-1 gap-2.5 overflow-y-auto pr-1 sm:grid-cols-2">
              {ALL_AMENITIES.map((amenity) => (
                <div key={amenity} className="flex items-center gap-2">
                  <Checkbox
                    id={`amenity-${amenity}`}
                    checked={filters.amenities.includes(amenity)}
                    onCheckedChange={() => toggleAmenity(amenity)}
                  />
                  <Label htmlFor={`amenity-${amenity}`} className="font-normal">
                    {amenity}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 mt-6 space-y-3 border-t border-border bg-white pt-4">
          <p className="text-sm text-muted-foreground">{resultCount} properties match</p>
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => onChange(DEFAULT_FILTERS)}>
              Clear All
            </Button>
            <SheetClose asChild>
              <Button variant="gold" className="flex-1">
                Show Results
              </Button>
            </SheetClose>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
