// GST applicability for the cost-breakdown sheet. GST does NOT apply to ready-to-move
// resale residential (no input tax credit chain on a completed, OC-received unit);
// it DOES apply to under-construction residential and to commercial property.
//
// VERIFICATION NEEDED BEFORE LAUNCH: GST rates on real estate carry conditions (e.g.
// affordable-housing slabs, ITC eligibility, land-value abatement) that this
// simplified flat-rate model does not capture. Confirm the applicable rate and
// abatement treatment with a tax advisor before presenting this as final to a buyer.

import type { Database } from "@/lib/supabase/database.types";

type PropertyType = Database["public"]["Enums"]["property_type_enum"];
type PossessionStatus = Database["public"]["Enums"]["possession_status_enum"];

/** UNVERIFIED placeholder rate. Confirm current GST rate/abatement before launch. */
export const GST_RATE_UNDER_CONSTRUCTION_RESIDENTIAL = 0.05; // 5%, without ITC (commonly cited post-2019 rate)
/** UNVERIFIED placeholder rate. Confirm current GST rate before launch. */
export const GST_RATE_COMMERCIAL = 0.12; // 12%

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
