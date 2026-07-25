import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

// Thin wrappers around the report_* RPCs (migration 0011) -- each one is
// already scoped correctly for the calling user by the same RLS the rest
// of the CRM relies on, so there's nothing to filter or re-check here.

export async function getLeadFunnel(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase.rpc("report_lead_funnel");
  if (error) throw error;
  return data ?? [];
}

export async function getLeadSources(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase.rpc("report_lead_sources");
  if (error) throw error;
  return data ?? [];
}

export async function getLeadsOverTime(supabase: SupabaseClient<Database>, days = 30) {
  const { data, error } = await supabase.rpc("report_leads_over_time", { p_days: days });
  if (error) throw error;
  return data ?? [];
}

export async function getDealSummary(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase.rpc("report_deal_summary");
  if (error) throw error;
  return data ?? [];
}

export async function getDealsClosedOverTime(supabase: SupabaseClient<Database>, months = 6) {
  const { data, error } = await supabase.rpc("report_deals_closed_over_time", { p_months: months });
  if (error) throw error;
  return data ?? [];
}

export async function getListingStatusBreakdown(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase.rpc("report_listing_status_breakdown");
  if (error) throw error;
  return data ?? [];
}

export async function getListingSegmentBreakdown(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase.rpc("report_listing_segment_breakdown");
  if (error) throw error;
  return data ?? [];
}

export async function getTopViewedListings(supabase: SupabaseClient<Database>, limit = 5) {
  const { data, error } = await supabase.rpc("report_top_viewed_listings", { p_limit: limit });
  if (error) throw error;
  return data ?? [];
}

export async function getTeamPerformance(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase.rpc("report_team_performance");
  if (error) throw error;
  return data ?? [];
}

export async function getAutomationSummary(supabase: SupabaseClient<Database>, days = 30) {
  const { data, error } = await supabase.rpc("report_automation_summary", { p_days: days });
  if (error) throw error;
  return data ?? [];
}
