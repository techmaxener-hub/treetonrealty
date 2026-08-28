import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/server";
import { createLead, validateContactFields, ValidationError } from "@/lib/server/leads";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone } = validateContactFields(body.name, body.phone);

    if (typeof body.listingId !== "string" || body.listingId.length === 0) {
      throw new ValidationError("listingId is required.");
    }
    if (typeof body.preferredDate !== "string" || body.preferredDate.length === 0) {
      throw new ValidationError("preferredDate is required.");
    }
    if (typeof body.preferredTime !== "string" || body.preferredTime.length === 0) {
      throw new ValidationError("preferredTime is required.");
    }
    const cabPickupRequested = Boolean(body.cabPickupRequested);
    if (cabPickupRequested && (typeof body.pickupAddress !== "string" || body.pickupAddress.trim().length === 0)) {
      throw new ValidationError("pickupAddress is required when cab pickup is requested.");
    }

    const { data: listing, error: listingError } = await supabaseAdmin
      .from("listings")
      .select("id, title")
      .eq("id", body.listingId)
      .eq("is_published", true)
      .maybeSingle();

    if (listingError) throw new Error(listingError.message);
    if (!listing) throw new ValidationError("Listing not found.");

    const leadId = await createLead({
      name,
      phone,
      email: typeof body.email === "string" ? body.email : null,
      message: `Site visit requested for ${listing.title}`,
      listingId: listing.id,
      source: "site_visit_request",
    });

    const { error: visitError } = await supabaseAdmin.from("site_visits").insert({
      listing_id: listing.id,
      lead_id: leadId,
      name,
      phone,
      email: typeof body.email === "string" ? body.email : null,
      preferred_date: body.preferredDate,
      preferred_time: body.preferredTime,
      cab_pickup_requested: cabPickupRequested,
      pickup_address: cabPickupRequested ? body.pickupAddress.trim() : null,
    });

    if (visitError) throw new Error(visitError.message);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("POST /api/site-visits failed:", error);
    return NextResponse.json(
      { error: "Something went wrong while booking your site visit. Please try again or call us directly." },
      { status: 500 }
    );
  }
}
