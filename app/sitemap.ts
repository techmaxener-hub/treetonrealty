import type { MetadataRoute } from "next";

import { getAllCollectionSlugs } from "@/lib/queries/collections";
import { getAllListingSlugs } from "@/lib/queries/listings";
import { SITE_URL } from "@/lib/site";

// Regenerate at most once an hour rather than on every crawler hit.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [listingSlugs, collectionSlugs] = await Promise.all([
    getAllListingSlugs(),
    getAllCollectionSlugs(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/properties`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/calculators/emi`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/calculators/stamp-duty`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/calculators/area-converter`, changeFrequency: "monthly", priority: 0.6 },
  ];

  const listingRoutes: MetadataRoute.Sitemap = listingSlugs.map((slug) => ({
    url: `${SITE_URL}/properties/${slug}`,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const collectionRoutes: MetadataRoute.Sitemap = collectionSlugs.map((slug) => ({
    url: `${SITE_URL}/collections/${slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...listingRoutes, ...collectionRoutes];
}
