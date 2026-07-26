import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getPublishedLocalities } from "@/lib/data/public/localities";
import { Breadcrumbs } from "@/components/site/breadcrumbs";

export const dynamic = "force-dynamic";

export default async function LocalitiesPage() {
  const supabase = await createClient();
  const localities = await getPublishedLocalities(supabase);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Breadcrumbs items={[{ label: "Localities" }]} />
      <h1 className="mb-2 text-2xl font-semibold">Localities we cover</h1>
      <p className="mb-6 text-muted-foreground">Micro-market guides — connectivity, price trends, and what to expect.</p>

      {localities.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">Locality guides are coming soon.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {localities.map((locality) => (
            <Link
              key={locality.id}
              href={`/localities/${locality.slug}`}
              className="group flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-[3/2] bg-secondary">
                {locality.hero_image_url ? (
                  <Image src={locality.hero_image_url} alt={locality.name} fill className="object-cover" sizes="33vw" />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <MapPin className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="font-medium group-hover:underline">{locality.name}</p>
                {locality.city && <p className="text-xs text-muted-foreground">{locality.city}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
