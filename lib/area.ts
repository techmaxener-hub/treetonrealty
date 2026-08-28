// Area unit conversion. The database stores only sq.ft (carpet_area_sqft); every
// other unit is derived here at render time -- never store multiple unit columns.
//
// VERIFICATION NEEDED BEFORE LAUNCH: Bigha and Marla vary meaningfully by state/
// region. The factors below are the commonly-cited Gujarat Bigha and Punjab/North
// India Marla values, but must be confirmed against local/state land-record
// convention before this converter is treated as authoritative. See
// supabase/migrations/20260828121300_stamp_duty_rates.sql for the equivalent
// caveat on stamp duty rates.

export type AreaUnit =
  | "sqft"
  | "sqyd"
  | "guntha"
  | "bigha"
  | "acre"
  | "cent"
  | "marla"
  | "sqm";

export const AREA_UNIT_LABELS: Record<AreaUnit, string> = {
  sqft: "Sq.Ft",
  sqyd: "Sq.Yard (Gaj)",
  guntha: "Guntha",
  bigha: "Bigha",
  acre: "Acre",
  cent: "Cent",
  marla: "Marla",
  sqm: "Sq.Meter",
};

/** State selector for Bigha, which varies by state -- do not assume one value nationally. */
export type BighaRegion = "gujarat";

const BIGHA_SQFT_BY_REGION: Record<BighaRegion, number> = {
  // UNVERIFIED: commonly-cited Gujarat Bigha figure. Confirm with a local
  // revenue-department source before launch.
  gujarat: 17427,
};

/** Conversion factor FROM 1 unit TO sq.ft. Bigha is handled separately (see convertArea) since it's region-dependent. */
const SQFT_FACTORS: Record<Exclude<AreaUnit, "bigha">, number> = {
  sqft: 1,
  sqyd: 9,
  guntha: 1089,
  acre: 43560,
  cent: 435.6,
  // UNVERIFIED: Punjab/North India standard. Confirm regional variant before launch.
  marla: 272.25,
  sqm: 10.7639,
};

export interface ConvertAreaOptions {
  bighaRegion?: BighaRegion;
}

/** Converts a sq.ft area value to the target unit. */
export function convertArea(
  sqft: number,
  targetUnit: AreaUnit,
  options: ConvertAreaOptions = {}
): number {
  if (!Number.isFinite(sqft) || sqft < 0) {
    throw new Error(`convertArea: sqft must be a non-negative finite number, got ${sqft}`);
  }

  if (targetUnit === "bigha") {
    const region = options.bighaRegion ?? "gujarat";
    const factor = BIGHA_SQFT_BY_REGION[region];
    if (factor === undefined) {
      throw new Error(`convertArea: no Bigha factor registered for region "${region}"`);
    }
    return sqft / factor;
  }

  return sqft / SQFT_FACTORS[targetUnit];
}

/** Formats a sq.ft area value in the target unit, e.g. "2,450 Sq.Ft" or "42.50 Guntha". */
export function formatArea(
  sqft: number,
  targetUnit: AreaUnit,
  options: ConvertAreaOptions = {}
): string {
  const value = convertArea(sqft, targetUnit, options);
  const decimals = targetUnit === "sqft" ? 0 : 2;
  const rounded = Number(value.toFixed(decimals));
  const formatted = rounded.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
  return `${formatted} ${AREA_UNIT_LABELS[targetUnit]}`;
}
