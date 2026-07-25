import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import { STEP_ORDER, STEP_RUNNERS } from "@/lib/provisioning/steps";

// Advances one broker_instance by exactly one provisioning step: finds
// the earliest step (in STEP_ORDER) that isn't 'done' yet, runs it, and
// records the outcome. Failed steps are safe to advance again -- calling
// this again just retries the same step, since it's still the earliest
// non-done one.
export async function advanceProvisioning(supabase: SupabaseClient<Database>, brokerInstanceId: string) {
  const { data: broker, error: brokerError } = await supabase
    .from("broker_instances")
    .select("*")
    .eq("id", brokerInstanceId)
    .single();
  if (brokerError) throw brokerError;

  const { data: jobs, error: jobsError } = await supabase
    .from("provisioning_jobs")
    .select("*")
    .eq("broker_instance_id", brokerInstanceId);
  if (jobsError) throw jobsError;

  const jobByStep = new Map((jobs ?? []).map((j) => [j.step, j]));
  const nextStep = STEP_ORDER.find((step) => jobByStep.get(step)?.status !== "done");

  if (!nextStep) {
    return { finished: true, step: null as string | null };
  }

  const job = jobByStep.get(nextStep);
  if (!job) throw new Error(`provisioning_jobs is missing a row for step "${nextStep}" -- was it created via approve_broker_signup?`);

  await supabase.from("provisioning_jobs").update({ status: "running", started_at: new Date().toISOString() }).eq("id", job.id);

  const runner = STEP_RUNNERS[nextStep];
  let result;
  try {
    result = await runner(broker);
  } catch (err) {
    result = { success: false, log: err instanceof Error ? err.message : String(err) };
  }

  await supabase
    .from("provisioning_jobs")
    .update({
      status: result.success ? "done" : "failed",
      log: result.log,
      finished_at: new Date().toISOString(),
    })
    .eq("id", job.id);

  if (result.success && "patch" in result && result.patch) {
    await supabase.from("broker_instances").update(result.patch).eq("id", brokerInstanceId);
  }

  if (result.success && nextStep === "done") {
    await supabase
      .from("broker_instances")
      .update({ status: "active", provisioned_at: new Date().toISOString() })
      .eq("id", brokerInstanceId);
  }

  return { finished: false, step: nextStep, success: result.success, log: result.log };
}
