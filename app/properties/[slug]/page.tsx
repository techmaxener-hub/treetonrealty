import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check, MapPin } from "lucide-react";

import { BrokerContact } from "@/components/property/broker-contact";
import { FloorPlanViewer } from "@/components/property/floor-plan-viewer";
import { KeyMetricsBar } from "@/components/property/key-metrics-bar";
import { MediaTabs } from "@/components/property/media-tabs";
import { PaymentPlanCalculator } from "@/components/property/payment-plan-calculator";
import { RelatedProperties } from "@/components/property/related-properties";
import { Badge } from "@/components/ui/badge";
import { getPropertyBySlug, PROPERTIES } from "@/lib/mock-data";

export function generateStaticParams() {
  return PROPERTIES.map((property) => ({ slug: property.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const property = getPropertyBySlug(params.slug);
  if (!property) return {};
  return {
    title: property.title,
    description: property.description,
  };
}

export default function PropertyDetailPage({ params }: { params: { slug: string } }) {
  const property = getPropertyBySlug(params.slug);
  if (!property) notFound();

  return (
    <div className="bg-ivory pb-24 pt-28 lg:pb-16">
      <div className="container">
        <div className="mb-6">
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {property.corridorName} &middot; {property.locality}, {property.city}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl font-bold text-charcoal md:text-4xl">
              {property.title}
            </h1>
            <Badge variant="gold">{property.typology}</Badge>
            {property.giftCitySpecial && <Badge variant="default">GIFT City</Badge>}
            <Badge variant="muted">
              {property.status === "Ready to Move" ? "Ready to Move" : `Possession ${property.possessionYear}`}
            </Badge>
          </div>
        </div>

        <MediaTabs images={property.images} title={property.title} />

        <div className="mt-8">
          <KeyMetricsBar property={property} />
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
          <div className="space-y-10">
            <section>
              <p className="font-display text-xl font-semibold text-charcoal">Overview</p>
              <p className="mt-3 leading-relaxed text-muted-foreground">{property.description}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Developed by <span className="font-medium text-charcoal">{property.developer}</span>
              </p>
            </section>

            <section>
              <p className="font-display text-xl font-semibold text-charcoal">Amenities</p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {property.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-charcoal"
                  >
                    <Check className="h-4 w-4 shrink-0 text-champagne-dark" />
                    {amenity}
                  </div>
                ))}
              </div>
            </section>

            <FloorPlanViewer property={property} />
            <PaymentPlanCalculator property={property} />
            <RelatedProperties property={property} />
          </div>

          <aside>
            <BrokerContact property={property} />
          </aside>
        </div>
      </div>
    </div>
  );
}
