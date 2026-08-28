import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ListingCard } from "@/components/property/listing-card";
import { getCollectionBySlug } from "@/lib/queries/collections";

// ISR, generated on first request per slug -- collection membership is admin-managed
// and shouldn't need a redeploy to update, and this avoids a build-time Supabase
// dependency.
export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) return {};
  return { title: collection.title };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();

  return (
    <div className="min-h-screen bg-alabaster px-6 pb-24 pt-28">
      <div className="container">
        <p className="font-serif text-lg italic text-gold-600">Curated Collection</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-slate-deep">{collection.title}</h1>

        {collection.introRichtext && (
          // Admin-authored rich text from our own CMS (collections.intro_richtext),
          // not user input -- safe to render as HTML.
          // eslint-disable-next-line react/no-danger
          <div
            className="prose prose-sm mt-4 max-w-2xl text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: collection.introRichtext }}
          />
        )}

        {collection.listings.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No properties have been added to this collection yet.
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {collection.listings.map((listing, i) => (
              <ListingCard key={listing.id} listing={listing} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
