"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatINRFull, parseINRInput } from "@/lib/currency";
import type { StampDutyRate } from "@/lib/queries/stamp-duty";
import { calculateStampDuty } from "@/lib/stamp-duty";

export function StampDutyCalculatorClient({ rates }: { rates: StampDutyRate[] }) {
  const [state, setState] = React.useState(rates[0]?.state ?? "");
  const [priceInput, setPriceInput] = React.useState("50,00,000");
  const [isWoman, setIsWoman] = React.useState(false);

  const selectedRate = rates.find((r) => r.state === state) ?? null;

  let basePrice: number | null = null;
  let parseError: string | null = null;
  try {
    basePrice = parseINRInput(priceInput);
  } catch (e) {
    parseError = e instanceof Error ? e.message : "Enter a valid amount.";
  }

  const breakdown =
    basePrice !== null && selectedRate
      ? calculateStampDuty(basePrice, selectedRate, { isWomanSoleOrCoOwner: isWoman })
      : null;

  if (rates.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-white p-6 text-sm text-muted-foreground">
        No stamp duty rates have been configured yet. Please contact us for a manual estimate.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-elevate">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="stamp-duty-state">State</Label>
          <Select value={state} onValueChange={setState}>
            <SelectTrigger id="stamp-duty-state" className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {rates.map((r) => (
                <SelectItem key={r.state} value={r.state}>
                  {r.state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="stamp-duty-price">Property Value</Label>
          <Input
            id="stamp-duty-price"
            className="mt-1.5"
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            placeholder="e.g. 50,00,000 or 2.75 cr"
          />
          {parseError && <p className="mt-1 text-xs text-red-600">{parseError}</p>}
        </div>
      </div>

      {selectedRate?.womenDiscountPercent ? (
        <div className="mt-5 flex items-center gap-2 rounded-md bg-muted px-3 py-2.5">
          <Checkbox id="is-woman" checked={isWoman} onCheckedChange={(c) => setIsWoman(c === true)} />
          <Label htmlFor="is-woman" className="font-normal text-sm">
            Sole or co-owner is a woman
          </Label>
        </div>
      ) : null}

      {selectedRate?.womenDiscountNotes && isWoman && (
        <p className="mt-2 text-xs text-muted-foreground">{selectedRate.womenDiscountNotes}</p>
      )}

      {selectedRate && !selectedRate.isVerified && (
        <p className="mt-4 flex items-start gap-1.5 rounded-md bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {selectedRate.sourceNotes ?? "This rate has not been verified against a current government notification."}
        </p>
      )}

      {breakdown && (
        <dl className="mt-6 space-y-3 border-t border-border pt-6 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Property Value</dt>
            <dd className="font-medium text-slate-deep">{formatINRFull(breakdown.basePrice)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Stamp Duty ({breakdown.stampDutyPercent}%)</dt>
            <dd className="font-medium text-slate-deep">{formatINRFull(breakdown.stampDutyAmount)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Registration Charges ({breakdown.registrationPercent}%)</dt>
            <dd className="font-medium text-slate-deep">{formatINRFull(breakdown.registrationAmount)}</dd>
          </div>
          {breakdown.womenDiscountApplied && (
            <div className="flex justify-between text-emerald-700">
              <dt>Women-Buyer Concession Applied</dt>
              <dd className="font-medium">-{formatINRFull(breakdown.womenDiscountAmount)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-3">
            <dt className="font-display text-base font-semibold text-slate-deep">Total Payable</dt>
            <dd className="font-display text-lg font-bold text-gold-600">
              {formatINRFull(breakdown.total)}
            </dd>
          </div>
        </dl>
      )}
    </div>
  );
}
