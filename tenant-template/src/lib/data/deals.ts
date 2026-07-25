import type { TypedSupabaseClient } from "@/lib/supabase/types";
import type { Tables } from "@/lib/types/database";
import { getTeamDirectory, type TeamMember } from "@/lib/data/team";

export type DealListItem = Tables<"deals"> & {
  listingTitle: string | null;
  buyerName: string | null;
  primaryAdvisor: TeamMember | null;
};

export async function getDealsList(supabase: TypedSupabaseClient): Promise<DealListItem[]> {
  const [{ data: deals, error }, team] = await Promise.all([
    supabase.from("deals").select("*").order("created_at", { ascending: false }),
    getTeamDirectory(supabase),
  ]);
  if (error) throw error;
  if (!deals?.length) return [];

  const memberByProfileId = new Map(team.map((m) => [m.profileId, m]));

  const listingIds = [...new Set(deals.map((d) => d.listing_id))];
  const { data: listings } = await supabase.from("listings").select("id, title").in("id", listingIds);
  const listingById = new Map((listings ?? []).map((l) => [l.id, l]));

  const buyerIds = [...new Set(deals.map((d) => d.buyer_contact_id))];
  const { data: buyers } = await supabase.from("contacts").select("id, full_name").in("id", buyerIds);
  const buyerById = new Map((buyers ?? []).map((b) => [b.id, b.full_name]));

  return deals.map((deal) => ({
    ...deal,
    listingTitle: (listingById.get(deal.listing_id)?.title as Record<string, string> | undefined)?.en ?? null,
    buyerName: buyerById.get(deal.buyer_contact_id) ?? null,
    primaryAdvisor: memberByProfileId.get(deal.primary_advisor_id) ?? null,
  }));
}

export async function getDealDetail(supabase: TypedSupabaseClient, dealId: string) {
  const { data: deal, error } = await supabase.from("deals").select("*").eq("id", dealId).single();
  if (error) throw error;

  const [{ data: listing }, { data: buyer }, { data: seller }, { data: documents }, team] = await Promise.all([
    supabase.from("listings").select("id, title, slug, price").eq("id", deal.listing_id).single(),
    supabase.from("contacts").select("*").eq("id", deal.buyer_contact_id).single(),
    deal.seller_contact_id
      ? supabase.from("contacts").select("*").eq("id", deal.seller_contact_id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from("deal_documents").select("*").eq("deal_id", dealId).order("created_at"),
    getTeamDirectory(supabase),
  ]);

  return {
    deal,
    listing: listing ?? null,
    buyer: buyer ?? null,
    seller: seller ?? null,
    documents: documents ?? [],
    team,
  };
}

// New-deal picker helper -- same ilike-search pattern as
// ListingOwnerSection's contact search, matching against the English
// title stored in the title jsonb column.
export async function searchListings(supabase: TypedSupabaseClient, query: string) {
  const { data, error } = await supabase
    .from("listings")
    .select("id, title, slug, price, advisor_id")
    .filter("title->>en", "ilike", `%${query}%`)
    .limit(8);
  if (error) throw error;
  return data ?? [];
}
