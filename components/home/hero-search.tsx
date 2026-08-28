"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { formatINR } from "@/lib/currency";
import { serializeSearchFilters, type ListingSearchFilters, DEFAULT_SEARCH_FILTERS } from "@/lib/property-filters";
import type { PropertyType } from "@/lib/queries/listings";
import { cn } from "@/lib/utils";

const PROPERTY_TYPES: PropertyType[] = ["Apartment", "Villa", "Plot", "Commercial", "Office", "Shop"];
const BHK_OPTIONS = [2, 3, 4, 5];
const MIN_BUDGET = 1_000_000; // 10 Lakh
const MAX_BUDGET = 150_000_000; // 15 Cr

export function HeroSearch({ localities }: { localities: string[] }) {
  const router = useRouter();
  const [locality, setLocality] = React.useState<string>("all");
  const [propertyType, setPropertyType] = React.useState<string>("all");
  const [budget, setBudget] = React.useState<[number, number]>([MIN_BUDGET, MAX_BUDGET]);
  const [bhk, setBhk] = React.useState<number | null>(null);

  function handleSearch() {
    const filters: ListingSearchFilters = {
      ...DEFAULT_SEARCH_FILTERS,
      localities: locality === "all" ? [] : [locality],
      propertyTypes: propertyType === "all" ? [] : [propertyType as PropertyType],
      bhk: bhk ? (bhk === 5 ? [5, 6, 7, 8, 9, 10] : [bhk]) : [],
      minPrice: budget[0] === MIN_BUDGET ? null : budget[0],
      maxPrice: budget[1] === MAX_BUDGET ? null : budget[1],
    };
    const qs = serializeSearchFilters(filters);
    router.push(qs ? `/properties?${qs}` : "/properties");
  }

  return (
    <div className="w-full max-w-4xl rounded-2xl bg-white/90 p-6 shadow-elevate-lg backdrop-blur-xl sm:p-8">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Locality
          </label>
          <Select value={locality} onValueChange={setLocality}>
            <SelectTrigger>
              <SelectValue placeholder="All Localities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Localities</SelectItem>
              {localities.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Property Type
          </label>
          <Select value={propertyType} onValueChange={setPropertyType}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {PROPERTY_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Budget
          </label>
          <span className="font-display text-sm font-semibold text-slate-deep">
            {formatINR(budget[0])} &ndash; {formatINR(budget[1])}
          </span>
        </div>
        <Slider
          min={MIN_BUDGET}
          max={MAX_BUDGET}
          step={500_000}
          value={budget}
          onValueChange={(v) => setBudget([v[0], v[1]])}
        />
      </div>

      <div className="mt-6">
        <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
          BHK
        </label>
        <div className="flex flex-wrap gap-2">
          {BHK_OPTIONS.map((option) => (
            <button
              key={option}
              onClick={() => setBhk(bhk === option ? null : option)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                bhk === option
                  ? "border-transparent bg-gold-gradient text-slate-deep shadow-gold"
                  : "border-border text-slate-deep/70 hover:border-gold-600/50"
              )}
            >
              {option}
              {option === 5 ? "+" : ""} BHK
            </button>
          ))}
        </div>
      </div>

      <Button onClick={handleSearch} variant="primary" size="lg" className="mt-7 w-full sm:w-auto">
        Search Properties
      </Button>
    </div>
  );
}
