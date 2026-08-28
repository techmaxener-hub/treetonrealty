import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server-auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListingCoreForm } from "../../listing-core-form";
import { ListingImagesManager } from "../../listing-images-manager";
import { ListingAmenitiesForm } from "../../listing-amenities-form";
import { ListingLegalStatusForm } from "../../listing-legal-status-form";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const [{ data: listing }, { data: images }, { data: listingAmenities }, { data: amenities }, { data: titleTypes }, { data: legalStatus }] =
    await Promise.all([
      supabase.from("listings").select("*").eq("id", id).single(),
      supabase
        .from("listing_images")
        .select("*")
        .eq("listing_id", id)
        .order("display_order"),
      supabase.from("listing_amenities").select("amenity_id").eq("listing_id", id),
      supabase.from("amenities").select("*").order("display_order"),
      supabase.from("legal_title_types").select("*").order("display_order"),
      supabase.from("listing_legal_status").select("*").eq("listing_id", id).maybeSingle(),
    ]);

  if (!listing) {
    notFound();
  }

  return (
    <div className="max-w-3xl space-y-8 pb-12">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-deep">{listing.title}</h1>
        <p className="text-sm text-muted-foreground">{listing.ref_code}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-sans text-base">Listing Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ListingCoreForm listing={listing} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-sans text-base">Photos</CardTitle>
        </CardHeader>
        <CardContent>
          <ListingImagesManager listingId={id} images={images ?? []} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-sans text-base">Amenities</CardTitle>
        </CardHeader>
        <CardContent>
          <ListingAmenitiesForm
            listingId={id}
            amenities={amenities ?? []}
            selectedIds={(listingAmenities ?? []).map((a) => a.amenity_id)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-sans text-base">Legal Status</CardTitle>
        </CardHeader>
        <CardContent>
          <ListingLegalStatusForm
            listingId={id}
            titleTypes={titleTypes ?? []}
            initial={legalStatus ?? null}
          />
        </CardContent>
      </Card>
    </div>
  );
}
