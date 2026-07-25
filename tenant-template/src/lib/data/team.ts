import type { TypedSupabaseClient } from "@/lib/supabase/types";
import type { ProfileRole } from "@/lib/types/database";

export type TeamMember = {
  profileId: string;
  fullName: string;
  role: ProfileRole;
};

// Every team member has a profiles row (created at signup) -- assignment
// targets profiles(id) directly, not the optional public advisor_profiles
// bio page, so this is a single plain query.
export async function getTeamDirectory(supabase: TypedSupabaseClient): Promise<TeamMember[]> {
  const { data, error } = await supabase.from("profiles").select("id, full_name, role").order("full_name");
  if (error) throw error;

  return (data ?? []).map((p) => ({ profileId: p.id, fullName: p.full_name, role: p.role }));
}
