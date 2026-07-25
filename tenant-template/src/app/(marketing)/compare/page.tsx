import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getListingsByIds } from "@/lib/data/public/listings";
import { LocalizedDisplay } from "@/components/site/localized-display";
import { YoutubeEmbed } from "@/components/site/youtube-embed";
import { PROPERTY_TYPE_LABELS, SEGMENT_LABELS } from "@/lib/constants";
import { formatCurrencyINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

const ROWS: { label: string; render: (l: Awaited<ReturnType<typeof getListingsByIds>>[number]) => React.ReactNode }[] = [
  { label: "Price", render: (l) => formatCurrencyINR(l.listing.price) },
  { label: "Type", render: (l) => PROPERTY_TYPE_LABELS[l.listing.property_type] },
  { label: "Segment", render: (l) => SEGMENT_LABELS[l.listing.segment] },
  { label: "BHK", render: (l) => l.listing.bhk ?? "—" },
  { label: "Carpet area", render: (l) => (l.listing.carpet_area_sqft ? `${l.listing.carpet_area_sqft} sqft` : "—") },
  { label: "Built-up area", render: (l) => (l.listing.builtup_area_sqft ? `${l.listing.builtup_area_sqft} sqft` : "—") },
  { label: "Maintenance", render: (l) => (l.listing.maintenance_charges ? `${formatCurrencyINR(l.listing.maintenance_charges)}/mo` : "—") },
  { label: "Developer", render: (l) => l.listing.developer_name ?? "—" },
  { label: "Amenities", render: (l) => (l.listing.amenities.length ? l.listing.amenities.join(", ") : "—") },
];

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ ids?: string }> }) {
  const { ids: idsParam } = await searchParams;
  const ids = (idsParam ?? "").split(",").filter(Boolean);
  const supabase = await createClient();
  const entries = await getListingsByIds(supabase, ids);

  if (entries.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="mb-2 text-xl font-semibold">Nothing to compare yet</h1>
        <p className="mb-4 text-muted-foreground">Pick 2–3 listings using the Compare button on any listing card.</p>
        <Link href="/listings" className="text-primary hover:underline">
          Browse listings
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Compare</h1>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-32 border-b p-2 text-left" />
              {entries.map((entry) => (
                <th key={entry.listing.id} className="border-b p-2 text-left align-top">
                  <Link href={`/listings/${entry.listing.slug}`} className="font-medium hover:underline">
                    <LocalizedDisplay value={entry.listing.title} />
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label}>
                <td className="border-b p-2 font-medium text-muted-foreground">{row.label}</td>
                {entries.map((entry) => (
                  <td key={entry.listing.id} className="border-b p-2">
                    {row.render(entry)}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="p-2 font-medium text-muted-foreground">Video</td>
              {entries.map((entry) => {
                const video = entry.media.find((m) => m.media_type === "video_youtube");
                return (
                  <td key={entry.listing.id} className="p-2">
                    {video ? <YoutubeEmbed url={video.url} /> : "—"}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
