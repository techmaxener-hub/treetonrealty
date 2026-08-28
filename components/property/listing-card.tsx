"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BadgeCheck, MapPin } from "lucide-react";

import { ListingImage } from "@/components/property/listing-image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatINR } from "@/lib/currency";
import type { ListingCard as ListingCardData } from "@/lib/queries/listings";
import { useFormattedArea } from "@/lib/stores/unit-store";

export function ListingCard({ listing, index = 0 }: { listing: ListingCardData; index?: number }) {
  const formattedArea = useFormattedArea(listing.carpetAreaSqft);
  const isDeprioritized = listing.status !== "Active";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/properties/${listing.slug}`} className="block">
        <Card className={`overflow-hidden p-0 ${isDeprioritized ? "opacity-70" : ""}`}>
          <div className="relative h-64 w-full overflow-hidden">
            <ListingImage
              src={listing.primaryImageUrl ?? ""}
              alt={listing.primaryImageAlt}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-700 ease-luxury hover:scale-110"
            />
            <div className="absolute left-3 top-3 flex flex-wrap gap-2">
              <Badge variant="gold">{listing.propertyType}</Badge>
              {listing.bhk ? <Badge variant="default">{listing.bhk} BHK</Badge> : null}
            </div>
            {isDeprioritized && (
              <div className="absolute left-0 top-8 -rotate-45 bg-slate-deep px-8 py-1 text-xs font-bold uppercase tracking-wide text-alabaster">
                {listing.status}
              </div>
            )}
            <div className="absolute bottom-3 right-3">
              {listing.isReraVerified ? (
                <Badge variant="verified" className="bg-white/90">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  RERA Verified
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
              <p className="font-display text-lg font-semibold leading-tight text-slate-deep">
                {listing.title}
              </p>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {listing.locality}, {listing.city}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="font-display text-lg font-bold text-gold-600">
                {formatINR(listing.priceInr)}
              </span>
              <span className="text-sm text-muted-foreground">{formattedArea}</span>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
