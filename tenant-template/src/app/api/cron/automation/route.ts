import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { dispatchPendingAutomations } from "@/lib/automation/dispatch";

// Single entry point for the whole automation engine's "outbound" half:
// 1. run_automation_scans() -- the time-based Postgres scans (SLA nudge,
//    drip, birthday/anniversary, abandoned browse) that can't fire from a
//    trigger because they depend on "how much time has passed", not on a
//    row changing. Event-driven triggers (new_lead, post_site_visit,
//    price/status change, post_closing) already enqueued themselves via
//    enqueue_automation() at write time -- this just also sweeps those in
//    with everything else that's pending.
// 2. dispatchPendingAutomations() -- actually sends what's queued.
//
// Deliberately one combined endpoint rather than two: a broker's Vercel
// cron config only has to point at one URL, and "scan then dispatch" is
// the only ordering that makes sense anyway.
//
// CRON_SECRET is the placeholder credential here (per the brief, provider
// credentials/secrets are the things left as env-var placeholders) --
// Vercel Cron sends it as an Authorization: Bearer header automatically
// when configured; anything else must present the same header manually.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  const { data: scanResult, error: scanError } = await supabase.rpc("run_automation_scans");
  if (scanError) {
    return NextResponse.json({ error: `scan failed: ${scanError.message}` }, { status: 500 });
  }

  try {
    const dispatchResult = await dispatchPendingAutomations(supabase);
    return NextResponse.json({ scanned: scanResult, dispatched: dispatchResult });
  } catch (err) {
    return NextResponse.json(
      { scanned: scanResult, error: `dispatch failed: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic";
