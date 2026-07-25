import type { TypedSupabaseClient } from "@/lib/supabase/types";

export async function getBrokerProfile(supabase: TypedSupabaseClient) {
  const { data } = await supabase.from("broker_profile").select("*").maybeSingle();
  return data;
}

export async function getReviewSummary(supabase: TypedSupabaseClient) {
  const { data } = await supabase.from("review_summary").select("*").maybeSingle();
  return data;
}
