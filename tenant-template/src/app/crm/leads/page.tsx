import { createClient } from "@/lib/supabase/server";
import { getLeadsBoard } from "@/lib/data/leads";
import { KanbanBoard } from "@/components/crm/kanban-board";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const supabase = await createClient();
  const { leads, team } = await getLeadsBoard(supabase);

  return <KanbanBoard initialLeads={leads} team={team} />;
}
