"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AREA_UNIT_LABELS, convertArea, type AreaUnit } from "@/lib/area";

const UNIT_OPTIONS = Object.keys(AREA_UNIT_LABELS) as AreaUnit[];

export function AreaConverterClient() {
  const [value, setValue] = React.useState("1000");
  const [fromUnit, setFromUnit] = React.useState<AreaUnit>("sqft");
  const [toUnit, setToUnit] = React.useState<AreaUnit>("sqyd");

  const numericValue = Number(value);
  const isValid = value.trim() !== "" && Number.isFinite(numericValue) && numericValue >= 0;

  let result: number | null = null;
  let error: string | null = null;
  if (isValid) {
    try {
      // convertArea() only converts FROM sqft, so go via sqft as the common unit:
      // 1 fromUnit expressed in sqft, scaled up to the entered value, then to toUnit.
      const sqftPerFromUnit = 1 / convertArea(1, fromUnit);
      const sqftValue = numericValue * sqftPerFromUnit;
      result = convertArea(sqftValue, toUnit);
    } catch (e) {
      error = e instanceof Error ? e.message : "Could not convert this value.";
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-elevate">
      <div className="grid items-end gap-6 sm:grid-cols-[1fr_auto_1fr]">
        <div>
          <Label htmlFor="area-value">Value</Label>
          <Input
            id="area-value"
            type="number"
            min={0}
            className="mt-1.5"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <Label className="mt-3 block">From</Label>
          <Select value={fromUnit} onValueChange={(v) => setFromUnit(v as AreaUnit)}>
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {UNIT_OPTIONS.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {AREA_UNIT_LABELS[unit]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="hidden justify-center pb-3 sm:flex">
          <ArrowRight className="h-6 w-6 text-gold-600" />
        </div>

        <div>
          <Label htmlFor="area-result">Result</Label>
          <Input
            id="area-result"
            readOnly
            className="mt-1.5 bg-muted font-semibold"
            value={
              error
                ? "--"
                : result !== null
                  ? result.toLocaleString("en-IN", { maximumFractionDigits: 2 })
                  : "--"
            }
          />
          <Label className="mt-3 block">To</Label>
          <Select value={toUnit} onValueChange={(v) => setToUnit(v as AreaUnit)}>
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {UNIT_OPTIONS.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {AREA_UNIT_LABELS[unit]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {!isValid && value.trim() !== "" && (
        <p className="mt-4 text-sm text-red-600">Enter a valid non-negative number.</p>
      )}
    </div>
  );
}
