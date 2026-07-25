"use client";

import Link from "next/link";
import Image from "next/image";
import { ImageOff, Scale } from "lucide-react";
import type { PublicListingCard } from "@/lib/data/public/listings";
import { useLocalizedText } from "@/lib/hooks/use-language";
import { useCompareList } from "@/lib/hooks/use-compare-list";
import { Badge } from "@/components/ui/badge";
import { SEGMENT_LABELS, PROPERTY_TYPE_LABELS } from "@/lib/constants";
import { cn, formatCurrencyINR } from "@/lib/utils";

export function ListingCard({ listing, showCompare = true }: { listing: PublicListingCard; showCompare?: boolean }) {
  const title = useLocalizedText(listing.title);
  const { ids, toggle, max } = useCompareList();
  const isComparing = ids.includes(listing.id);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/listings/${listing.slug}`} className="relative aspect-[4/3] bg-secondary">
        {listing.coverUrl ? (
          <Image
            src={listing.coverUrl}
            alt={title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <ImageOff className="h-8 w-8" />
          </div>
        )}
        <Badge className="absolute left-2 top-2 text-[10px]">{SEGMENT_LABELS[listing.segment]}</Badge>
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <Link href={`/listings/${listing.slug}`} className="line-clamp-1 text-sm font-medium hover:underline">
          {title || listing.slug}
        </Link>
        <p className="text-base font-semibold">{formatCurrencyINR(listing.price)}</p>
        <p className="text-xs text-muted-foreground">
          {listing.localityName ?? ""} {listing.localityName ? "·" : ""} {PROPERTY_TYPE_LABELS[listing.property_type]}
          {listing.bhk ? ` · ${listing.bhk} BHK` : ""}
        </p>

        {showCompare && (
          <button
            type="button"
            onClick={() => toggle(listing.id)}
            disabled={!isComparing && ids.length >= max}
            className={cn(
              "mt-1 flex items-center gap-1.5 self-start rounded-full border px-2 py-1 text-[11px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40",
              isComparing ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Scale className="h-3 w-3" /> {isComparing ? "Added to compare" : "Compare"}
          </button>
        )}
      </div>
    </div>
  );
}
