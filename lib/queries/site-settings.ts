import { supabase } from "@/lib/supabase/client";

export interface SiteSettings {
  whatsappNumber: string | null;
  reraBrokerRegNo: string | null;
  companyEmail: string | null;
  companyAddress: string | null;
  googleMapsEmbedUrl: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  linkedinUrl: string | null;
  statTransactedValueInr: number | null;
  statYearsExperience: number | null;
  statVerifiedInventoryCount: number | null;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase.from("site_settings").select("*").single();
  if (error) throw new Error(`getSiteSettings: ${error.message}`);

  return {
    whatsappNumber: data.whatsapp_number,
    reraBrokerRegNo: data.rera_broker_reg_no,
    companyEmail: data.company_email,
    companyAddress: data.company_address,
    googleMapsEmbedUrl: data.google_maps_embed_url,
    instagramUrl: data.instagram_url,
    facebookUrl: data.facebook_url,
    linkedinUrl: data.linkedin_url,
    statTransactedValueInr: data.stat_transacted_value_inr,
    statYearsExperience: data.stat_years_experience,
    statVerifiedInventoryCount: data.stat_verified_inventory_count,
  };
}
