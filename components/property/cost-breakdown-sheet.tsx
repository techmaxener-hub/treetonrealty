"use client";

import * as React from "react";
import { Info } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { formatINRFull } from "@/lib/currency";
import { calculateGstAmount, getGstApplicability } from "@/lib/gst";
import { calculateStampDuty } from "@/lib/stamp-duty";
import type { PossessionStatus, PropertyType } from "@/lib/queries/listings";
import type { StampDutyRate } from "@/lib/queries/stamp-duty";

interface CostBreakdownSheetProps {
  basePriceInr: number;
  parkingChargesInr: number | null;
  propertyType: PropertyType;
  possessionStatus: PossessionStatus;
  stampDutyRate: StampDutyRate | null;
}

export function CostBreakdownSheet({
  basePriceInr,
  parkingChargesInr,
  propertyType,
  possessionStatus,
  stampDutyRate,
}: CostBreakdownSheetProps) {
  const [isWoman, setIsWoman] = React.useState(false);

  const gst = getGstApplicability(propertyType, possessionStatus);
  const gstAmount = calculateGstAmount(basePriceInr, propertyType, possessionStatus);

  const stampDuty = stampDutyRate
    ? calculateStampDuty(basePriceInr, stampDutyRate, { isWomanSoleOrCoOwner: isWoman })
    : null;

  const total =
    basePriceInr +
    (stampDuty?.stampDutyAmount ?? 0) +
    (stampDuty?.registrationAmount ?? 0) +
    (parkingChargesInr ?? 0) +
    gstAmount;

  return (
    <div className="rounded-2xl border border-border bg-white p-6">
      <p className="font-display text-xl font-semibold text-slate-deep">Cost Breakdown</p>
      <p className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Base price is fixed by the listing. Stamp duty, registration, and GST are estimates
        based on current published rates -- confirm exact figures with your sub-registrar
        office and a chartered accountant before registration.
      </p>

      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Base Price</dt>
          <dd className="font-medium text-slate-deep">{formatINRFull(basePriceInr)}</dd>
        </div>

        {stampDutyRate && stampDutyRate.womenDiscountPercent ? (
          <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2">
            <Checkbox id="woman-owner" checked={isWoman} onCheckedChange={(c) => setIsWoman(c === true)} />
            <Label htmlFor="woman-owner" className="font-normal text-xs">
              Sole or co-owner is a woman (stamp duty concession applies in {stampDutyRate.state})
            </Label>
          </div>
        ) : null}

        {stampDuty ? (
          <>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                Stamp Duty (Estimate, {stampDuty.stampDutyPercent}%)
              </dt>
              <dd className="font-medium text-slate-deep">{formatINRFull(stampDuty.stampDutyAmount)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                Registration Charges (Estimate, {stampDuty.registrationPercent}%)
              </dt>
              <dd className="font-medium text-slate-deep">{formatINRFull(stampDuty.registrationAmount)}</dd>
            </div>
          </>
        ) : (
          <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
            Stamp duty rate for this state has not been configured yet -- contact us for an estimate.
          </p>
        )}

        {parkingChargesInr ? (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Parking Charges (Fixed)</dt>
            <dd className="font-medium text-slate-deep">{formatINRFull(parkingChargesInr)}</dd>
          </div>
        ) : null}

        <div className="flex justify-between">
          <dt className="text-muted-foreground">
            GST {gst.applies ? `(Estimate, ${(gst.rate * 100).toFixed(0)}%)` : "(Not Applicable)"}
          </dt>
          <dd className="font-medium text-slate-deep">{formatINRFull(gstAmount)}</dd>
        </div>
        <p className="text-xs text-muted-foreground">{gst.reason}</p>

        <div className="flex justify-between border-t border-border pt-3">
          <dt className="font-display text-base font-semibold text-slate-deep">Estimated Total</dt>
          <dd className="font-display text-lg font-bold text-gold-600">{formatINRFull(total)}</dd>
        </div>
      </dl>
    </div>
  );
}
