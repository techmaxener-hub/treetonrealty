import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/server";
import { createLead, validateContactFields, ValidationError } from "@/lib/server/leads";

const SIGNED_URL_EXPIRY_SECONDS = 300;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone } = validateContactFields(body.name, body.phone);

    if (typeof body.listingId !== "string" || body.listingId.length === 0) {
      throw new ValidationError("listingId is required.");
    }

    const { data: listing, error: listingError } = await supabaseAdmin
      .from("listings")
      .select("id, title, brochure_storage_path")
      .eq("id", body.listingId)
      .eq("is_published", true)
      .maybeSingle();

    if (listingError) throw new Error(listingError.message);
    if (!listing) throw new ValidationError("Listing not found.");
    if (!listing.brochure_storage_path) {
      throw new ValidationError("A brochure has not been uploaded for this listing yet.");
    }

    await createLead({
      name,
      phone,
      listingId: listing.id,
      message: `Brochure downloaded for ${listing.title}`,
      source: "brochure_download",
    });

    const { data: signed, error: signError } = await supabaseAdmin.storage
      .from("brochures")
      .createSignedUrl(listing.brochure_storage_path, SIGNED_URL_EXPIRY_SECONDS);

    if (signError || !signed) {
      throw new Error(signError?.message ?? "Failed to create signed URL.");
    }

    return NextResponse.json({ url: signed.signedUrl, expiresInSeconds: SIGNED_URL_EXPIRY_SECONDS });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("POST /api/brochure-download failed:", error);
    return NextResponse.json(
      { error: "Something went wrong while preparing your brochure. Please try again or call us directly." },
      { status: 500 }
    );
  }
}
