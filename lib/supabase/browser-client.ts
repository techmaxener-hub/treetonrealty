import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
      "Set both in .env.local (see .env.local.example)."
  );
}

// Cookie-backed client for admin auth flows (Client Components only). Unlike
// lib/supabase/client.ts (localStorage session, used by the public site's
// anonymous reads), this stores the session in cookies so middleware.ts and
// server-side clients (lib/supabase/server-auth-client.ts) see the same session.
export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(supabaseUrl!, supabaseAnonKey!);
}
