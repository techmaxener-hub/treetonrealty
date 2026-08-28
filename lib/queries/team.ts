import { supabase } from "@/lib/supabase/client";
import { getPublicMediaUrl } from "@/lib/supabase/storage";

export interface TeamMember {
  id: string;
  fullName: string;
  role: string;
  bio: string;
  photoUrl: string | null;
  photoAlt: string | null;
}

export async function getPublishedTeamMembers(): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("is_published", true)
    .order("display_order", { ascending: true });

  if (error) throw new Error(`getPublishedTeamMembers: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    fullName: row.full_name,
    role: row.role,
    bio: row.bio,
    photoUrl: row.photo_storage_path ? getPublicMediaUrl(row.photo_storage_path) : null,
    photoAlt: row.photo_alt_text,
  }));
}
