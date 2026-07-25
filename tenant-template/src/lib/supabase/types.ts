import type { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/types/database";

// Deriving the type from the actual client factory, rather than writing
// SupabaseClient<Database> by hand, sidesteps a generic-resolution
// mismatch between @supabase/ssr's createServerClient/createBrowserClient
// and a manually-annotated SupabaseClient<Database> in this supabase-js
// version -- both factories share the same underlying construction, so
// this type is valid for either.
export type TypedSupabaseClient = ReturnType<typeof createBrowserClient<Database>>;
