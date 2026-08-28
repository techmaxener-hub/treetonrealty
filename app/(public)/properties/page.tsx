import type { Metadata } from "next";

import { PropertiesClient } from "@/components/property/properties-client";
import { parseSearchFilters, toListingFilters } from "@/lib/property-filters";
import { getActiveLocalities, getListings } from "@/lib/queries/listings";

export const metadata: Metadata = {
  title: "Search Properties",
  description:
    "Browse RERA-verified apartments, villas, plots, and commercial properties across Western Ahmedabad with an interactive map.",
};

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await searchParams;
  const urlSearchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(resolvedParams)) {
    if (typeof value === "string") urlSearchParams.set(key, value);
  }

  const filters = parseSearchFilters(urlSearchParams);
  const [page, localities] = await Promise.all([
    getListings(toListingFilters(filters)),
    getActiveLocalities(),
  ]);

  return (
    <PropertiesClient
      filters={filters}
      localities={localities}
      initialItems={page.items}
      initialTotalCount={page.totalCount}
      initialNextCursor={page.nextCursor}
    />
  );
}
