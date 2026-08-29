// GST applicability for the cost-breakdown sheet. GST does NOT apply to ready-to-move
// resale residential (no input tax credit chain on a completed, OC-received unit);
// it DOES apply to under-construction residential and to commercial property.
//
// RESEARCHED 2026-08-29 against multiple secondary sources (busy.in, homefirstindia.com,
// brigadegroup.com, razorpay.com, vakilsearch.com): the 5% / 12% / 0% rates below have
// been stable since April 2019 and were NOT changed by the September 2025 "GST 2.0" rate
// rationalization -- that reform cut GST on construction INPUTS (e.g. cement 28%->18%)
// and works contracts, not the buyer-facing property sale rate modeled here.
//
// KNOWN SIMPLIFICATION, STILL UNMODELED: a 1% "affordable housing" GST rate applies
// instead of 5% when BOTH conditions hold -- carpet area <= 90 sqm (or <= 60 sqm in the
// GST-defined metros: Bengaluru, Chennai, Delhi NCR, Hyderabad, Kolkata, Mumbai/MMR --
// Ahmedabad/Gandhinagar are NOT on this list, so the 90 sqm threshold would apply here)
// AND price <= Rs 45 lakh. Not implemented because it structurally cannot occur in this
// business's current inventory (all listings priced well above Rs 45L), but it is a real
// gap if a lower-priced under-construction listing is ever added -- see PropertyType/
// PossessionStatus params below, which would need a carpet-area + price check added.
//
// VERIFICATION NEEDED BEFORE LAUNCH: still needs a tax advisor's sign-off on ITC
// eligibility and land-value abatement treatment before being presented as final to a
// buyer -- research-grade sourcing is not a substitute for professional review.

import type { Database } from "@/lib/supabase/database.types";

type PropertyType = Database["public"]["Enums"]["property_type_enum"];
type PossessionStatus = Database["public"]["Enums"]["possession_status_enum"];

/** Confirmed current rate (stable since April 2019, unaffected by Sept 2025 GST 2.0). Excludes the unmodeled 1% affordable-housing carve-out -- see file header. */
export const GST_RATE_UNDER_CONSTRUCTION_RESIDENTIAL = 0.05; // 5%, without ITC
/** Confirmed current rate (stable since April 2019, unaffected by Sept 2025 GST 2.0). */
export const GST_RATE_COMMERCIAL = 0.12; // 12%, with ITC

export interface GstApplicability {
  applies: boolean;
  rate: number;
  reason: string;
}

const COMMERCIAL_TYPES: PropertyType[] = ["Commercial", "Office", "Shop"];

/** Determines whether GST applies to a listing's base price, and at what rate. */
export function getGstApplicability(
  propertyType: PropertyType,
  possessionStatus: PossessionStatus
): GstApplicability {
  if (COMMERCIAL_TYPES.includes(propertyType)) {
    return {
      applies: true,
      rate: GST_RATE_COMMERCIAL,
      reason: "GST applies to commercial property regardless of possession status.",
    };
  }

  if (possessionStatus === "Under Construction") {
    return {
      applies: true,
      rate: GST_RATE_UNDER_CONSTRUCTION_RESIDENTIAL,
      reason: "GST applies to under-construction residential property.",
    };
  }

  return {
    applies: false,
    rate: 0,
    reason: "GST does not apply to ready-to-move resale residential property.",
  };
}

/** GST amount in rupees for a given base price, given the listing's type/possession status. */
export function calculateGstAmount(
  basePriceInr: number,
  propertyType: PropertyType,
  possessionStatus: PossessionStatus
): number {
  if (!Number.isFinite(basePriceInr) || basePriceInr < 0) {
    throw new Error(`calculateGstAmount: basePriceInr must be a non-negative finite number, got ${basePriceInr}`);
  }
  const { applies, rate } = getGstApplicability(propertyType, possessionStatus);
  return applies ? Math.round(basePriceInr * rate) : 0;
}
