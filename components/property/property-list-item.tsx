"use client";

import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatIndianPrice, type Property } from "@/lib/mock-data";
import { useUnit } from "@/lib/providers/unit-provider";

interface PropertyListItemProps {
  property: Property;
  onHover?: (slug: string | null) => void;
}

export function PropertyListItem({ property, onHover }: PropertyListItemProps) {
  const { formatArea } = useUnit();

  return (
    <Link
      href={`/properties/${property.slug}`}
      onMouseEnter={() => onHover?.(property.slug)}
      onMouseLeave={() => onHover?.(null)}
      className="block"
    >
      <Card className="flex flex-col overflow-hidden p-0 sm:flex-row">
        <div className="relative h-48 w-full shrink-0 overflow-hidden sm:h-auto sm:w-56">
          <Image src={property.heroImage} alt={property.title} fill className="object-cover" />
        </div>

        <div className="flex flex-1 flex-col justify-between gap-3 p-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="gold">{property.typology}</Badge>
              {property.gujreraVerified ? (
                <Badge variant="verified">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  GUJRERA
                </Badge>
              ) : (
                <Badge variant="muted">RERA Pending</Badge>
              )}
              {property.giftCitySpecial && <Badge variant="default">GIFT City</Badge>}
            </div>
            <p className="mt-2 font-display text-lg font-semibold text-charcoal">
              {property.title}
            </p>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {property.locality}, {property.city} &middot; {property.corridorName}
            </p>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {property.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
            <span className="font-display text-xl font-bold text-champagne-dark">
              {formatIndianPrice(property.priceInCr)}
            </span>
            <span className="text-sm text-muted-foreground">
              {formatArea(property.carpetAreaSqFt)} &middot; {property.developer}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
