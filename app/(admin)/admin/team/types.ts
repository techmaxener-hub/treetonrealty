import type { Database } from "@/lib/supabase/database.types";

export type TeamMemberRow = Database["public"]["Tables"]["team_members"]["Row"];
