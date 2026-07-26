"use client";

import * as React from "react";
import { Check } from "lucide-react";

import { Slider } from "@/components/ui/slider";
import { amountDue, cumulativePercentDue, PAYMENT_PLAN } from "@/lib/payment-plan";
import { formatIndianPrice, type Property } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function PaymentPlanCalculator({ property }: { property: Property }) {
  const [progress, setProgress] = React.useState(35);

  if (property.status === "Ready to Move") {
    return (
      <div className="rounded-2xl border border-border bg-white p-6">
        <p className="font-display text-xl font-semibold text-charcoal">Payment Plan</p>
        <p className="mt-2 text-sm text-muted-foreground">
          This property is ready to move — the full consideration of{" "}
          <span className="font-semibold text-champagne-dark">
            {formatIndianPrice(property.priceInCr)}
          </span>{" "}
          is payable at agreement &amp; registration, subject to your bank&rsquo;s home loan
          disbursement schedule.
        </p>
      </div>
    );
  }

  const percentDue = cumulativePercentDue(progress);
  const due = amountDue(property.priceInCr, progress);

  return (
    <div className="rounded-2xl border border-border bg-white p-6">
      <p className="font-display text-xl font-semibold text-charcoal">
        Construction-Linked Payment Plan
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Drag the slider to see how much becomes payable as construction progresses.
      </p>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
          <span>Construction Progress</span>
          <span className="font-display text-sm font-semibold text-charcoal">{progress}%</span>
        </div>
        <Slider
          min={0}
          max={100}
          step={1}
          value={[progress]}
          onValueChange={(v) => setProgress(v[0])}
        />
      </div>

      <div className="mt-6 grid gap-4 rounded-xl bg-muted p-4 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Payable So Far ({percentDue}%)
          </p>
          <p className="font-display text-2xl font-bold text-champagne-dark">
            {formatIndianPrice(due)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Remaining Balance
          </p>
          <p className="font-display text-2xl font-bold text-charcoal">
            {formatIndianPrice(property.priceInCr - due)}
          </p>
        </div>
      </div>

      <ol className="mt-6 space-y-3">
        {PAYMENT_PLAN.map((milestone) => {
          const reached = progress >= milestone.triggerAt;
          return (
            <li key={milestone.label} className="flex items-center gap-3">
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs transition-colors",
                  reached ? "bg-champagne-gradient text-charcoal" : "bg-muted text-muted-foreground"
                )}
              >
                {reached ? <Check className="h-3.5 w-3.5" /> : ""}
              </span>
              <div className="flex flex-1 items-center justify-between gap-2">
                <div>
                  <p
                    className={cn(
                      "text-sm font-medium",
                      reached ? "text-charcoal" : "text-muted-foreground"
                    )}
                  >
                    {milestone.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{milestone.description}</p>
                </div>
                <span
                  className={cn(
                    "shrink-0 font-display text-sm font-semibold",
                    reached ? "text-champagne-dark" : "text-muted-foreground"
                  )}
                >
                  {milestone.percent}%
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
