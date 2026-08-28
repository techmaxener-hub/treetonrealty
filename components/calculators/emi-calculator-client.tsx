"use client";

import * as React from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Slider } from "@/components/ui/slider";
import { formatINR, formatINRFull } from "@/lib/currency";
import { aggregateByYear, calculateEmi, generateAmortizationSchedule } from "@/lib/emi";

export function EmiCalculatorClient() {
  const [principal, setPrincipal] = React.useState(5_000_000);
  const [rate, setRate] = React.useState(8.5);
  const [tenureYears, setTenureYears] = React.useState(20);

  const { monthlyEmi, totalPayment, totalInterest } = calculateEmi({
    principal,
    annualRatePercent: rate,
    tenureYears,
  });
  const yearlySchedule = React.useMemo(
    () =>
      aggregateByYear(
        generateAmortizationSchedule({ principal, annualRatePercent: rate, tenureYears })
      ),
    [principal, rate, tenureYears]
  );

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border bg-white p-6 shadow-elevate">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Loan Amount
              </p>
              <span className="font-display text-sm font-semibold text-slate-deep">
                {formatINR(principal)}
              </span>
            </div>
            <Slider
              min={500_000}
              max={100_000_000}
              step={100_000}
              value={[principal]}
              onValueChange={(v) => setPrincipal(v[0])}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Interest Rate
              </p>
              <span className="font-display text-sm font-semibold text-slate-deep">{rate}% p.a.</span>
            </div>
            <Slider min={6} max={16} step={0.05} value={[rate]} onValueChange={(v) => setRate(v[0])} />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Tenure
              </p>
              <span className="font-display text-sm font-semibold text-slate-deep">
                {tenureYears} {tenureYears === 1 ? "Year" : "Years"}
              </span>
            </div>
            <Slider
              min={1}
              max={30}
              step={1}
              value={[tenureYears]}
              onValueChange={(v) => setTenureYears(v[0])}
            />
          </div>
        </div>

        <div className="mt-8 grid gap-4 rounded-xl bg-muted p-5 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Monthly EMI</p>
            <p className="font-display text-2xl font-bold text-gold-600">
              {formatINRFull(Math.round(monthlyEmi))}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Interest</p>
            <p className="font-display text-2xl font-bold text-slate-deep">
              {formatINRFull(Math.round(totalInterest))}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Payment</p>
            <p className="font-display text-2xl font-bold text-slate-deep">
              {formatINRFull(Math.round(totalPayment))}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-6 shadow-elevate">
        <p className="font-display text-lg font-semibold text-slate-deep">Amortization Schedule</p>
        <div className="mt-4 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={yearlySchedule} margin={{ left: 8, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e0d5" />
              <XAxis dataKey="year" tickFormatter={(y) => `Yr ${y}`} fontSize={12} />
              <YAxis tickFormatter={(v) => formatINR(v, { showSymbol: false })} fontSize={12} width={70} />
              <RechartsTooltip
                formatter={(value) => formatINRFull(Math.round(Number(value)))}
                labelFormatter={(y) => `Year ${y}`}
              />
              <Legend />
              <Bar dataKey="principalPaid" name="Principal Paid" stackId="a" fill="#D97706" />
              <Bar dataKey="interestPaid" name="Interest Paid" stackId="a" fill="#0F172A" />
              <Line dataKey="balance" name="Remaining Balance" stroke="#059669" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2">Year</th>
                <th className="py-2 text-right">Principal Paid</th>
                <th className="py-2 text-right">Interest Paid</th>
                <th className="py-2 text-right">Remaining Balance</th>
              </tr>
            </thead>
            <tbody>
              {yearlySchedule.map((row) => (
                <tr key={row.year} className="border-b border-border/60">
                  <td className="py-2 text-slate-deep">{row.year}</td>
                  <td className="py-2 text-right text-slate-deep">
                    {formatINRFull(Math.round(row.principalPaid))}
                  </td>
                  <td className="py-2 text-right text-slate-deep">
                    {formatINRFull(Math.round(row.interestPaid))}
                  </td>
                  <td className="py-2 text-right text-slate-deep">
                    {formatINRFull(Math.round(row.balance))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
