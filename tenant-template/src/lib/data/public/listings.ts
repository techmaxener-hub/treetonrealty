import type { TypedSupabaseClient } from "@/lib/supabase/types";
import type { Tables, ListingSegment, ListingStatus, ListingOfferType, PropertyTypeEnum } from "@/lib/types/database";

export type ListingAdvisor = {
  displayName: string;
  photoUrl: string | null;
  slug: string;
  publicPhone: string | null;
  publicWhatsapp: string | null;
};

export type PublicListingCard = Tables<"listings"> & {
  localityName: string | null;
  coverUrl: string | null;
  advisor: ListingAdvisor | null;
};

export type ListingFilters = {
  localityId?: string;
  advisorId?: string;
  propertyType?: PropertyTypeEnum;
  segment?: ListingSegment;
  status?: ListingStatus;
  offerType?: ListingOfferType;
  bhk?: number;
  priceMin?: number;
  priceMax?: number;
  search?: string;
};

// Every query here filters is_published explicitly, on top of what RLS
// already enforces for anon -- so a logged-in broker/employee browsing
// their own public site never sees a draft slip through just because
// their session happens to carry more privilege than a visitor's.
export async function getPublishedListings(supabase: TypedSupabaseClient, filters: ListingFilters = {}): Promise<PublicListingCard[]> {
  let query = supabase.from("listings").select("*").eq("is_published", true).order("published_at", { ascending: false });

  if (filters.localityId) query = query.eq("locality_id", filters.localityId);
  if (filters.advisorId) query = query.eq("advisor_id", filters.advisorId);
  if (filters.propertyType) query = query.eq("property_type", filters.propertyType);
  if (filters.segment) query = query.eq("segment", filters.segment);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.offerType) query = query.eq("offer_type", filters.offerType);
  if (filters.bhk) query = query.eq("bhk", filters.bhk);
  if (filters.priceMin) query = query.gte("price", filters.priceMin);
  if (filters.priceMax) query = query.lte("price", filters.priceMax);
  if (filters.search) query = query.filter("title->>en", "ilike", `%${filters.search}%`);

  const { data: listings, error } = await query;
  if (error) throw error;
  if (!listings?.length) return [];

  const advisorProfileIds = [...new Set(listings.map((l) => l.advisor_id).filter((id): id is string => Boolean(id)))];

  const [{ data: localities }, { data: covers }, { data: advisorProfiles }] = await Promise.all([
    supabase.from("localities").select("id, name"),
    supabase
      .from("listing_media")
      .select("listing_id, url")
      .in("listing_id", listings.map((l) => l.id))
      .eq("is_cover", true),
    advisorProfileIds.length > 0
      ? supabase
          .from("advisor_profiles")
          .select("profile_id, display_name, photo_url, slug, public_phone, public_whatsapp")
          .in("profile_id", advisorProfileIds)
          .eq("is_public", true)
      : Promise.resolve({ data: [] as Tables<"advisor_profiles">[] }),
  ]);

  const localityById = new Map((localities ?? []).map((l) => [l.id, l.name]));
  const coverByListingId = new Map((covers ?? []).map((c) => [c.listing_id, c.url]));
  const advisorByProfileId = new Map(
    (advisorProfiles ?? []).map((a) => [
      a.profile_id,
      {
        displayName: a.display_name,
        photoUrl: a.photo_url,
        slug: a.slug,
        publicPhone: a.public_phone,
        publicWhatsapp: a.public_whatsapp,
      } satisfies ListingAdvisor,
    ]),
  );

  return listings.map((listing) => ({
    ...listing,
    localityName: listing.locality_id ? (localityById.get(listing.locality_id) ?? null) : null,
    coverUrl: coverByListingId.get(listing.id) ?? null,
    advisor: listing.advisor_id ? (advisorByProfileId.get(listing.advisor_id) ?? null) : null,
  }));
}

export async function getFeaturedListings(supabase: TypedSupabaseClient, limit = 6): Promise<PublicListingCard[]> {
  const listings = await getPublishedListings(supabase, { status: "available" });
  return listings.slice(0, limit);
}

export async function getListingBySlug(supabase: TypedSupabaseClient, slug: string) {
  const { data: listing, error } = await supabase.from("listings").select("*").eq("slug", slug).eq("is_published", true).maybeSingle();
  if (error) throw error;
  if (!listing) return null;

  const [{ data: media }, { data: locality }, advisorResult] = await Promise.all([
    supabase.from("listing_media").select("*").eq("listing_id", listing.id).order("display_order"),
    listing.locality_id
      ? supabase.from("localities").select("id, name, slug").eq("id", listing.locality_id).maybeSingle()
      : Promise.resolve({ data: null }),
    listing.advisor_id
      ? supabase.from("advisor_profiles").select("*").eq("profile_id", listing.advisor_id).eq("is_public", true).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const similar = await getPublishedListings(supabase, {
    localityId: listing.locality_id ?? undefined,
    segment: listing.segment,
  });

  return {
    listing,
    media: media ?? [],
    locality: locality ?? null,
    advisor: advisorResult.data ?? null,
    similar: similar.filter((l) => l.id !== listing.id).slice(0, 4),
  };
}

export async function getListingsByIds(supabase: TypedSupabaseClient, ids: string[]) {
  if (ids.length === 0) return [];
  const { data, error } = await supabase.from("listings").select("*").in("id", ids).eq("is_published", true);
  if (error) throw error;

  const { data: media } = await supabase.from("listing_media").select("*").in("listing_id", ids);
  const mediaByListingId = new Map<string, Tables<"listing_media">[]>();
  for (const item of media ?? []) {
    const list = mediaByListingId.get(item.listing_id) ?? [];
    list.push(item);
    mediaByListingId.set(item.listing_id, list);
  }

  return (data ?? []).map((listing) => ({ listing, media: mediaByListingId.get(listing.id) ?? [] }));
}
