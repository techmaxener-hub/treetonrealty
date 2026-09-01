"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server-auth-client";
import type { Database } from "@/lib/supabase/database.types";

type SiteSettingsUpdate = Database["public"]["Tables"]["site_settings"]["Update"];

function str(formData: FormData, key: string): string | null {
  const raw = formData.get(key);
  if (raw === null) return null;
  const trimmed = String(raw).trim();
  return trimmed === "" ? null : trimmed;
}

function num(formData: FormData, key: string): number | null {
  const raw = formData.get(key);
  if (raw === null || raw === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export async function updateSiteSettings(formData: FormData) {
  const fields: SiteSettingsUpdate = {
    whatsapp_number: str(formData, "whatsapp_number"),
    rera_broker_reg_no: str(formData, "rera_broker_reg_no"),
    company_email: str(formData, "company_email"),
    company_address: str(formData, "company_address"),
    google_maps_embed_url: str(formData, "google_maps_embed_url"),
    instagram_url: str(formData, "instagram_url"),
    facebook_url: str(formData, "facebook_url"),
    linkedin_url: str(formData, "linkedin_url"),
    stat_transacted_value_inr: num(formData, "stat_transacted_value_inr"),
    stat_years_experience: num(formData, "stat_years_experience"),
    stat_verified_inventory_count: num(formData, "stat_verified_inventory_count"),
  };

  // RLS (site_settings_update_admin) is the real backstop here -- a non-admin
  // session's update simply affects zero rows rather than throwing, so we
  // check that explicitly instead of trusting a silent no-op as success.
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("site_settings")
    .update(fields)
    .eq("id", true)
    .select("id");

  if (error) return { error: error.message };
  if (!data || data.length === 0) {
    return { error: "You don't have permission to change site settings (admin only)." };
  }

  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
  return { error: null };
}
