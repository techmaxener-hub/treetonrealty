import type { TypedSupabaseClient } from "@/lib/supabase/types";

export async function getPublishedTestimonials(supabase: TypedSupabaseClient) {
  const { data, error } = await supabase.from("testimonials").select("*").eq("is_published", true).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
