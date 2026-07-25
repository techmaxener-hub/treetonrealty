import type { TypedSupabaseClient } from "@/lib/supabase/types";
import { getPublishedListings } from "@/lib/data/public/listings";

export async function getPublishedLocalities(supabase: TypedSupabaseClient) {
  const { data, error } = await supabase.from("localities").select("*").eq("is_published", true).order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getLocalityBySlug(supabase: TypedSupabaseClient, slug: string) {
  const { data: locality, error } = await supabase.from("localities").select("*").eq("slug", slug).eq("is_published", true).maybeSingle();
  if (error) throw error;
  if (!locality) return null;

  const listings = await getPublishedListings(supabase, { localityId: locality.id });

  return { locality, listings };
}

// Every locality with at least one published listing -- used to build
// the locality picker on /listings without showing empty area pages.
export async function getLocalitiesLiteForFilter(supabase: TypedSupabaseClient) {
  const [{ data: localities }, { data: listings }] = await Promise.all([
    supabase.from("localities").select("id, name").eq("is_published", true),
    supabase.from("listings").select("locality_id").eq("is_published", true),
  ]);
  const usedIds = new Set((listings ?? []).map((l) => l.locality_id).filter(Boolean));
  return (localities ?? []).filter((l) => usedIds.has(l.id));
}
