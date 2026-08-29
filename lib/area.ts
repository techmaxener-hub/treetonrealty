// Area unit conversion. The database stores only sq.ft (carpet_area_sqft); every
// other unit is derived here at render time -- never store multiple unit columns.
//
// RESEARCHED 2026-08-29 (secondary sources, not a primary land-record confirmation --
// see notes below): Bigha and Marla vary meaningfully by state/region, so both
// factors below are scoped to this business's actual markets (Ahmedabad/
// Gandhinagar) rather than a national default. See
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
  // North/Central Gujarat (Ahmedabad & Gandhinagar districts, this business's
  // actual markets) = 17,424 sq.ft. Cross-checked against two independent
  // secondary sources for both districts (indialandconverter.in, converteraz.com).
  // Gujarat has no single statewide Bigha -- South Gujarat districts (e.g.
  // Vadodara) use a materially different ~23,958 sq.ft figure, which does not
  // apply to this business's markets and is intentionally not included here.
  // Still not a primary Revenue Department confirmation -- treat as
  // research-grade, not legally authoritative.
  gujarat: 17424,
};

/** Conversion factor FROM 1 unit TO sq.ft. Bigha is handled separately (see convertArea) since it's region-dependent. */
const SQFT_FACTORS: Record<Exclude<AreaUnit, "bigha">, number> = {
  sqft: 1,
  sqyd: 9,
  guntha: 1089,
  acre: 43560,
  cent: 435.6,
  // Punjab/Haryana/Himachal Pradesh revenue-record standard (1 Marla = 9 Sarsahi
  // = 272.25 sq.ft), confirmed against a dedicated Indian civil-engineering
  // reference (civilsir.com) as distinct from Pakistan's DHA/Bahria Town Marla
  // variants (225 sq.ft), which are a different unit and must not be confused
  // with this one. Still research-grade, not a primary revenue-department
  // confirmation.
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
