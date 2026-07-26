"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { SearchX } from "lucide-react";

import { FilterDrawer } from "@/components/property/filter-drawer";
import { PropertyCard } from "@/components/property/property-card";
import { PropertyListItem } from "@/components/property/property-list-item";
import { ViewSwitcher, type ViewMode } from "@/components/property/view-switcher";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CORRIDORS, PROPERTIES, type PropertyTypology } from "@/lib/mock-data";
import { DEFAULT_FILTERS, filterProperties, type PropertyFilters } from "@/lib/property-filters";
import { cn } from "@/lib/utils";

const PropertiesMap = dynamic(() => import("@/components/property/properties-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-ivory-dark text-sm text-muted-foreground">
      Loading map&hellip;
    </div>
  ),
});

const TYPOLOGIES: PropertyTypology[] = [
  "3BHK Sky Villa",
  "4BHK Sky Villa",
  "5BHK Sky Villa",
  "Luxury Penthouse",
  "Duplex",
  "Commercial Office",
  "Plot / Land Parcel",
];

const BHK_OPTIONS = ["2", "3", "4", "5+"];

function buildInitialFilters(searchParams: URLSearchParams): PropertyFilters {
  const corridor = searchParams.get("corridor") ?? "all";
  const typologyParam = searchParams.get("type") ?? "all";
  const bhk = searchParams.get("bhk");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  return {
    ...DEFAULT_FILTERS,
    corridor,
    typology: (TYPOLOGIES as string[]).includes(typologyParam)
      ? (typologyParam as PropertyTypology)
      : "all",
    bhk: bhk ?? null,
    priceRange: [
      minPrice ? Number(minPrice) : DEFAULT_FILTERS.priceRange[0],
      maxPrice ? Number(maxPrice) : DEFAULT_FILTERS.priceRange[1],
    ],
  };
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
      <SearchX className="h-10 w-10 text-muted-foreground" />
      <p className="mt-4 font-display text-lg font-semibold text-charcoal">
        No Properties Match Your Filters
      </p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        Try widening your budget range or clearing a few filters.
      </p>
      <Button variant="outline" className="mt-5" onClick={onClear}>
        Clear All Filters
      </Button>
    </div>
  );
}

export function PropertiesClient() {
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = React.useState<ViewMode>("grid");
  const [hoveredSlug, setHoveredSlug] = React.useState<string | null>(null);
  const [filters, setFilters] = React.useState<PropertyFilters>(() =>
    buildInitialFilters(searchParams)
  );

  const filtered = React.useMemo(() => filterProperties(PROPERTIES, filters), [filters]);

  return (
    <div className="flex min-h-screen flex-col bg-ivory pt-20">
      <div className="sticky top-20 z-30 border-b border-border bg-white/95 backdrop-blur-lg">
        <div className="container flex flex-wrap items-center gap-3 py-4">
          <Select
            value={filters.corridor}
            onValueChange={(v) => setFilters((f) => ({ ...f, corridor: v }))}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Corridors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Corridors</SelectItem>
              {CORRIDORS.map((c) => (
                <SelectItem key={c.slug} value={c.slug}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.typology}
            onValueChange={(v) =>
              setFilters((f) => ({ ...f, typology: v as PropertyFilters["typology"] }))
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {TYPOLOGIES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-1.5">
            {BHK_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() =>
                  setFilters((f) => ({ ...f, bhk: f.bhk === option ? null : option }))
                }
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  filters.bhk === option
                    ? "border-transparent bg-champagne-gradient text-charcoal shadow-gold"
                    : "border-border text-charcoal/70 hover:border-champagne/50"
                )}
              >
                {option} BHK
              </button>
            ))}
          </div>

          <FilterDrawer filters={filters} onChange={setFilters} resultCount={filtered.length} />

          <div className="ml-auto flex items-center gap-4">
            <p className="hidden text-sm text-muted-foreground md:block">
              {filtered.length} {filtered.length === 1 ? "Property" : "Properties"}
            </p>
            <ViewSwitcher value={viewMode} onChange={setViewMode} />
          </div>
        </div>
      </div>

      {viewMode === "map" ? (
        <div className="relative" style={{ height: "calc(100vh - 152px)" }}>
          <PropertiesMap properties={filtered} hoveredSlug={hoveredSlug} />
        </div>
      ) : (
        <div className="container flex-1 py-8 lg:grid lg:grid-cols-2 lg:gap-8">
          <div className="hidden lg:block">
            <div className="sticky top-[152px] h-[calc(100vh-184px)] overflow-hidden rounded-2xl border border-border">
              <PropertiesMap properties={filtered} hoveredSlug={hoveredSlug} />
            </div>
          </div>

          <div className="lg:max-h-[calc(100vh-184px)] lg:overflow-y-auto lg:pr-2">
            {filtered.length === 0 ? (
              <EmptyState onClear={() => setFilters(DEFAULT_FILTERS)} />
            ) : viewMode === "grid" ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {filtered.map((property, i) => (
                  <div
                    key={property.id}
                    onMouseEnter={() => setHoveredSlug(property.slug)}
                    onMouseLeave={() => setHoveredSlug(null)}
                  >
                    <PropertyCard property={property} index={i} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-5">
                {filtered.map((property) => (
                  <PropertyListItem
                    key={property.id}
                    property={property}
                    onHover={setHoveredSlug}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
