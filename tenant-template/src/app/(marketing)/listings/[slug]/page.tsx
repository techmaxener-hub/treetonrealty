import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getListingBySlug } from "@/lib/data/public/listings";
import { getBrokerProfile } from "@/lib/data/public/broker-profile";
import { ListingGallery } from "@/components/site/listing-gallery";
import { ListingViewTracker } from "@/components/site/listing-view-tracker";
import { YoutubeEmbed } from "@/components/site/youtube-embed";
import { EmiCalculator } from "@/components/site/emi-calculator";
import { ListingCard } from "@/components/site/listing-card";
import { LocalizedDisplay } from "@/components/site/localized-display";
import { WhatsAppButton } from "@/components/site/whatsapp-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PROPERTY_TYPE_LABELS, SEGMENT_LABELS, POSSESSION_STATUS_LABELS } from "@/lib/constants";
import { formatCurrencyINR, localizedText } from "@/lib/utils";
import type { BrokerContact } from "@/lib/types/broker-content";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const result = await getListingBySlug(supabase, slug);
  if (!result) return {};
  const title = localizedText(result.listing.title);
  const description = localizedText(result.listing.description).slice(0, 155);
  return { title, description };
}

export default async function ListingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const [result, broker] = await Promise.all([getListingBySlug(supabase, slug), getBrokerProfile(supabase)]);
  if (!result) notFound();

  const { listing, media, locality, advisor, similar } = result;
  const contact = (broker?.contact ?? {}) as BrokerContact;
  const video = media.find((m) => m.media_type === "video_youtube");
  const title = localizedText(listing.title);
  const description = localizedText(listing.description);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: title,
    description,
    url: `/listings/${listing.slug}`,
    datePosted: listing.published_at,
    ...(listing.price ? { offers: { "@type": "Offer", price: listing.price, priceCurrency: "INR" } } : {}),
    ...(listing.address ? { address: { "@type": "PostalAddress", streetAddress: listing.address } } : {}),
    ...(listing.lat && listing.lng ? { geo: { "@type": "GeoCoordinates", latitude: listing.lat, longitude: listing.lng } } : {}),
    numberOfRooms: listing.bhk,
    floorSize: listing.carpet_area_sqft ? { "@type": "QuantitativeValue", value: listing.carpet_area_sqft, unitText: "sqft" } : undefined,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ListingViewTracker listingId={listing.id} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <ListingGallery media={media} title={title} />

          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge>{SEGMENT_LABELS[listing.segment]}</Badge>
              <Badge variant="outline">{PROPERTY_TYPE_LABELS[listing.property_type]}</Badge>
              {listing.is_exclusive && <Badge variant="secondary">Exclusive</Badge>}
            </div>
            <h1 className="text-2xl font-semibold">
              <LocalizedDisplay value={listing.title} />
            </h1>
            <p className="mt-1 text-muted-foreground">
              {locality ? `${locality.name} · ` : ""}
              {listing.bhk ? `${listing.bhk} BHK · ` : ""}
              {listing.carpet_area_sqft ? `${listing.carpet_area_sqft} sqft` : ""}
            </p>
            <p className="mt-3 text-3xl font-semibold">{formatCurrencyINR(listing.price)}</p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-medium">About this property</h2>
            <LocalizedDisplay value={listing.description} as="p" className="whitespace-pre-line text-muted-foreground" />
          </div>

          {listing.amenities.length > 0 && (
            <div>
              <h2 className="mb-2 text-lg font-medium">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {listing.amenities.map((a) => (
                  <Badge key={a} variant="outline">
                    {a}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              {listing.developer_name && (
                <div>
                  <p className="text-muted-foreground">Developer</p>
                  <p>{listing.developer_name}</p>
                </div>
              )}
              {listing.possession_status && (
                <div>
                  <p className="text-muted-foreground">Possession</p>
                  <p>{POSSESSION_STATUS_LABELS[listing.possession_status]}</p>
                </div>
              )}
              {listing.floor_number != null && (
                <div>
                  <p className="text-muted-foreground">Floor</p>
                  <p>
                    {listing.floor_number}
                    {listing.total_floors ? ` of ${listing.total_floors}` : ""}
                  </p>
                </div>
              )}
              {listing.builtup_area_sqft && (
                <div>
                  <p className="text-muted-foreground">Built-up area</p>
                  <p>{listing.builtup_area_sqft} sqft</p>
                </div>
              )}
              {listing.maintenance_charges && (
                <div>
                  <p className="text-muted-foreground">Maintenance</p>
                  <p>{formatCurrencyINR(listing.maintenance_charges)}/mo</p>
                </div>
              )}
            </CardContent>
          </Card>

          {video?.url && (
            <div>
              <h2 className="mb-2 text-lg font-medium">Video walkthrough</h2>
              <YoutubeEmbed url={video.url} title={title} />
            </div>
          )}

          {listing.lat && listing.lng && (
            <div>
              <h2 className="mb-2 text-lg font-medium">Location</h2>
              <div className="aspect-video overflow-hidden rounded-lg border">
                <iframe
                  className="h-full w-full"
                  loading="lazy"
                  src={`https://www.google.com/maps?q=${listing.lat},${listing.lng}&output=embed`}
                  title="Map"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="flex flex-col gap-3 pt-4">
              {contact.whatsapp_number && (
                <WhatsAppButton
                  number={contact.whatsapp_number}
                  message={`Hi, I'm interested in "${title}" (${listing.slug}). Could you share more details?`}
                  listingId={listing.id}
                  variant="inline"
                  label="Enquire on WhatsApp"
                />
              )}
              {advisor && (
                <Link href={`/advisors/${advisor.slug}`} className="rounded-md border p-3 text-sm hover:bg-secondary/50">
                  <p className="text-xs text-muted-foreground">Point of contact</p>
                  <p className="font-medium">View advisor profile</p>
                </Link>
              )}
            </CardContent>
          </Card>

          <EmiCalculator price={listing.price} />
        </div>
      </div>

      {similar.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-4 text-xl font-semibold">Similar listings</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
