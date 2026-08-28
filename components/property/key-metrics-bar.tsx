"use client";

import { BadgeCheck, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatINR } from "@/lib/currency";
import type { ListingDetail } from "@/lib/queries/listings";
import { useFormattedArea, useUnitStore } from "@/lib/stores/unit-store";
import { convertArea } from "@/lib/area";

export function KeyMetricsBar({ listing }: { listing: ListingDetail }) {
  const formattedArea = useFormattedArea(listing.carpetAreaSqft);
  const unit = useUnitStore((state) => state.unit);
  const bighaRegion = useUnitStore((state) => state.bighaRegion);

  const areaInUnit = convertArea(listing.carpetAreaSqft, unit, { bighaRegion });
  const pricePerUnit = areaInUnit > 0 ? listing.priceInr / areaInUnit : 0;

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-border bg-white p-6 shadow-elevate sm:flex-row sm:items-center sm:justify-between">
      <div className="grid flex-1 grid-cols-2 gap-6 sm:grid-cols-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Price</p>
          <p className="font-display text-2xl font-bold text-gold-600">
            {formatINR(listing.priceInr)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Carpet Area</p>
          <p className="font-display text-2xl font-bold text-slate-deep">{formattedArea}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Price / Unit</p>
          <p className="font-display text-2xl font-bold text-slate-deep">
            {formatINR(Math.round(pricePerUnit))}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Configuration</p>
          <p className="font-display text-2xl font-bold text-slate-deep">
            {listing.bhk ? `${listing.bhk} BHK` : listing.propertyType}
          </p>
        </div>
      </div>

      <div className="hidden h-14 sm:block">
        <Separator orientation="vertical" />
      </div>

      {listing.isReraVerified ? (
        <Badge variant="verified" className="w-fit px-4 py-2 text-sm">
          <BadgeCheck className="h-4 w-4" />
          RERA Registered
        </Badge>
      ) : (
        <Badge variant="muted" className="w-fit px-4 py-2 text-sm">
          <Clock className="h-4 w-4" />
          RERA Pending
        </Badge>
      )}
    </div>
  );
}
