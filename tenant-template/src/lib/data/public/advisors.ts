import type { TypedSupabaseClient } from "@/lib/supabase/types";
import { getPublishedListings } from "@/lib/data/public/listings";

export async function getPublicAdvisors(supabase: TypedSupabaseClient) {
  const { data, error } = await supabase.from("advisor_profiles").select("*").eq("is_public", true).order("display_order");
  if (error) throw error;
  return data ?? [];
}

export async function getAdvisorBySlug(supabase: TypedSupabaseClient, slug: string) {
  const { data: advisor, error } = await supabase.from("advisor_profiles").select("*").eq("slug", slug).eq("is_public", true).maybeSingle();
  if (error) throw error;
  if (!advisor) return null;

  const listings = await getPublishedListings(supabase, { advisorId: advisor.profile_id });

  return { advisor, listings };
}
