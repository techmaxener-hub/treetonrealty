import { supabase } from "@/lib/supabase/client";
import type { StampDutyRateInput } from "@/lib/stamp-duty";

export interface StampDutyRate extends StampDutyRateInput {
  state: string;
  isVerified: boolean;
  sourceNotes: string | null;
  womenDiscountNotes: string | null;
}

/** Active stamp duty rate for a state, or null if none is configured yet. */
export async function getStampDutyRateForState(state: string): Promise<StampDutyRate | null> {
  const { data, error } = await supabase
    .from("stamp_duty_rates")
    .select("*")
    .eq("state", state)
    .eq("is_active", true)
    .order("effective_from", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`getStampDutyRateForState: ${error.message}`);
  if (!data) return null;

  return {
    state: data.state,
    stampDutyPercent: data.stamp_duty_percent,
    registrationPercent: data.registration_percent,
    womenDiscountPercent: data.women_discount_percent,
    womenDiscountNotes: data.women_discount_notes,
    isVerified: data.is_verified,
    sourceNotes: data.source_notes,
  };
}

export async function getAllStampDutyRates(): Promise<StampDutyRate[]> {
  const { data, error } = await supabase
    .from("stamp_duty_rates")
    .select("*")
    .eq("is_active", true)
    .order("state", { ascending: true });

  if (error) throw new Error(`getAllStampDutyRates: ${error.message}`);

  return (data ?? []).map((row) => ({
    state: row.state,
    stampDutyPercent: row.stamp_duty_percent,
    registrationPercent: row.registration_percent,
    womenDiscountPercent: row.women_discount_percent,
    womenDiscountNotes: row.women_discount_notes,
    isVerified: row.is_verified,
    sourceNotes: row.source_notes,
  }));
}
