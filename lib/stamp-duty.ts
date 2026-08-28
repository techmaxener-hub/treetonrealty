// Pure stamp duty / registration math, given a rate row already fetched from the
// admin-editable stamp_duty_rates table (see supabase/migrations/20260828121300_*.sql
// and lib/queries/stamp-duty.ts). Kept separate from the DB fetch so it's independently
// unit-testable and reusable by both the PDP cost-breakdown sheet and the standalone
// /calculators/stamp-duty page.

export interface StampDutyRateInput {
  stampDutyPercent: number;
  registrationPercent: number;
  womenDiscountPercent?: number | null;
}

export interface StampDutyBreakdown {
  basePrice: number;
  stampDutyPercent: number;
  stampDutyAmount: number;
  registrationPercent: number;
  registrationAmount: number;
  total: number;
  womenDiscountApplied: boolean;
  womenDiscountAmount: number;
}

export interface CalculateStampDutyOptions {
  /** Apply the women-buyer discount, where the rate row defines one (e.g. Delhi). */
  isWomanSoleOrCoOwner?: boolean;
}

export function calculateStampDuty(
  basePrice: number,
  rate: StampDutyRateInput,
  options: CalculateStampDutyOptions = {}
): StampDutyBreakdown {
  if (!Number.isFinite(basePrice) || basePrice < 0) {
    throw new Error(`calculateStampDuty: basePrice must be a non-negative finite number, got ${basePrice}`);
  }
  if (rate.stampDutyPercent < 0 || rate.registrationPercent < 0) {
    throw new Error("calculateStampDuty: rate percentages must be non-negative");
  }

  const womenDiscountApplied = Boolean(options.isWomanSoleOrCoOwner && rate.womenDiscountPercent);
  const effectiveStampDutyPercent = womenDiscountApplied
    ? Math.max(rate.stampDutyPercent - (rate.womenDiscountPercent ?? 0), 0)
    : rate.stampDutyPercent;

  const stampDutyAmount = Math.round((basePrice * effectiveStampDutyPercent) / 100);
  const registrationAmount = Math.round((basePrice * rate.registrationPercent) / 100);
  const womenDiscountAmount = womenDiscountApplied
    ? Math.round((basePrice * (rate.womenDiscountPercent ?? 0)) / 100)
    : 0;

  return {
    basePrice,
    stampDutyPercent: effectiveStampDutyPercent,
    stampDutyAmount,
    registrationPercent: rate.registrationPercent,
    registrationAmount,
    total: basePrice + stampDutyAmount + registrationAmount,
    womenDiscountApplied,
    womenDiscountAmount,
  };
}
