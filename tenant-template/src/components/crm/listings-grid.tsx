"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ImageOff } from "lucide-react";
import type { ListingListItem } from "@/lib/data/listings";
import type { LocalityLite } from "@/lib/data/localities";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NewListingDialog } from "@/components/crm/new-listing-dialog";
import {
  LISTING_STATUS_LABELS,
  LISTING_STATUS_CLASSES,
  SEGMENT_LABELS,
  PROPERTY_TYPE_LABELS,
} from "@/lib/constants";
import { cn, formatCurrencyINR, localizedText } from "@/lib/utils";
import type { ListingSegment, ListingStatus, PropertyTypeEnum } from "@/lib/types/database";

const ALL = "__all__";

export function ListingsGrid({ listings, localities }: { listings: ListingListItem[]; localities: LocalityLite[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>(ALL);
  const [segment, setSegment] = useState<string>(ALL);
  const [propertyType, setPropertyType] = useState<string>(ALL);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listings.filter((l) => {
      if (status !== ALL && l.status !== status) return false;
      if (segment !== ALL && l.segment !== segment) return false;
      if (propertyType !== ALL && l.property_type !== propertyType) return false;
      if (q && !localizedText(l.title).toLowerCase().includes(q) && !l.slug.includes(q)) return false;
      return true;
    });
  }, [listings, query, status, segment, propertyType]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold">Listings</h1>
          <p className="text-sm text-muted-foreground">Inventory across every advisor.</p>
        </div>
        <NewListingDialog localities={localities} />
      </div>

      <div className="flex flex-wrap items-center gap-2 px-6 py-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search title…" className="pl-8" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            {(Object.entries(LISTING_STATUS_LABELS) as [ListingStatus, string][]).map(([v, l]) => (
              <SelectItem key={v} value={v}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={segment} onValueChange={setSegment}>
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
        <Select value={propertyType} onValueChange={setPropertyType}>
          <SelectTrigger className="w-44">
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
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">No listings match.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((listing) => (
              <Link
                key={listing.id}
                href={`/crm/listings/${listing.id}`}
                className="flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-[4/3] bg-secondary">
                  {listing.coverUrl ? (
                    <Image
                      src={listing.coverUrl}
                      alt={localizedText(listing.title)}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <ImageOff className="h-8 w-8" />
                    </div>
                  )}
                  {!listing.is_published && (
                    <Badge variant="secondary" className="absolute left-2 top-2 text-[10px]">
                      Draft
                    </Badge>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1.5 p-3">
                  <p className="line-clamp-1 text-sm font-medium">{localizedText(listing.title) || listing.slug}</p>
                  <p className="text-sm font-semibold">{formatCurrencyINR(listing.price)}</p>
                  <p className="text-xs text-muted-foreground">
                    {listing.localityName ?? "No locality"} · {PROPERTY_TYPE_LABELS[listing.property_type]}
                    {listing.bhk ? ` · ${listing.bhk} BHK` : ""}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-1">
                    <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium", LISTING_STATUS_CLASSES[listing.status])}>
                      {LISTING_STATUS_LABELS[listing.status]}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{listing.advisor?.fullName ?? "Unassigned"}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
