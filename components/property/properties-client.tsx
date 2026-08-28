"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { SearchX } from "lucide-react";

import { FilterDrawer } from "@/components/property/filter-drawer";
import { ListingCard } from "@/components/property/listing-card";
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
import {
  DEFAULT_SEARCH_FILTERS,
  serializeSearchFilters,
  toListingFilters,
  type ListingSearchFilters,
} from "@/lib/property-filters";
import { getListings, type ListingCard as ListingCardData, type ListingPage } from "@/lib/queries/listings";
import { cn } from "@/lib/utils";

const PropertiesMap = dynamic(() => import("@/components/property/properties-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-alabaster-dark text-sm text-muted-foreground">
      Loading map&hellip;
    </div>
  ),
});

const BHK_QUICK_OPTIONS: { label: string; values: number[] }[] = [
  { label: "2 BHK", values: [2] },
  { label: "3 BHK", values: [3] },
  { label: "4 BHK", values: [4] },
  { label: "5+ BHK", values: [5, 6, 7, 8, 9, 10] },
];

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
      <SearchX className="h-10 w-10 text-muted-foreground" />
      <p className="mt-4 font-display text-lg font-semibold text-slate-deep">
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

interface PropertiesClientProps {
  filters: ListingSearchFilters;
  localities: string[];
  initialItems: ListingCardData[];
  initialTotalCount: number;
  initialNextCursor: string | null;
}

export function PropertiesClient({
  filters,
  localities,
  initialItems,
  initialTotalCount,
  initialNextCursor,
}: PropertiesClientProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = React.useState<ViewMode>("grid");
  const [hoveredSlug, setHoveredSlug] = React.useState<string | null>(null);

  const filtersKey = React.useMemo(() => serializeSearchFilters(filters), [filters]);

  const query = useInfiniteQuery<ListingPage>({
    queryKey: ["listings", filtersKey],
    queryFn: ({ pageParam }) => getListings(toListingFilters(filters), pageParam as string | null),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialData: {
      pages: [{ items: initialItems, totalCount: initialTotalCount, nextCursor: initialNextCursor }],
      pageParams: [null],
    },
  });

  const items = query.data?.pages.flatMap((p) => p.items) ?? [];
  const totalCount = query.data?.pages[0]?.totalCount ?? initialTotalCount;

  function updateFilters(next: ListingSearchFilters) {
    const qs = serializeSearchFilters(next);
    router.push(qs ? `/properties?${qs}` : "/properties");
  }

  function toggleBhk(values: number[]) {
    const isActive = values.every((v) => filters.bhk.includes(v));
    updateFilters({ ...filters, bhk: isActive ? [] : values });
  }

  return (
    <div className="flex min-h-screen flex-col bg-alabaster pt-20">
      <div className="sticky top-20 z-30 border-b border-border bg-white/95 backdrop-blur-lg">
        <div className="container flex flex-wrap items-center gap-3 py-4">
          <Select
            value={filters.localities[0] ?? "all"}
            onValueChange={(v) => updateFilters({ ...filters, localities: v === "all" ? [] : [v] })}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Localities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Localities</SelectItem>
              {localities.map((locality) => (
                <SelectItem key={locality} value={locality}>
                  {locality}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.propertyTypes[0] ?? "all"}
            onValueChange={(v) =>
              updateFilters({
                ...filters,
                propertyTypes: v === "all" ? [] : [v as ListingSearchFilters["propertyTypes"][number]],
              })
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {(["Apartment", "Villa", "Plot", "Commercial", "Office", "Shop"] as const).map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-1.5">
            {BHK_QUICK_OPTIONS.map((option) => (
              <button
                key={option.label}
                onClick={() => toggleBhk(option.values)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  option.values.every((v) => filters.bhk.includes(v))
                    ? "border-transparent bg-gold-gradient text-slate-deep shadow-gold"
                    : "border-border text-slate-deep/70 hover:border-gold-600/50"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <FilterDrawer
            filters={filters}
            onChange={updateFilters}
            resultCount={totalCount}
            localities={localities}
          />

          <div className="ml-auto flex items-center gap-4">
            <p className="hidden text-sm text-muted-foreground md:block">
              {totalCount} {totalCount === 1 ? "Property" : "Properties"}
            </p>
            <ViewSwitcher value={viewMode} onChange={setViewMode} />
          </div>
        </div>
      </div>

      {viewMode === "map" ? (
        <div className="relative" style={{ height: "calc(100vh - 152px)" }}>
          <PropertiesMap listings={items} hoveredSlug={hoveredSlug} />
        </div>
      ) : (
        <div className="container flex-1 py-8 lg:grid lg:grid-cols-2 lg:gap-8">
          <div className="hidden lg:block">
            <div className="sticky top-[152px] h-[calc(100vh-184px)] overflow-hidden rounded-2xl border border-border">
              <PropertiesMap listings={items} hoveredSlug={hoveredSlug} />
            </div>
          </div>

          <div className="lg:max-h-[calc(100vh-184px)] lg:overflow-y-auto lg:pr-2">
            {items.length === 0 ? (
              <EmptyState onClear={() => updateFilters(DEFAULT_SEARCH_FILTERS)} />
            ) : (
              <>
                {viewMode === "grid" ? (
                  <div className="grid gap-6 sm:grid-cols-2">
                    {items.map((listing, i) => (
                      <div
                        key={listing.id}
                        onMouseEnter={() => setHoveredSlug(listing.slug)}
                        onMouseLeave={() => setHoveredSlug(null)}
                      >
                        <ListingCard listing={listing} index={i} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-5">
                    {items.map((listing) => (
                      <PropertyListItem key={listing.id} listing={listing} onHover={setHoveredSlug} />
                    ))}
                  </div>
                )}

                {query.hasNextPage && (
                  <div className="mt-8 flex justify-center">
                    <Button
                      variant="outline"
                      onClick={() => query.fetchNextPage()}
                      disabled={query.isFetchingNextPage}
                    >
                      {query.isFetchingNextPage ? "Loading…" : "Load More"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
