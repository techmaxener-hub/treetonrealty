import type { TypedSupabaseClient } from "@/lib/supabase/types";
import type { Tables } from "@/lib/types/database";
import { getTeamDirectory, type TeamMember } from "@/lib/data/team";
import { getLocalitiesLite, type LocalityLite } from "@/lib/data/localities";

export type ListingListItem = Tables<"listings"> & {
  localityName: string | null;
  advisor: TeamMember | null;
  coverUrl: string | null;
};

export async function getListingsList(supabase: TypedSupabaseClient): Promise<ListingListItem[]> {
  const [{ data: listings, error }, localities, team] = await Promise.all([
    supabase.from("listings").select("*").order("created_at", { ascending: false }),
    getLocalitiesLite(supabase),
    getTeamDirectory(supabase),
  ]);
  if (error) throw error;
  if (!listings?.length) return [];

  const localityById = new Map(localities.map((l) => [l.id, l.name]));
  const memberByProfileId = new Map(team.map((m) => [m.profileId, m]));

  const listingIds = listings.map((l) => l.id);
  const { data: covers } = await supabase
    .from("listing_media")
    .select("listing_id, url")
    .in("listing_id", listingIds)
    .eq("is_cover", true);
  const coverByListingId = new Map((covers ?? []).map((c) => [c.listing_id, c.url]));

  return listings.map((listing) => ({
    ...listing,
    localityName: listing.locality_id ? (localityById.get(listing.locality_id) ?? null) : null,
    advisor: listing.advisor_id ? (memberByProfileId.get(listing.advisor_id) ?? null) : null,
    coverUrl: coverByListingId.get(listing.id) ?? null,
  }));
}

export async function getListingDetail(supabase: TypedSupabaseClient, listingId: string) {
  const { data: listing, error } = await supabase.from("listings").select("*").eq("id", listingId).single();
  if (error) throw error;

  const [
    { data: internal },
    { data: media },
    { data: owners },
    team,
    localities,
  ] = await Promise.all([
    // Not every role can see this row -- RLS returns null rather than an
    // error, and the UI just hides the Internal tab when it does.
    supabase.from("listing_internal").select("*").eq("listing_id", listingId).maybeSingle(),
    supabase.from("listing_media").select("*").eq("listing_id", listingId).order("display_order"),
    supabase.from("listing_owners").select("*").eq("listing_id", listingId),
    getTeamDirectory(supabase),
    getLocalitiesLite(supabase),
  ]);

  let ownerContacts: (Tables<"listing_owners"> & { contact: Tables<"contacts"> | null })[] = [];
  if (owners?.length) {
    const contactIds = owners.map((o) => o.contact_id);
    const { data: contacts } = await supabase.from("contacts").select("*").in("id", contactIds);
    const contactById = new Map((contacts ?? []).map((c) => [c.id, c]));
    ownerContacts = owners.map((o) => ({ ...o, contact: contactById.get(o.contact_id) ?? null }));
  }

  return {
    listing,
    internal: internal ?? null,
    media: media ?? [],
    owners: ownerContacts,
    team,
    localities,
  };
}

export type { LocalityLite };
