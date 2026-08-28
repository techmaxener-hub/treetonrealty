import { ListingCard } from "@/components/property/listing-card";
import type { ListingCard as ListingCardData } from "@/lib/queries/listings";

export function RelatedProperties({
  locality,
  similar,
}: {
  locality: string;
  similar: ListingCardData[];
}) {
  if (similar.length === 0) return null;

  return (
    <div>
      <p className="font-display text-xl font-semibold text-slate-deep">More in {locality}</p>
      <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {similar.map((listing, i) => (
          <ListingCard key={listing.id} listing={listing} index={i} />
        ))}
      </div>
    </div>
  );
}
