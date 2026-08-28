import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check, MapPin } from "lucide-react";

import { BrokerContact } from "@/components/property/broker-contact";
import { CostBreakdownSheet } from "@/components/property/cost-breakdown-sheet";
import { FloorPlanViewer } from "@/components/property/floor-plan-viewer";
import { KeyMetricsBar } from "@/components/property/key-metrics-bar";
import { LegalVastuBadges } from "@/components/property/legal-vastu-badges";
import { MediaTabs } from "@/components/property/media-tabs";
import { RelatedProperties } from "@/components/property/related-properties";
import { Badge } from "@/components/ui/badge";
import { getListingBySlug, getSimilarListings } from "@/lib/queries/listings";
import { getSiteSettings } from "@/lib/queries/site-settings";
import { getStampDutyRateForState } from "@/lib/queries/stamp-duty";

// ISR, generated on first request per slug rather than pre-rendered at build time --
// listing price/status/legal-status changes shouldn't need a redeploy to show up,
// and this avoids depending on Supabase being reachable during `next build`.
export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) return {};

  return {
    title: listing.title,
    description: listing.description,
    openGraph: {
      title: listing.title,
      description: listing.description,
      // No `images` here -- opengraph-image.tsx in this route segment generates the
      // og:image automatically. Setting `images` explicitly would override it.
    },
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) notFound();

  const [similar, siteSettings, stampDutyRate] = await Promise.all([
    getSimilarListings(listing),
    getSiteSettings(),
    getStampDutyRateForState(listing.state),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: listing.title,
    description: listing.description,
    url: `https://treetonrealty.com/properties/${listing.slug}`,
    image: listing.images.map((img) => img.url),
    address: {
      "@type": "PostalAddress",
      addressLocality: listing.locality,
      addressRegion: listing.state,
      addressCountry: "IN",
    },
    offers: {
      "@type": "Offer",
      price: listing.priceInr,
      priceCurrency: "INR",
      availability: listing.status === "Active" ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
    },
  };

  return (
    <div className="bg-alabaster pb-24 pt-28 lg:pb-16">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="container">
        <div className="mb-6">
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {listing.locality}, {listing.city}, {listing.state}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl font-bold text-slate-deep md:text-4xl">
              {listing.title}
            </h1>
            <Badge variant="gold">{listing.propertyType}</Badge>
            <Badge variant="muted">
              {listing.possessionStatus === "Ready"
                ? "Ready to Move"
                : listing.possessionDate
                  ? `Possession ${new Date(listing.possessionDate).getFullYear()}`
                  : "Under Construction"}
            </Badge>
            {listing.status !== "Active" && <Badge variant="outline">{listing.status}</Badge>}
          </div>
        </div>

        <MediaTabs images={listing.images} virtualTourUrl={listing.virtualTourUrl} title={listing.title} />

        <div className="mt-8">
          <KeyMetricsBar listing={listing} />
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
          <div className="space-y-10">
            <section>
              <p className="font-display text-xl font-semibold text-slate-deep">Overview</p>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-muted-foreground">
                {listing.description}
              </p>
            </section>

            {listing.amenities.length > 0 && (
              <section>
                <p className="font-display text-xl font-semibold text-slate-deep">Amenities</p>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {listing.amenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-slate-deep"
                    >
                      <Check className="h-4 w-4 shrink-0 text-gold-600" />
                      {amenity}
                    </div>
                  ))}
                </div>
              </section>
            )}

            <LegalVastuBadges
              legalStatus={listing.legalStatus}
              isReraVerified={listing.isReraVerified}
              vastuScore={listing.vastuScore}
              facingDirection={listing.facingDirection}
            />

            <FloorPlanViewer floorPlans={listing.floorPlans} />

            <CostBreakdownSheet
              basePriceInr={listing.priceInr}
              parkingChargesInr={listing.parkingChargesInr}
              propertyType={listing.propertyType}
              possessionStatus={listing.possessionStatus}
              stampDutyRate={stampDutyRate}
            />

            <RelatedProperties locality={listing.locality} similar={similar} />
          </div>

          <aside>
            <BrokerContact listing={listing} whatsappNumber={siteSettings.whatsappNumber} />
          </aside>
        </div>
      </div>
    </div>
  );
}
