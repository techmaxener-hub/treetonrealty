import type { TypedSupabaseClient } from "@/lib/supabase/types";
import type { Tables } from "@/lib/types/database";
import { getTeamDirectory, type TeamMember } from "@/lib/data/team";

export type TaskListItem = Tables<"tasks"> & {
  assignee: TeamMember | null;
  contactName: string | null;
};

export async function getTasksList(supabase: TypedSupabaseClient): Promise<TaskListItem[]> {
  const [{ data: tasks, error }, team] = await Promise.all([
    supabase.from("tasks").select("*").order("due_at", { ascending: true }),
    getTeamDirectory(supabase),
  ]);
  if (error) throw error;
  if (!tasks?.length) return [];

  const memberByProfileId = new Map(team.map((m) => [m.profileId, m]));

  const leadIds = [...new Set(tasks.map((t) => t.lead_id).filter((id): id is string => id !== null))];
  const { data: leads } =
    leadIds.length > 0 ? await supabase.from("leads").select("id, contact_id").in("id", leadIds) : { data: [] };
  const contactIdByLeadId = new Map((leads ?? []).map((l) => [l.id, l.contact_id]));

  const contactIds = [...new Set([...contactIdByLeadId.values()])];
  const { data: contacts } =
    contactIds.length > 0 ? await supabase.from("contacts").select("id, full_name").in("id", contactIds) : { data: [] };
  const contactNameById = new Map((contacts ?? []).map((c) => [c.id, c.full_name]));

  return tasks.map((task) => {
    const contactId = task.lead_id ? contactIdByLeadId.get(task.lead_id) : undefined;
    return {
      ...task,
      assignee: memberByProfileId.get(task.assigned_to) ?? null,
      contactName: contactId ? (contactNameById.get(contactId) ?? null) : null,
    };
  });
}
