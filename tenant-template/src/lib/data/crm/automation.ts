import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

export async function getAutomationRules(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase.from("automation_rules").select("*").order("trigger_type");
  if (error) throw error;
  return data ?? [];
}

export async function getNotificationTemplates(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase.from("notification_templates").select("*").order("key");
  if (error) throw error;
  return data ?? [];
}
