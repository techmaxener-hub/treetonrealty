"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PROPERTY_TYPE_LABELS, SEGMENT_LABELS } from "@/lib/constants";
import type { PropertyTypeEnum, ListingSegment, ListingOfferType } from "@/lib/types/database";
import type { LocalityLite } from "@/lib/data/localities";

const ALL = "__all__";

export function ListingFilters({ localities }: { localities: LocalityLite[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === ALL) params.delete(key);
    else params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  }

  const offer = searchParams.get("offer") ?? ALL;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        type="search"
        placeholder="Search by project or listing name"
        className="w-full sm:w-56"
        defaultValue={searchParams.get("q") ?? ""}
        onBlur={(e) => updateParam("q", e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") updateParam("q", e.currentTarget.value);
        }}
      />

      <div className="flex rounded-full border border-border p-0.5">
        {(["__all__", "sale", "rent"] as (ListingOfferType | typeof ALL)[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => updateParam("offer", v)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              offer === v ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {v === "__all__" ? "All" : v === "sale" ? "Buy" : "Rent"}
          </button>
        ))}
      </div>

      <Select value={searchParams.get("locality") ?? ALL} onValueChange={(v) => updateParam("locality", v)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Locality" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All localities</SelectItem>
          {localities.map((l) => (
            <SelectItem key={l.id} value={l.id}>
              {l.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={searchParams.get("type") ?? ALL} onValueChange={(v) => updateParam("type", v)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Property type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All types</SelectItem>
          {(Object.entries(PROPERTY_TYPE_LABELS) as [PropertyTypeEnum, string][]).map(([v, l]) => (
            <SelectItem key={v} value={v}>
              {l}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={searchParams.get("segment") ?? ALL} onValueChange={(v) => updateParam("segment", v)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Segment" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All segments</SelectItem>
          {(Object.entries(SEGMENT_LABELS) as [ListingSegment, string][]).map(([v, l]) => (
            <SelectItem key={v} value={v}>
              {l}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={searchParams.get("bhk") ?? ALL} onValueChange={(v) => updateParam("bhk", v)}>
        <SelectTrigger className="w-28">
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

      <Input
        type="number"
        placeholder="Min ₹"
        className="w-28"
        defaultValue={searchParams.get("priceMin") ?? ""}
        onBlur={(e) => updateParam("priceMin", e.target.value)}
      />
      <Input
        type="number"
        placeholder="Max ₹"
        className="w-28"
        defaultValue={searchParams.get("priceMax") ?? ""}
        onBlur={(e) => updateParam("priceMax", e.target.value)}
      />

      {searchParams.toString() && (
        <Button variant="ghost" size="sm" onClick={() => router.push(pathname)}>
          Clear filters
        </Button>
      )}
    </div>
  );
}
