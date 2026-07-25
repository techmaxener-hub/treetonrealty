import type { TypedSupabaseClient } from "@/lib/supabase/types";
import type { Tables } from "@/lib/types/database";

export type TeamMemberWithPublicProfile = {
  profileId: string;
  fullName: string;
  role: string;
  advisorProfile: Tables<"advisor_profiles"> | null;
};

export async function getTeamWithPublicProfiles(supabase: TypedSupabaseClient): Promise<TeamMemberWithPublicProfile[]> {
  const [{ data: profiles, error }, { data: advisorProfiles }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, role").order("full_name"),
    supabase.from("advisor_profiles").select("*"),
  ]);
  if (error) throw error;

  const advisorByProfileId = new Map((advisorProfiles ?? []).map((a) => [a.profile_id, a]));

  return (profiles ?? []).map((p) => ({
    profileId: p.id,
    fullName: p.full_name,
    role: p.role,
    advisorProfile: advisorByProfileId.get(p.id) ?? null,
  }));
}
