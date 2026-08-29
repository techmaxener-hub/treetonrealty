import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server-auth-client";
import { Button } from "@/components/ui/button";
import { TeamTable } from "./team-table";

export default async function TeamPage() {
  const supabase = await createSupabaseServerClient();
  const { data: members, error } = await supabase
    .from("team_members")
    .select("*")
    .order("display_order", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-deep">Team</h1>
          <p className="text-sm text-muted-foreground">
            {members?.length ?? 0} member{members?.length === 1 ? "" : "s"} &middot; only
            &quot;Published&quot; profiles show on the public About page
          </p>
        </div>
        <Button asChild variant="primary">
          <Link href="/admin/team/new">+ Add Team Member</Link>
        </Button>
      </div>

      {error ? (
        <p className="text-sm text-destructive">Couldn&apos;t load team members: {error.message}</p>
      ) : (
        <TeamTable members={members ?? []} />
      )}
    </div>
  );
}
