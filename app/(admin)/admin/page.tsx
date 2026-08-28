import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server-auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PIPELINE_STAGES } from "./leads/types";

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user?.id ?? "")
    .single();

  const { data: leads } = await supabase.from("leads").select("status");
  const counts = new Map<string, number>();
  for (const lead of leads ?? []) {
    counts.set(lead.status, (counts.get(lead.status) ?? 0) + 1);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-deep">
          Welcome back, {profile?.full_name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="text-sm text-muted-foreground">Here&apos;s your pipeline at a glance.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {PIPELINE_STAGES.map((stage) => (
          <Card key={stage}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {stage}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-slate-deep">
                {counts.get(stage) ?? 0}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Link
        href="/admin/leads"
        className="inline-block text-sm font-medium text-emerald-700 hover:underline"
      >
        Go to lead pipeline &rarr;
      </Link>
    </div>
  );
}
