import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

// For background/cron work only -- never imported from anything that
// serves a browser request. The service role key bypasses RLS entirely,
// which is correct here: the automation dispatcher acts as the system,
// not on behalf of any one authenticated user, and needs to read across
// leads/contacts/profiles regardless of whose downline they're in.
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must both be set to run background automation.");
  }

  return createSupabaseClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
