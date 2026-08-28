import type { Metadata } from "next";

import { EmiCalculatorClient } from "@/components/calculators/emi-calculator-client";

export const metadata: Metadata = {
  title: "Home Loan EMI Calculator",
  description: "Calculate your monthly home loan EMI, total interest, and full amortization schedule.",
};

export default function EmiCalculatorPage() {
  return (
    <div className="min-h-screen bg-alabaster px-6 pb-24 pt-28">
      <div className="container max-w-4xl">
        <p className="font-serif text-lg italic text-gold-600">Calculators</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-slate-deep">
          Home Loan EMI Calculator
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Estimate your monthly instalment using the standard reducing-balance formula banks use,
          with a full year-by-year amortization breakdown.
        </p>

        <div className="mt-10">
          <EmiCalculatorClient />
        </div>
      </div>
    </div>
  );
}
