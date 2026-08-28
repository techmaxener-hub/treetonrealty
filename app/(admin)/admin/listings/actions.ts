"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server-auth-client";
import type { Database } from "@/lib/supabase/database.types";
import type { ListingStatus } from "./types";

type ListingInsert = Database["public"]["Tables"]["listings"]["Insert"];

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function generateRefCode() {
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `TR-${suffix}`;
}

function num(formData: FormData, key: string): number | null {
  const raw = formData.get(key);
  if (raw === null || raw === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function str(formData: FormData, key: string): string | null {
  const raw = formData.get(key);
  if (raw === null) return null;
  const trimmed = String(raw).trim();
  return trimmed === "" ? null : trimmed;
}

function parseListingFields(formData: FormData) {
  const title = str(formData, "title");
  const description = str(formData, "description");
  const property_type = str(formData, "property_type");
  const locality = str(formData, "locality");
  const carpet_area_sqft = num(formData, "carpet_area_sqft");
  const price_inr = num(formData, "price_inr");
  const possession_status = str(formData, "possession_status");

  if (!title || !description || !property_type || !locality || !carpet_area_sqft || !price_inr || !possession_status) {
    return { error: "Title, description, property type, locality, carpet area, price, and possession status are required." };
  }

  const fields: Partial<ListingInsert> = {
    title,
    description,
    property_type: property_type as ListingInsert["property_type"],
    locality,
    city: str(formData, "city") ?? "Ahmedabad",
    state: str(formData, "state") ?? "Gujarat",
    address: str(formData, "address"),
    latitude: num(formData, "latitude"),
    longitude: num(formData, "longitude"),
    bhk: num(formData, "bhk"),
    bathrooms: num(formData, "bathrooms"),
    carpet_area_sqft,
    built_up_area_sqft: num(formData, "built_up_area_sqft"),
    price_inr,
    parking_charges_inr: num(formData, "parking_charges_inr"),
    furnishing_status: str(formData, "furnishing_status") as ListingInsert["furnishing_status"],
    possession_status: possession_status as ListingInsert["possession_status"],
    possession_date: str(formData, "possession_date"),
    facing_direction: str(formData, "facing_direction") as ListingInsert["facing_direction"],
    vastu_score: str(formData, "vastu_score") as ListingInsert["vastu_score"],
    is_rera_verified: formData.get("is_rera_verified") === "on",
    virtual_tour_url: str(formData, "virtual_tour_url"),
    is_published: formData.get("is_published") === "on",
    status: (str(formData, "status") ?? "Draft") as ListingStatus,
  };

  return { fields };
}

export async function checkDuplicateListings(title: string, address: string | null) {
  const supabase = await createSupabaseServerClient();
  const orParts = [`title.ilike.%${title}%`];
  if (address) orParts.push(`address.ilike.%${address}%`);

  const { data, error } = await supabase
    .from("listings")
    .select("id, ref_code, title, locality, address")
    .or(orParts.join(","))
    .limit(5);

  if (error) return { matches: [] };
  return { matches: data };
}

export async function createListing(formData: FormData) {
  const parsed = parseListingFields(formData);
  if (parsed.error || !parsed.fields) {
    return { error: parsed.error ?? "Invalid form data." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const slug = slugify(parsed.fields.title!);
  let refCode = generateRefCode();

  let listingId: string | null = null;
  for (let attempt = 0; attempt < 3 && !listingId; attempt++) {
    const { data, error } = await supabase
      .from("listings")
      .insert({
        ...(parsed.fields as ListingInsert),
        slug: attempt === 0 ? slug : `${slug}-${attempt}`,
        ref_code: refCode,
        created_by: user?.id ?? null,
      })
      .select("id")
      .single();

    if (!error) {
      listingId = data.id;
    } else if (error.code === "23505") {
      // slug or ref_code collision -- regenerate and retry
      refCode = generateRefCode();
      continue;
    } else {
      return { error: error.message };
    }
  }

  if (!listingId) {
    return { error: "Couldn't generate a unique slug/reference code. Try a different title." };
  }

  revalidatePath("/admin/listings");
  redirect(`/admin/listings/${listingId}/edit`);
}

export async function updateListing(id: string, formData: FormData) {
  const parsed = parseListingFields(formData);
  if (parsed.error || !parsed.fields) {
    return { error: parsed.error ?? "Invalid form data." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("listings").update(parsed.fields).eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/listings");
  revalidatePath(`/admin/listings/${id}/edit`);
  return { error: null };
}

export async function updateListingStatus(ids: string[], status: ListingStatus) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("listings").update({ status }).in("id", ids);

  if (error) return { error: error.message };

  revalidatePath("/admin/listings");
  return { error: null };
}

export async function setAmenities(listingId: string, amenityIds: string[]) {
  const supabase = await createSupabaseServerClient();

  const { error: deleteError } = await supabase
    .from("listing_amenities")
    .delete()
    .eq("listing_id", listingId);
  if (deleteError) return { error: deleteError.message };

  if (amenityIds.length > 0) {
    const { error: insertError } = await supabase
      .from("listing_amenities")
      .insert(amenityIds.map((amenity_id) => ({ listing_id: listingId, amenity_id })));
    if (insertError) return { error: insertError.message };
  }

  revalidatePath(`/admin/listings/${listingId}/edit`);
  return { error: null };
}

export async function upsertLegalStatus(listingId: string, formData: FormData) {
  const title_type_code = str(formData, "title_type_code");
  if (!title_type_code) return { error: "Select a title type." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("listing_legal_status").upsert({
    listing_id: listingId,
    title_type_code,
    oc_status: (str(formData, "oc_status") ?? "Not Applied") as Database["public"]["Enums"]["certificate_status_enum"],
    oc_date: str(formData, "oc_date"),
    cc_status: (str(formData, "cc_status") ?? "Not Applied") as Database["public"]["Enums"]["certificate_status_enum"],
    cc_date: str(formData, "cc_date"),
    project_rera_number: str(formData, "project_rera_number"),
    project_rera_verification_url: str(formData, "project_rera_verification_url"),
  });

  if (error) return { error: error.message };

  revalidatePath(`/admin/listings/${listingId}/edit`);
  return { error: null };
}

export async function insertListingImage(
  listingId: string,
  storagePath: string,
  altText: string,
  roomCategory: Database["public"]["Enums"]["room_category_enum"],
  displayOrder: number
) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("listing_images").insert({
    listing_id: listingId,
    storage_path: storagePath,
    alt_text: altText,
    room_category: roomCategory,
    display_order: displayOrder,
  });

  if (error) return { error: error.message };

  revalidatePath(`/admin/listings/${listingId}/edit`);
  return { error: null };
}

export async function updateListingImage(
  imageId: string,
  listingId: string,
  fields: { alt_text?: string; room_category?: Database["public"]["Enums"]["room_category_enum"] }
) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("listing_images").update(fields).eq("id", imageId);

  if (error) return { error: error.message };

  revalidatePath(`/admin/listings/${listingId}/edit`);
  return { error: null };
}

export async function deleteListingImage(imageId: string, listingId: string, storagePath: string) {
  const supabase = await createSupabaseServerClient();

  const { error: dbError } = await supabase.from("listing_images").delete().eq("id", imageId);
  if (dbError) return { error: dbError.message };

  await supabase.storage.from("public-media").remove([storagePath]);

  revalidatePath(`/admin/listings/${listingId}/edit`);
  return { error: null };
}

export async function reorderListingImages(listingId: string, orderedImageIds: string[]) {
  const supabase = await createSupabaseServerClient();

  await Promise.all(
    orderedImageIds.map((id, index) =>
      supabase.from("listing_images").update({ display_order: index }).eq("id", id)
    )
  );

  revalidatePath(`/admin/listings/${listingId}/edit`);
  return { error: null };
}
