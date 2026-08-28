import { supabase } from "@/lib/supabase/client";
import { getPublicMediaUrl } from "@/lib/supabase/storage";
import type { ListingCard } from "@/lib/queries/listings";

export interface Collection {
  id: string;
  slug: string;
  title: string;
  introRichtext: string;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
}

export interface CollectionWithListings extends Collection {
  listings: ListingCard[];
}

const LISTING_CARD_COLUMNS = `
  id, slug, ref_code, title, property_type, status, locality, city, state,
  latitude, longitude, bhk, bathrooms, carpet_area_sqft, price_inr,
  possession_status, possession_date, is_rera_verified, created_at,
  listing_images ( storage_path, alt_text, display_order )
`;

interface ListingCardRow {
  id: string;
  slug: string;
  ref_code: string;
  title: string;
  property_type: ListingCard["propertyType"];
  status: ListingCard["status"];
  locality: string;
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  bhk: number | null;
  bathrooms: number | null;
  carpet_area_sqft: number;
  price_inr: number;
  possession_status: ListingCard["possessionStatus"];
  possession_date: string | null;
  is_rera_verified: boolean;
  listing_images: { storage_path: string; alt_text: string; display_order: number }[];
}

function toListingCard(row: ListingCardRow): ListingCard {
  const primaryImage = [...row.listing_images].sort((a, b) => a.display_order - b.display_order)[0];
  return {
    id: row.id,
    slug: row.slug,
    refCode: row.ref_code,
    title: row.title,
    propertyType: row.property_type,
    status: row.status,
    locality: row.locality,
    city: row.city,
    state: row.state,
    latitude: row.latitude,
    longitude: row.longitude,
    bhk: row.bhk,
    bathrooms: row.bathrooms,
    carpetAreaSqft: row.carpet_area_sqft,
    priceInr: row.price_inr,
    possessionStatus: row.possession_status,
    possessionDate: row.possession_date,
    isReraVerified: row.is_rera_verified,
    primaryImageUrl: primaryImage ? getPublicMediaUrl(primaryImage.storage_path) : null,
    primaryImageAlt: primaryImage?.alt_text ?? row.title,
  };
}

export async function getCollectionBySlug(slug: string): Promise<CollectionWithListings | null> {
  const { data, error } = await supabase
    .from("collections")
    .select(
      `id, slug, title, intro_richtext, cover_image_storage_path, cover_image_alt_text,
       collection_listings ( display_order, listings ( ${LISTING_CARD_COLUMNS} ) )`
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) throw new Error(`getCollectionBySlug: ${error.message}`);
  if (!data) return null;

  const rows = data.collection_listings as unknown as {
    display_order: number;
    listings: ListingCardRow | null;
  }[];

  const listings = rows
    .filter((row) => row.listings !== null)
    .sort((a, b) => a.display_order - b.display_order)
    .map((row) => toListingCard(row.listings as ListingCardRow));

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    introRichtext: data.intro_richtext,
    coverImageUrl: data.cover_image_storage_path ? getPublicMediaUrl(data.cover_image_storage_path) : null,
    coverImageAlt: data.cover_image_alt_text,
    listings,
  };
}

export async function getAllCollectionSlugs(): Promise<string[]> {
  const { data, error } = await supabase.from("collections").select("slug").eq("is_published", true);
  if (error) throw new Error(`getAllCollectionSlugs: ${error.message}`);
  return (data ?? []).map((row) => row.slug);
}

export async function getPublishedCollections(): Promise<Collection[]> {
  const { data, error } = await supabase
    .from("collections")
    .select("id, slug, title, intro_richtext, cover_image_storage_path, cover_image_alt_text")
    .eq("is_published", true)
    .order("display_order", { ascending: true });

  if (error) throw new Error(`getPublishedCollections: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    introRichtext: row.intro_richtext,
    coverImageUrl: row.cover_image_storage_path ? getPublicMediaUrl(row.cover_image_storage_path) : null,
    coverImageAlt: row.cover_image_alt_text,
  }));
}
