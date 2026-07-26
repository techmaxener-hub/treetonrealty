import { notFound } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getLocalityBySlug } from "@/lib/data/public/localities";
import { ListingCard } from "@/components/site/listing-card";
import { LocalityContent } from "@/components/site/locality-content";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const result = await getLocalityBySlug(supabase, slug);
  if (!result) return {};
  const seo = result.locality.seo as { meta_title?: string; meta_description?: string };
  return {
    title: seo.meta_title ?? `${result.locality.name} — Real Estate Guide`,
    description: seo.meta_description,
  };
}

export default async function LocalityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const result = await getLocalityBySlug(supabase, slug);
  if (!result) notFound();

  const { locality, listings } = result;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: locality.name,
    address: locality.city ? { "@type": "PostalAddress", addressLocality: locality.city, addressRegion: locality.state } : undefined,
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {locality.hero_image_url && (
        <div className="relative aspect-[3/1] w-full bg-secondary">
          <Image src={locality.hero_image_url} alt={locality.name} fill className="object-cover" priority />
        </div>
      )}

      <div className="mx-auto max-w-4xl px-4 py-8">
        <Breadcrumbs items={[{ label: "Localities", href: "/localities" }, { label: locality.name }]} />
        <h1 className="mb-1 text-2xl font-semibold">{locality.name}</h1>
        {locality.city && <p className="mb-6 text-muted-foreground">{[locality.city, locality.state].filter(Boolean).join(", ")}</p>}

        <LocalityContent content={locality.content} />

        {listings.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 text-xl font-semibold">Listings in {locality.name}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
