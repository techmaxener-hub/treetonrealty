import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getPublishedListings } from "@/lib/data/public/listings";
import { getLocalitiesLiteForFilter } from "@/lib/data/public/localities";
import { ListingFilters } from "@/components/site/listing-filters";
import { ListingCard } from "@/components/site/listing-card";
import type { PropertyTypeEnum, ListingSegment } from "@/lib/types/database";

export const dynamic = "force-dynamic";

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const [listings, localities] = await Promise.all([
    getPublishedListings(supabase, {
      localityId: params.locality,
      propertyType: params.type as PropertyTypeEnum | undefined,
      segment: params.segment as ListingSegment | undefined,
      bhk: params.bhk ? Number(params.bhk) : undefined,
      priceMin: params.priceMin ? Number(params.priceMin) : undefined,
      priceMax: params.priceMax ? Number(params.priceMax) : undefined,
    }),
    getLocalitiesLiteForFilter(supabase),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-semibold">Listings</h1>
      <Suspense>
        <ListingFilters localities={localities} />
      </Suspense>

      <p className="my-4 text-sm text-muted-foreground">{listings.length} properties</p>

      {listings.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">No listings match these filters yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
