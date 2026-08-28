import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type LeadSource = Database["public"]["Enums"]["lead_source_enum"];

export interface CreateLeadInput {
  name: string;
  phone: string;
  email?: string | null;
  message?: string | null;
  listingId?: string | null;
  propertyInterest?: string | null;
  source: LeadSource;
}

/**
 * Creates a lead using the service-role client (bypasses RLS). This is the only
 * sanctioned way to write to `leads` from outside the CMS -- see
 * supabase/migrations/20260828121600_leads_writes_server_only.sql for why there is
 * no public INSERT policy on this table.
 */
export async function createLead(input: CreateLeadInput): Promise<string> {
  const { data, error } = await supabaseAdmin
    .from("leads")
    .insert({
      name: input.name,
      phone: input.phone,
      email: input.email ?? null,
      message: input.message ?? null,
      listing_id: input.listingId ?? null,
      property_interest: input.propertyInterest ?? null,
      source: input.source,
    })
    .select("id")
    .single();

  if (error) throw new Error(`createLead: ${error.message}`);
  return data.id;
}

export class ValidationError extends Error {}

/** Shared name/phone validation for public lead-capture forms. */
export function validateContactFields(name: unknown, phone: unknown): { name: string; phone: string } {
  if (typeof name !== "string" || name.trim().length === 0 || name.trim().length > 200) {
    throw new ValidationError("Name is required and must be under 200 characters.");
  }
  const trimmedPhone = typeof phone === "string" ? phone.trim() : "";
  if (trimmedPhone.length < 6 || trimmedPhone.length > 20) {
    throw new ValidationError("A valid phone number is required.");
  }
  return { name: name.trim(), phone: trimmedPhone };
}
