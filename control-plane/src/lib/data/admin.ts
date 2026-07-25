import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

export async function getSignupRequests(supabase: SupabaseClient<Database>, status?: "pending" | "approved" | "rejected") {
  let query = supabase.from("broker_signup_requests").select("*").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getBrokerInstances(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase.from("broker_instances").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getBrokerInstance(supabase: SupabaseClient<Database>, id: string) {
  const { data, error } = await supabase.from("broker_instances").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getProvisioningJobs(supabase: SupabaseClient<Database>, brokerInstanceId: string) {
  const { data, error } = await supabase
    .from("provisioning_jobs")
    .select("*")
    .eq("broker_instance_id", brokerInstanceId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getPlatformAdmins(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase.from("platform_admins").select("*").order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
