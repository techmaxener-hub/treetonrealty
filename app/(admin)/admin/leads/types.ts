import type { Database } from "@/lib/supabase/database.types";

export type LeadStatus = Database["public"]["Enums"]["lead_status_enum"];
export type LeadSource = Database["public"]["Enums"]["lead_source_enum"];

export const PIPELINE_STAGES: LeadStatus[] = [
  "New",
  "Contacted",
  "Site Visit Scheduled",
  "Site Visit Done",
  "Token Paid",
  "Closed Won",
  "Closed Lost",
];

export type LeadActivityType = Database["public"]["Enums"]["lead_activity_type_enum"];

export type LeadActivityRow = {
  id: string;
  activity_type: LeadActivityType;
  content: string;
  created_at: string;
  actor: { full_name: string } | null;
};

export type LeadRow = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  source: LeadSource;
  status: LeadStatus;
  property_interest: string | null;
  assigned_to: string | null;
  created_at: string;
  assigned_profile: { full_name: string } | null;
};
