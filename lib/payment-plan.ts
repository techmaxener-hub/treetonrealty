// Standard construction-linked plan (CLP) template used to visualize
// milestone-based payments on the property detail page.

export interface PaymentMilestone {
  label: string;
  description: string;
  percent: number;
  /** Construction progress (%) at which this milestone is considered due. */
  triggerAt: number;
}

export const PAYMENT_PLAN: PaymentMilestone[] = [
  { label: "Booking Amount", description: "On expression of interest", percent: 10, triggerAt: 0 },
  { label: "Foundation", description: "On completion of excavation & foundation", percent: 15, triggerAt: 15 },
  { label: "Plinth & Podium", description: "On completion of plinth level", percent: 20, triggerAt: 35 },
  { label: "Superstructure", description: "On completion of RCC framework", percent: 25, triggerAt: 60 },
  { label: "Brickwork & Plaster", description: "On completion of internal & external plaster", percent: 15, triggerAt: 85 },
  { label: "Possession", description: "On handover & registration", percent: 15, triggerAt: 100 },
];

/** Cumulative % of the total price due once construction reaches `progress`%. */
export function cumulativePercentDue(progress: number) {
  return PAYMENT_PLAN.filter((m) => m.triggerAt <= progress).reduce(
    (sum, m) => sum + m.percent,
    0
  );
}

/** Amount (in Cr) due once construction reaches `progress`%. */
export function amountDue(priceInCr: number, progress: number) {
  return (priceInCr * cumulativePercentDue(progress)) / 100;
}
