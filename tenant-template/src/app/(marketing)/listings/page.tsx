import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getPublishedListings } from "@/lib/data/public/listings";
import { getLocalitiesLiteForFilter } from "@/lib/data/public/localities";
import { getBrokerProfile } from "@/lib/data/public/broker-profile";
import { ListingFilters } from "@/components/site/listing-filters";
import { ListingRow } from "@/components/site/listing-row";
import type { PropertyTypeEnum, ListingSegment, ListingOfferType } from "@/lib/types/database";
import type { BrokerContact } from "@/lib/types/broker-content";

export const dynamic = "force-dynamic";

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const [listings, localities, broker] = await Promise.all([
    getPublishedListings(supabase, {
      localityId: params.locality,
      propertyType: params.type as PropertyTypeEnum | undefined,
      segment: params.segment as ListingSegment | undefined,
      offerType: params.offer as ListingOfferType | undefined,
      bhk: params.bhk ? Number(params.bhk) : undefined,
      priceMin: params.priceMin ? Number(params.priceMin) : undefined,
      priceMax: params.priceMax ? Number(params.priceMax) : undefined,
    }),
    getLocalitiesLiteForFilter(supabase),
    getBrokerProfile(supabase),
  ]);

  const contact = (broker?.contact ?? {}) as BrokerContact;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-light">Listings</h1>
      <p className="mb-5 text-sm text-muted-foreground">
        {listings.length} {listings.length === 1 ? "property" : "properties"}
      </p>

      <Suspense>
        <ListingFilters localities={localities} />
      </Suspense>

      {listings.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">No listings match these filters yet.</p>
      ) : (
        <div className="mt-4">
          {listings.map((listing) => (
            <ListingRow key={listing.id} listing={listing} brokerContact={contact} brokerName={broker?.display_name ?? "our team"} />
          ))}
        </div>
      )}
    </div>
  );
}
