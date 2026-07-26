"use client";

import Link from "next/link";
import Image from "next/image";
import { ImageOff, Scale, BedDouble, Ruler, Home } from "lucide-react";
import type { PublicListingCard } from "@/lib/data/public/listings";
import { useLocalizedText } from "@/lib/hooks/use-language";
import { useCompareList } from "@/lib/hooks/use-compare-list";
import { Badge } from "@/components/ui/badge";
import { PROPERTY_TYPE_LABELS } from "@/lib/constants";
import { cn, formatCurrencyINR } from "@/lib/utils";

export function ListingCard({
  listing,
  showCompare = true,
  watermark,
}: {
  listing: PublicListingCard;
  showCompare?: boolean;
  watermark?: string;
}) {
  const title = useLocalizedText(listing.title);
  const { ids, toggle, max } = useCompareList();
  const isComparing = ids.includes(listing.id);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-md border border-border bg-card shadow-sm transition-shadow hover:shadow-lg">
      <Link href={`/listings/${listing.slug}`} className="relative aspect-[4/3] overflow-hidden bg-secondary">
        {listing.coverUrl ? (
          <Image
            src={listing.coverUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <ImageOff className="h-8 w-8" />
          </div>
        )}
        {watermark && listing.coverUrl && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 flex select-none items-center justify-center text-center text-lg font-light uppercase tracking-[0.3em] text-white/70 mix-blend-overlay"
          >
            {watermark}
          </span>
        )}
        <Badge className="absolute left-2 top-2 rounded-sm bg-foreground px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-background">
          {listing.offer_type === "sale" ? "For Sale" : "For Rent"}
        </Badge>
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/listings/${listing.slug}`} className="line-clamp-1 text-sm font-medium hover:underline">
            {title || listing.slug}
          </Link>
          <p className="shrink-0 text-sm font-semibold tabular-nums">
            {formatCurrencyINR(listing.price)}
            {listing.offer_type === "rent" && <span className="font-normal text-muted-foreground">/mo</span>}
          </p>
        </div>
        <p className="line-clamp-1 text-xs text-muted-foreground">{listing.localityName ?? ""}</p>

        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Home className="h-3.5 w-3.5" /> {PROPERTY_TYPE_LABELS[listing.property_type]}
          </span>
          {listing.bhk ? (
            <span className="flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5" /> {listing.bhk} BHK
            </span>
          ) : null}
          {listing.carpet_area_sqft ? (
            <span className="flex items-center gap-1">
              <Ruler className="h-3.5 w-3.5" /> {listing.carpet_area_sqft} sqft
            </span>
          ) : null}
        </div>

        {showCompare && (
          <button
            type="button"
            onClick={() => toggle(listing.id)}
            disabled={!isComparing && ids.length >= max}
            className={cn(
              "mt-1 flex items-center gap-1.5 self-start rounded-full border px-2 py-1 text-[11px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40",
              isComparing ? "border-foreground bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Scale className="h-3 w-3" /> {isComparing ? "Added to compare" : "Compare"}
          </button>
        )}
      </div>
    </div>
  );
}
