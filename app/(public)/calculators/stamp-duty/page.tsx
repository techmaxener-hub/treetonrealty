import type { Metadata } from "next";

import { StampDutyCalculatorClient } from "@/components/calculators/stamp-duty-calculator-client";
import { getAllStampDutyRates } from "@/lib/queries/stamp-duty";

export const metadata: Metadata = {
  title: "Stamp Duty & Registration Calculator",
  description: "Estimate stamp duty and registration charges by state, with women-buyer concessions where applicable.",
};

// ISR: rates are admin-editable specifically so they can change without a redeploy.
export const revalidate = 3600;

export default async function StampDutyCalculatorPage() {
  const rates = await getAllStampDutyRates();

  return (
    <div className="min-h-screen bg-alabaster px-6 pb-24 pt-28">
      <div className="container max-w-2xl">
        <p className="font-serif text-lg italic text-gold-600">Calculators</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-slate-deep">
          Stamp Duty &amp; Registration Calculator
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Estimate stamp duty and registration charges by state. Rates are admin-editable and can
          be updated without a redeploy as government notifications change.
        </p>

        <div className="mt-10">
          <StampDutyCalculatorClient rates={rates} />
        </div>

        {rates.some((r) => !r.isVerified) && (
          <p className="mt-6 rounded-lg bg-muted px-4 py-3 text-xs text-muted-foreground">
            One or more rates shown here are placeholders pending verification against current
            state government notifications -- see the note on each state for details.
          </p>
        )}
      </div>
    </div>
  );
}
