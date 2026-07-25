import type { TypedSupabaseClient } from "@/lib/supabase/types";

export type LocalityLite = { id: string; name: string };

// Full locality area-guide management (SEO content, publishing) is Step 6
// -- listings just need something to point at, so this is deliberately
// minimal: id + name only.
export async function getLocalitiesLite(supabase: TypedSupabaseClient): Promise<LocalityLite[]> {
  const { data, error } = await supabase.from("localities").select("id, name").order("name");
  if (error) throw error;
  return data ?? [];
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createLocality(supabase: TypedSupabaseClient, name: string): Promise<LocalityLite> {
  const { data, error } = await supabase
    .from("localities")
    .insert({ name, slug: slugify(name) })
    .select("id, name")
    .single();
  if (error) throw error;
  return data;
}
