"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { PROPERTY_TYPE_LABELS } from "@/lib/constants";
import type { ListingOfferType, PropertyTypeEnum } from "@/lib/types/database";
import type { LocalityLite } from "@/lib/data/localities";

const ALL = "__all__";

// The centerpiece of the hero -- search starts here, not on a separate
// page. Builds the same query params /listings already filters on
// (see listing-filters.tsx), so this and the filter bar stay two
// entry points into one search, not two different searches.
export function HeroSearchWidget({ localities }: { localities: LocalityLite[] }) {
  const router = useRouter();
  const [offer, setOffer] = useState<ListingOfferType>("sale");
  const [search, setSearch] = useState("");
  const [locality, setLocality] = useState(ALL);
  const [propertyType, setPropertyType] = useState(ALL);
  const [bhk, setBhk] = useState(ALL);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  function handleSearch() {
    const params = new URLSearchParams();
    params.set("offer", offer);
    if (search.trim()) params.set("q", search.trim());
    if (locality !== ALL) params.set("locality", locality);
    if (propertyType !== ALL) params.set("type", propertyType);
    if (bhk !== ALL) params.set("bhk", bhk);
    if (priceMin) params.set("priceMin", priceMin);
    if (priceMax) params.set("priceMax", priceMax);
    router.push(`/listings?${params.toString()}`);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex gap-1">
        {(["sale", "rent"] as ListingOfferType[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setOffer(v)}
            className={cn(
              "rounded-t-md px-5 py-2.5 text-sm font-medium transition-colors",
              offer === v ? "bg-card text-foreground" : "bg-foreground/10 text-background hover:bg-foreground/20",
            )}
          >
            {v === "sale" ? "Buy" : "Rent"}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 rounded-b-md rounded-tr-md bg-card p-3 shadow-xl sm:flex-row sm:items-center">
        <Input
          type="search"
          placeholder="Search by project or listing name"
          className="border-0 shadow-none sm:min-w-40 sm:flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
        />

        <div className="hidden h-6 w-px bg-border sm:block" />

        <Select value={locality} onValueChange={setLocality}>
          <SelectTrigger className="border-0 shadow-none sm:w-48">
            <SelectValue placeholder="Locality" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Any locality</SelectItem>
            {localities.map((l) => (
              <SelectItem key={l.id} value={l.id}>
                {l.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="hidden h-6 w-px bg-border sm:block" />

        <Select value={propertyType} onValueChange={setPropertyType}>
          <SelectTrigger className="border-0 shadow-none sm:w-36">
            <SelectValue placeholder="Property type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Any type</SelectItem>
            {(Object.entries(PROPERTY_TYPE_LABELS) as [PropertyTypeEnum, string][]).map(([v, l]) => (
              <SelectItem key={v} value={v}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="hidden h-6 w-px bg-border sm:block" />

        <Select value={bhk} onValueChange={setBhk}>
          <SelectTrigger className="border-0 shadow-none sm:w-28">
            <SelectValue placeholder="BHK" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Any BHK</SelectItem>
            {[1, 2, 3, 4, 5].map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n} BHK
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="hidden h-6 w-px bg-border sm:block" />

        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Price min"
            className="border-0 shadow-none sm:w-24"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Price max"
            className="border-0 shadow-none sm:w-24"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
          />
        </div>

        <button
          type="button"
          onClick={handleSearch}
          className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90 sm:ml-auto"
        >
          <Search className="h-4 w-4" />
          Search
        </button>
      </div>
    </div>
  );
}
