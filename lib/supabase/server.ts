import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
      "Set both in .env.local (see .env.local.example)."
  );
}

// Service-role client: bypasses RLS entirely. Server-only (route handlers, server
// actions) -- e.g. minting a short-lived signed URL for a brochure PDF after a lead
// is captured. Never import this into a Client Component or expose the key to the
// browser bundle.
export const supabaseAdmin = createClient<Database>(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
