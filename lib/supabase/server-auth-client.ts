import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
      "Set both in .env.local (see .env.local.example)."
  );
}

// RLS-scoped, cookie-aware client for Server Components, Server Actions, and Route
// Handlers in the admin CRM -- resolves auth.uid() from the request's session cookie
// so RLS policies (is_self_or_downline, is_admin, ...) apply exactly as they would
// for the signed-in user. Never use lib/supabase/server.ts (service-role, bypasses
// RLS) for anything driven by a logged-in user's request.
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component (no cookie-write access) -- safe to
          // ignore because middleware.ts refreshes the session on every request.
        }
      },
    },
  });
}
