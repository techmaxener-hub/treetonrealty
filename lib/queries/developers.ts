import { supabase } from "@/lib/supabase/client";
import { getPublicMediaUrl } from "@/lib/supabase/storage";

export interface Developer {
  id: string;
  name: string;
  logoUrl: string;
  logoAlt: string;
  websiteUrl: string | null;
}

export async function getActiveDevelopers(): Promise<Developer[]> {
  const { data, error } = await supabase
    .from("developers")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) throw new Error(`getActiveDevelopers: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    logoUrl: getPublicMediaUrl(row.logo_storage_path),
    logoAlt: row.logo_alt_text,
    websiteUrl: row.website_url,
  }));
}
