import { supabase } from "@/lib/supabase/client";
import { getPublicMediaUrl } from "@/lib/supabase/storage";
import type { Database } from "@/lib/supabase/database.types";

export type PropertyType = Database["public"]["Enums"]["property_type_enum"];
export type FurnishingStatus = Database["public"]["Enums"]["furnishing_status_enum"];
export type PossessionStatus = Database["public"]["Enums"]["possession_status_enum"];
export type FacingDirection = Database["public"]["Enums"]["facing_direction_enum"];
export type VastuScore = Database["public"]["Enums"]["vastu_score_enum"];
export type ListingStatus = Database["public"]["Enums"]["listing_status_enum"];

const LISTING_CARD_COLUMNS = `
  id, slug, ref_code, title, property_type, status, locality, city, state,
  latitude, longitude, bhk, bathrooms, carpet_area_sqft, price_inr,
  possession_status, possession_date, is_rera_verified, created_at,
  listing_images ( storage_path, alt_text, display_order )
`;

export interface ListingCard {
  id: string;
  slug: string;
  refCode: string;
  title: string;
  propertyType: PropertyType;
  status: ListingStatus;
  locality: string;
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  bhk: number | null;
  bathrooms: number | null;
  carpetAreaSqft: number;
  priceInr: number;
  possessionStatus: PossessionStatus;
  possessionDate: string | null;
  isReraVerified: boolean;
  primaryImageUrl: string | null;
  primaryImageAlt: string;
}

type ListingCardRow = {
  id: string;
  slug: string;
  ref_code: string;
  title: string;
  property_type: PropertyType;
  status: ListingStatus;
  locality: string;
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  bhk: number | null;
  bathrooms: number | null;
  carpet_area_sqft: number;
  price_inr: number;
  possession_status: PossessionStatus;
  possession_date: string | null;
  is_rera_verified: boolean;
  created_at: string;
  listing_images: { storage_path: string; alt_text: string; display_order: number }[];
};

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

export interface ListingFilters {
  localities?: string[];
  propertyTypes?: PropertyType[];
  bhk?: number[];
  minPrice?: number;
  maxPrice?: number;
  furnishing?: FurnishingStatus[];
  possessionStatus?: PossessionStatus[];
  facingDirection?: FacingDirection[];
  reraVerifiedOnly?: boolean;
}

const PAGE_SIZE = 12;

export interface ListingPage {
  items: ListingCard[];
  totalCount: number;
  nextCursor: string | null;
}

/**
 * Cursor-based pagination keyed on (created_at, id) for stable keyset pagination --
 * avoids the performance cliff of OFFSET pagination at scale. The cursor encodes
 * "give me rows strictly after this (created_at, id) pair" in descending order.
 */
export async function getListings(
  filters: ListingFilters = {},
  cursor: string | null = null
): Promise<ListingPage> {
  let query = supabase
    .from("listings")
    .select(LISTING_CARD_COLUMNS, { count: "exact" })
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(PAGE_SIZE);

  if (filters.localities?.length) query = query.in("locality", filters.localities);
  if (filters.propertyTypes?.length) query = query.in("property_type", filters.propertyTypes);
  if (filters.bhk?.length) query = query.in("bhk", filters.bhk);
  if (filters.minPrice !== undefined) query = query.gte("price_inr", filters.minPrice);
  if (filters.maxPrice !== undefined) query = query.lte("price_inr", filters.maxPrice);
  if (filters.furnishing?.length) query = query.in("furnishing_status", filters.furnishing);
  if (filters.possessionStatus?.length) query = query.in("possession_status", filters.possessionStatus);
  if (filters.facingDirection?.length) query = query.in("facing_direction", filters.facingDirection);
  if (filters.reraVerifiedOnly) query = query.eq("is_rera_verified", true);

  if (cursor) {
    const [cursorCreatedAt, cursorId] = decodeCursor(cursor);
    query = query.or(
      `created_at.lt.${cursorCreatedAt},and(created_at.eq.${cursorCreatedAt},id.lt.${cursorId})`
    );
  }

  const { data, error, count } = await query.returns<ListingCardRow[]>();
  if (error) throw new Error(`getListings: ${error.message}`);

  const items = (data ?? []).map(toListingCard);
  const last = data && data.length === PAGE_SIZE ? data[data.length - 1] : null;

  return {
    items,
    totalCount: count ?? items.length,
    nextCursor: last ? encodeCursor(last.created_at, last.id) : null,
  };
}

// btoa/atob (not Buffer) so this cursor codec works identically in Server Components,
// route handlers, and the browser (React Query's client-side "load more" pagination).
function encodeCursor(createdAt: string, id: string): string {
  return btoa(`${createdAt}|${id}`);
}

function decodeCursor(cursor: string): [string, string] {
  const [createdAt, id] = atob(cursor).split("|");
  return [createdAt, id];
}

/** Distinct localities among currently-published listings, for the filter dropdown. */
export async function getActiveLocalities(): Promise<string[]> {
  const { data, error } = await supabase
    .from("listings")
    .select("locality")
    .eq("is_published", true);
  if (error) throw new Error(`getActiveLocalities: ${error.message}`);
  return Array.from(new Set((data ?? []).map((row) => row.locality))).sort();
}

export interface LocalitySummary {
  locality: string;
  activeCount: number;
  imageUrl: string | null;
  imageAlt: string;
}

/** One representative listing image + active-listing count per locality, for the home page corridor showcase. */
export async function getLocalitySummaries(): Promise<LocalitySummary[]> {
  const { data, error } = await supabase
    .from("listings")
    .select(
      "locality, status, listing_images ( storage_path, alt_text, display_order )"
    )
    .eq("is_published", true)
    .returns<
      { locality: string; status: ListingStatus; listing_images: { storage_path: string; alt_text: string; display_order: number }[] }[]
    >();

  if (error) throw new Error(`getLocalitySummaries: ${error.message}`);

  const byLocality = new Map<string, LocalitySummary>();
  for (const row of data ?? []) {
    const existing = byLocality.get(row.locality);
    const isActive = row.status === "Active";
    if (!existing) {
      const primaryImage = [...row.listing_images].sort((a, b) => a.display_order - b.display_order)[0];
      byLocality.set(row.locality, {
        locality: row.locality,
        activeCount: isActive ? 1 : 0,
        imageUrl: primaryImage ? getPublicMediaUrl(primaryImage.storage_path) : null,
        imageAlt: primaryImage?.alt_text ?? row.locality,
      });
    } else if (isActive) {
      existing.activeCount += 1;
    }
  }

  return Array.from(byLocality.values()).sort((a, b) => b.activeCount - a.activeCount);
}

// ---------------------------------------------------------------------------
// Listing detail (PDP)
// ---------------------------------------------------------------------------

const LISTING_DETAIL_COLUMNS = `
  *,
  listing_images ( id, storage_path, alt_text, room_category, display_order ),
  listing_floor_plans ( id, storage_path, title, alt_text, plan_type, display_order ),
  listing_amenities ( amenities ( id, name ) ),
  listing_legal_status ( *, legal_title_types ( code, label ) )
`;

export interface ListingImage {
  id: string;
  url: string;
  alt: string;
  roomCategory: Database["public"]["Enums"]["room_category_enum"];
  displayOrder: number;
}

export interface ListingFloorPlan {
  id: string;
  url: string;
  title: string;
  alt: string;
  planType: Database["public"]["Enums"]["floor_plan_type_enum"];
  displayOrder: number;
}

export interface ListingLegalStatus {
  titleTypeCode: string;
  titleTypeLabel: string;
  ocStatus: Database["public"]["Enums"]["certificate_status_enum"];
  ocDate: string | null;
  ccStatus: Database["public"]["Enums"]["certificate_status_enum"];
  ccDate: string | null;
  projectReraNumber: string | null;
  projectReraVerificationUrl: string | null;
}

export interface ListingDetail extends ListingCard {
  description: string;
  address: string | null;
  builtUpAreaSqft: number | null;
  parkingChargesInr: number | null;
  furnishingStatus: FurnishingStatus | null;
  facingDirection: FacingDirection | null;
  vastuScore: VastuScore | null;
  virtualTourUrl: string | null;
  brochureStoragePath: string | null;
  images: ListingImage[];
  floorPlans: ListingFloorPlan[];
  amenities: string[];
  legalStatus: ListingLegalStatus | null;
}

interface ListingDetailRow extends ListingCardRow {
  description: string;
  address: string | null;
  built_up_area_sqft: number | null;
  parking_charges_inr: number | null;
  furnishing_status: FurnishingStatus | null;
  facing_direction: FacingDirection | null;
  vastu_score: VastuScore | null;
  virtual_tour_url: string | null;
  brochure_storage_path: string | null;
  listing_images: {
    id: string;
    storage_path: string;
    alt_text: string;
    room_category: Database["public"]["Enums"]["room_category_enum"];
    display_order: number;
  }[];
  listing_floor_plans: {
    id: string;
    storage_path: string;
    title: string;
    alt_text: string;
    plan_type: Database["public"]["Enums"]["floor_plan_type_enum"];
    display_order: number;
  }[];
  listing_amenities: { amenities: { id: string; name: string } | null }[];
  listing_legal_status:
    | (Database["public"]["Tables"]["listing_legal_status"]["Row"] & {
        legal_title_types: { code: string; label: string } | null;
      })
    | null;
}

export async function getListingBySlug(slug: string): Promise<ListingDetail | null> {
  const { data, error } = await supabase
    .from("listings")
    .select(LISTING_DETAIL_COLUMNS)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle()
    .returns<ListingDetailRow>();

  if (error) throw new Error(`getListingBySlug: ${error.message}`);
  if (!data) return null;

  const legal = data.listing_legal_status;

  return {
    ...toListingCard(data),
    description: data.description,
    address: data.address,
    builtUpAreaSqft: data.built_up_area_sqft,
    parkingChargesInr: data.parking_charges_inr,
    furnishingStatus: data.furnishing_status,
    facingDirection: data.facing_direction,
    vastuScore: data.vastu_score,
    virtualTourUrl: data.virtual_tour_url,
    brochureStoragePath: data.brochure_storage_path,
    images: [...data.listing_images]
      .sort((a, b) => a.display_order - b.display_order)
      .map((img) => ({
        id: img.id,
        url: getPublicMediaUrl(img.storage_path),
        alt: img.alt_text,
        roomCategory: img.room_category,
        displayOrder: img.display_order,
      })),
    floorPlans: [...data.listing_floor_plans]
      .sort((a, b) => a.display_order - b.display_order)
      .map((fp) => ({
        id: fp.id,
        url: getPublicMediaUrl(fp.storage_path),
        title: fp.title,
        alt: fp.alt_text,
        planType: fp.plan_type,
        displayOrder: fp.display_order,
      })),
    amenities: data.listing_amenities
      .map((row) => row.amenities?.name)
      .filter((name): name is string => Boolean(name))
      .sort(),
    legalStatus: legal
      ? {
          titleTypeCode: legal.title_type_code,
          titleTypeLabel: legal.legal_title_types?.label ?? legal.title_type_code,
          ocStatus: legal.oc_status,
          ocDate: legal.oc_date,
          ccStatus: legal.cc_status,
          ccDate: legal.cc_date,
          projectReraNumber: legal.project_rera_number,
          projectReraVerificationUrl: legal.project_rera_verification_url,
        }
      : null,
  };
}

/** Similar listings: same locality and a nearby budget band, excluding the current one. */
export async function getSimilarListings(listing: ListingDetail, limit = 3): Promise<ListingCard[]> {
  const bandLow = Math.round(listing.priceInr * 0.7);
  const bandHigh = Math.round(listing.priceInr * 1.3);

  const { data, error } = await supabase
    .from("listings")
    .select(LISTING_CARD_COLUMNS)
    .eq("is_published", true)
    .eq("locality", listing.locality)
    .neq("id", listing.id)
    .gte("price_inr", bandLow)
    .lte("price_inr", bandHigh)
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<ListingCardRow[]>();

  if (error) throw new Error(`getSimilarListings: ${error.message}`);
  return (data ?? []).map(toListingCard);
}

export async function getAllListingSlugs(): Promise<string[]> {
  const { data, error } = await supabase.from("listings").select("slug").eq("is_published", true);
  if (error) throw new Error(`getAllListingSlugs: ${error.message}`);
  return (data ?? []).map((row) => row.slug);
}
