import { createSupabaseServerClient } from "@/lib/supabase/server-auth-client";
import { LeadsBoard } from "./leads-board";
import type { LeadRow } from "./types";

export default async function LeadsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: leads, error } = await supabase
    .from("leads")
    .select(
      "id, name, phone, email, source, status, property_interest, assigned_to, created_at, assigned_profile:profiles(full_name)"
    )
    .order("created_at", { ascending: false })
    .returns<LeadRow[]>();

  return (
    <div className="flex h-full flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-deep">Lead Pipeline</h1>
        <p className="text-sm text-muted-foreground">Drag a card to move it to a new stage.</p>
      </div>

      {error ? (
        <p className="text-sm text-destructive">Couldn&apos;t load leads: {error.message}</p>
      ) : (
        <LeadsBoard leads={leads ?? []} />
      )}
    </div>
  );
}
