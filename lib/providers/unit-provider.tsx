"use client";

import * as React from "react";

import { SQFT_PER_SQYD } from "@/lib/mock-data";

export type AreaUnit = "sqft" | "sqyd";

interface UnitContextValue {
  unit: AreaUnit;
  setUnit: (unit: AreaUnit) => void;
  toggleUnit: () => void;
  formatArea: (sqFt: number) => string;
}

const UnitContext = React.createContext<UnitContextValue | null>(null);

export function UnitProvider({ children }: { children: React.ReactNode }) {
  const [unit, setUnit] = React.useState<AreaUnit>("sqft");

  const toggleUnit = React.useCallback(() => {
    setUnit((prev) => (prev === "sqft" ? "sqyd" : "sqft"));
  }, []);

  const formatArea = React.useCallback(
    (sqFt: number) => {
      if (unit === "sqyd") {
        return `${Math.round(sqFt / SQFT_PER_SQYD).toLocaleString("en-IN")} Sq. Yd`;
      }
      return `${sqFt.toLocaleString("en-IN")} Sq. Ft`;
    },
    [unit]
  );

  const value = React.useMemo(
    () => ({ unit, setUnit, toggleUnit, formatArea }),
    [unit, toggleUnit, formatArea]
  );

  return <UnitContext.Provider value={value}>{children}</UnitContext.Provider>;
}

export function useUnit() {
  const ctx = React.useContext(UnitContext);
  if (!ctx) throw new Error("useUnit must be used within a UnitProvider");
  return ctx;
}
