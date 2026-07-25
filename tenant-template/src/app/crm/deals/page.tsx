import { createClient } from "@/lib/supabase/server";
import { getDealsList } from "@/lib/data/deals";
import { getTeamDirectory } from "@/lib/data/team";
import { DealsBoard } from "@/components/crm/deals-board";

export const dynamic = "force-dynamic";

export default async function DealsPage() {
  const supabase = await createClient();
  const [deals, team] = await Promise.all([getDealsList(supabase), getTeamDirectory(supabase)]);

  return <DealsBoard initialDeals={deals} team={team} />;
}
