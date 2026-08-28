import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
      "Set both in .env.local (see .env.local.example)."
  );
}

// Browser/client-side, RLS-scoped (anon key). Never import the service-role client
// (lib/supabase/server.ts) into a Client Component -- it bypasses RLS entirely.
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
