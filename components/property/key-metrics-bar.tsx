"use client";

import * as React from "react";
import { BadgeCheck, Check, Clock, Copy, ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { formatIndianPrice, pricePerSqYd, type Property } from "@/lib/mock-data";
import { useUnit } from "@/lib/providers/unit-provider";

export function KeyMetricsBar({ property }: { property: Property }) {
  const { formatArea } = useUnit();
  const [copied, setCopied] = React.useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(property.gujreraNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-border bg-white p-6 shadow-elevate sm:flex-row sm:items-center sm:justify-between">
      <div className="grid flex-1 grid-cols-2 gap-6 sm:grid-cols-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Price</p>
          <p className="font-display text-2xl font-bold text-champagne-dark">
            {formatIndianPrice(property.priceInCr)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Carpet Area</p>
          <p className="font-display text-2xl font-bold text-charcoal">
            {formatArea(property.carpetAreaSqFt)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Price / Sq. Yd</p>
          <p className="font-display text-2xl font-bold text-charcoal">
            ₹{pricePerSqYd(property).toLocaleString("en-IN")}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Configuration</p>
          <p className="font-display text-2xl font-bold text-charcoal">
            {property.bedrooms > 0 ? `${property.bedrooms} BHK` : "Commercial"}
          </p>
        </div>
      </div>

      <div className="hidden h-14 sm:block">
        <Separator orientation="vertical" />
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <button className="w-fit">
            {property.gujreraVerified ? (
              <Badge variant="verified" className="cursor-pointer px-4 py-2 text-sm">
                <BadgeCheck className="h-4 w-4" />
                GUJRERA Registered
              </Badge>
            ) : (
              <Badge variant="muted" className="cursor-pointer px-4 py-2 text-sm">
                <Clock className="h-4 w-4" />
                RERA Pending
              </Badge>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent>
          {property.gujreraVerified ? (
            <>
              <p className="font-display text-sm font-semibold text-charcoal">
                GUJRERA Registration
              </p>
              <div className="mt-2 flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-2">
                <code className="text-xs text-charcoal">{property.gujreraNumber}</code>
                <button
                  onClick={handleCopy}
                  aria-label="Copy GUJRERA number"
                  className="text-muted-foreground hover:text-charcoal"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="font-display text-sm font-semibold text-charcoal">
                Registration Pending
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                This is a pre-launch off-plan listing. The promoter&rsquo;s GUJRERA application
                is under review and a registration number has not yet been issued.
              </p>
            </>
          )}
          <dl className="mt-3 space-y-1.5 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <dt>Promoter</dt>
              <dd className="text-charcoal">{property.developer}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Project Status</dt>
              <dd className="text-charcoal">{property.status}</dd>
            </div>
          </dl>
          <a
            href="https://gujrera.gujarat.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center gap-1 text-xs font-medium text-champagne-dark hover:underline"
          >
            Verify on official GUJRERA portal <ExternalLink className="h-3 w-3" />
          </a>
        </PopoverContent>
      </Popover>
    </div>
  );
}
