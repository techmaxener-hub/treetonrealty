import type { Database } from "@/lib/supabase/database.types";

export type SiteSettingsRow = Database["public"]["Tables"]["site_settings"]["Row"];
