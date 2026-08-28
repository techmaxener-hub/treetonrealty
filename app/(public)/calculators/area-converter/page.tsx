import type { Metadata } from "next";

import { AreaConverterClient } from "@/components/calculators/area-converter-client";

export const metadata: Metadata = {
  title: "Area Unit Converter",
  description: "Convert between Sq.Ft, Sq.Yard, Guntha, Bigha, Acre, Cent, Marla, and Sq.Meter.",
};

export default function AreaConverterPage() {
  return (
    <div className="min-h-screen bg-alabaster px-6 pb-24 pt-28">
      <div className="container max-w-2xl">
        <p className="font-serif text-lg italic text-gold-600">Calculators</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-slate-deep">Area Unit Converter</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Convert a land or carpet area between the units commonly used across Indian real estate
          documentation.
        </p>

        <div className="mt-10">
          <AreaConverterClient />
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          Bigha and Marla conversion factors vary by state/region. This converter uses the Gujarat
          Bigha figure and the Punjab/North India Marla figure -- confirm the regional variant that
          applies to your transaction before relying on this for a legal document.
        </p>
      </div>
    </div>
  );
}
