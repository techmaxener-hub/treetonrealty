import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { advanceProvisioning } from "@/lib/provisioning/orchestrator";

// Runs as the calling admin's own session, not a service role -- RLS
// (broker_instances_all / provisioning_jobs_all, both is_platform_admin()
// -gated) already grants a platform admin full access to these tables,
// so there's no privilege this route needs that the caller doesn't
// already have.
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: isAdmin } = await supabase.rpc("is_platform_admin");
  if (!isAdmin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { broker_instance_id?: string } | null;
  if (!body?.broker_instance_id) {
    return NextResponse.json({ error: "broker_instance_id is required" }, { status: 400 });
  }

  try {
    const result = await advanceProvisioning(supabase, body.broker_instance_id);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
