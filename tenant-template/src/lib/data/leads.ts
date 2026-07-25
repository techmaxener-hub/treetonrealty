import type { TypedSupabaseClient } from "@/lib/supabase/types";
import type { Tables } from "@/lib/types/database";
import { getTeamDirectory, type TeamMember } from "@/lib/data/team";

export type LeadBoardItem = Tables<"leads"> & {
  contact: Pick<Tables<"contacts">, "id" | "full_name" | "phone" | "whatsapp_number" | "potential_duplicate_of"> | null;
  assignedMember: TeamMember | null;
};

export async function getLeadsBoard(supabase: TypedSupabaseClient): Promise<{
  leads: LeadBoardItem[];
  team: TeamMember[];
}> {
  const [{ data: leads, error: leadsError }, team] = await Promise.all([
    supabase.from("leads").select("*").order("created_at", { ascending: false }),
    getTeamDirectory(supabase),
  ]);
  if (leadsError) throw leadsError;
  if (!leads?.length) return { leads: [], team };

  const contactIds = [...new Set(leads.map((l) => l.contact_id))];
  const { data: contacts, error: contactsError } = await supabase
    .from("contacts")
    .select("id, full_name, phone, whatsapp_number, potential_duplicate_of")
    .in("id", contactIds);
  if (contactsError) throw contactsError;

  const contactById = new Map(contacts?.map((c) => [c.id, c]) ?? []);
  const memberByProfileId = new Map(team.map((m) => [m.profileId, m]));

  const enriched: LeadBoardItem[] = leads.map((lead) => ({
    ...lead,
    contact: contactById.get(lead.contact_id) ?? null,
    assignedMember: lead.assigned_advisor_id ? (memberByProfileId.get(lead.assigned_advisor_id) ?? null) : null,
  }));

  return { leads: enriched, team };
}

export async function getLeadDetail(supabase: TypedSupabaseClient, leadId: string) {
  const { data: lead, error: leadError } = await supabase.from("leads").select("*").eq("id", leadId).single();
  if (leadError) throw leadError;

  const [{ data: contact, error: contactError }, { data: activity, error: activityError }, { data: tasks, error: tasksError }, team] =
    await Promise.all([
      supabase.from("contacts").select("*").eq("id", lead.contact_id).single(),
      supabase.from("activity_log").select("*").eq("lead_id", leadId).order("created_at", { ascending: false }),
      supabase.from("tasks").select("*").eq("lead_id", leadId).order("due_at", { ascending: true }),
      getTeamDirectory(supabase),
    ]);
  if (contactError) throw contactError;
  if (activityError) throw activityError;
  if (tasksError) throw tasksError;

  let listing: Pick<Tables<"listings">, "id" | "title" | "slug"> | null = null;
  if (lead.listing_id) {
    const { data } = await supabase.from("listings").select("id, title, slug").eq("id", lead.listing_id).maybeSingle();
    listing = data ?? null;
  }

  const memberByProfileId = new Map(team.map((m) => [m.profileId, m]));

  return {
    lead,
    contact,
    listing,
    activity: activity ?? [],
    tasks: tasks ?? [],
    team,
    memberByProfileId,
  };
}
