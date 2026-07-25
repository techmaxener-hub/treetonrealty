"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencyINR } from "@/lib/utils";

function calculateEmi(principal: number, annualRatePercent: number, tenureYears: number) {
  const monthlyRate = annualRatePercent / 12 / 100;
  const months = tenureYears * 12;
  if (monthlyRate === 0) return principal / months;
  const factor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * factor) / (factor - 1);
}

export function EmiCalculator({ price }: { price: number | null }) {
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  const principal = useMemo(() => {
    if (!price) return 0;
    return price * (1 - downPaymentPercent / 100);
  }, [price, downPaymentPercent]);

  const emi = useMemo(() => (principal > 0 ? calculateEmi(principal, rate, tenure) : 0), [principal, rate, tenure]);

  if (!price) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>EMI calculator</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Down payment %</Label>
            <Input type="number" value={downPaymentPercent} onChange={(e) => setDownPaymentPercent(Number(e.target.value) || 0)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Interest rate %</Label>
            <Input type="number" step="0.1" value={rate} onChange={(e) => setRate(Number(e.target.value) || 0)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Tenure (years)</Label>
            <Input type="number" value={tenure} onChange={(e) => setTenure(Number(e.target.value) || 1)} />
          </div>
        </div>
        <div className="rounded-md bg-secondary p-3 text-center">
          <p className="text-xs text-muted-foreground">Estimated monthly EMI</p>
          <p className="text-2xl font-semibold">{formatCurrencyINR(Math.round(emi))}</p>
          <p className="mt-1 text-xs text-muted-foreground">Loan amount: {formatCurrencyINR(Math.round(principal))}</p>
        </div>
        <p className="text-[11px] text-muted-foreground">Indicative only — actual EMI depends on the lender&apos;s terms.</p>
      </CardContent>
    </Card>
  );
}
