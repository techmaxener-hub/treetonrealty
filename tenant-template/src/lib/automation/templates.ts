import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, LocalizedText } from "@/lib/types/database";

export async function getTemplate(supabase: SupabaseClient<Database>, key: string) {
  const { data, error } = await supabase.from("notification_templates").select("*").eq("key", key).maybeSingle();
  if (error) throw error;
  return data;
}

// {{variable}} substitution against a plain key/value map. Deliberately
// simple -- no conditionals, no loops -- because template copy is
// broker-editable free text (CRM automation settings), and a bigger
// templating language would be a bigger footgun for non-technical
// editing than a real feature.
export function renderTemplate(body: LocalizedText, language: "en" | "hi" | "gu", variables: Record<string, string>): string {
  const raw = body[language] ?? body.en ?? Object.values(body)[0] ?? "";
  return raw.replace(/\{\{(\w+)\}\}/g, (match, key: string) => variables[key] ?? "");
}
