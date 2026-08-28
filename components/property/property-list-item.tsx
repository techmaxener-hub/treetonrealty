"use client";

import Link from "next/link";
import { BadgeCheck, MapPin } from "lucide-react";

import { ListingImage } from "@/components/property/listing-image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatINR } from "@/lib/currency";
import type { ListingCard } from "@/lib/queries/listings";
import { useFormattedArea } from "@/lib/stores/unit-store";

interface PropertyListItemProps {
  listing: ListingCard;
  onHover?: (slug: string | null) => void;
}

export function PropertyListItem({ listing, onHover }: PropertyListItemProps) {
  const formattedArea = useFormattedArea(listing.carpetAreaSqft);
  const isDeprioritized = listing.status !== "Active";

  return (
    <Link
      href={`/properties/${listing.slug}`}
      onMouseEnter={() => onHover?.(listing.slug)}
      onMouseLeave={() => onHover?.(null)}
      className="block"
    >
      <Card className={`flex flex-col overflow-hidden p-0 sm:flex-row ${isDeprioritized ? "opacity-70" : ""}`}>
        <div className="relative h-48 w-full shrink-0 overflow-hidden sm:h-auto sm:w-56">
          <ListingImage
            src={listing.primaryImageUrl ?? ""}
            alt={listing.primaryImageAlt}
            fill
            sizes="(max-width: 640px) 100vw, 224px"
            className="object-cover"
          />
          {isDeprioritized && (
            <div className="absolute left-3 top-3">
              <Badge variant="muted" className="bg-white/90">
                {listing.status}
              </Badge>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-between gap-3 p-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="gold">{listing.propertyType}</Badge>
              {listing.bhk ? <Badge variant="default">{listing.bhk} BHK</Badge> : null}
              {listing.isReraVerified ? (
                <Badge variant="verified">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  RERA Verified
                </Badge>
              ) : (
                <Badge variant="muted">RERA Pending</Badge>
              )}
            </div>
            <p className="mt-2 font-display text-lg font-semibold text-slate-deep">{listing.title}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {listing.locality}, {listing.city}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
            <span className="font-display text-xl font-bold text-gold-600">
              {formatINR(listing.priceInr)}
            </span>
            <span className="text-sm text-muted-foreground">{formattedArea}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
