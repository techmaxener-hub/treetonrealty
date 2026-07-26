"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { BadgeCheck, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatIndianPrice, type Property } from "@/lib/mock-data";
import { useUnit } from "@/lib/providers/unit-provider";

export function PropertyCard({ property, index = 0 }: { property: Property; index?: number }) {
  const { formatArea } = useUnit();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/properties/${property.slug}`} className="block">
        <Card className="overflow-hidden p-0">
          <div className="relative h-64 w-full overflow-hidden">
            <Image
              src={property.heroImage}
              alt={property.title}
              fill
              className="object-cover transition-transform duration-700 ease-luxury hover:scale-110"
            />
            <div className="absolute left-3 top-3 flex flex-wrap gap-2">
              <Badge variant="gold">{property.typology}</Badge>
              {property.giftCitySpecial && <Badge variant="default">GIFT City</Badge>}
            </div>
            <div className="absolute bottom-3 right-3">
              {property.gujreraVerified ? (
                <Badge variant="verified" className="bg-white/90">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  GUJRERA
                </Badge>
              ) : (
                <Badge variant="muted" className="bg-white/90">
                  RERA Pending
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-3 p-5">
            <div>
              <p className="font-display text-lg font-semibold leading-tight text-charcoal">
                {property.title}
              </p>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {property.locality}, {property.city}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="font-display text-lg font-bold text-champagne-dark">
                {formatIndianPrice(property.priceInCr)}
              </span>
              <span className="text-sm text-muted-foreground">
                {formatArea(property.carpetAreaSqFt)}
              </span>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
