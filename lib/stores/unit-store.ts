"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { formatArea as formatAreaValue, type AreaUnit, type BighaRegion } from "@/lib/area";

interface UnitState {
  unit: AreaUnit;
  bighaRegion: BighaRegion;
  setUnit: (unit: AreaUnit) => void;
}

/**
 * Client UI state only (the user's chosen area-unit preference) -- never mirrors
 * server data, so this belongs in Zustand rather than React Query. Persisted to
 * sessionStorage so the choice survives navigation within the same browser session
 * without a refetch, per the area-unit-switcher spec.
 */
export const useUnitStore = create<UnitState>()(
  persist(
    (set) => ({
      unit: "sqft",
      bighaRegion: "gujarat",
      setUnit: (unit) => set({ unit }),
    }),
    {
      name: "treeton-area-unit",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

/** Formats a sq.ft area value using the currently-selected unit from the store. */
export function useFormattedArea(sqft: number): string {
  const unit = useUnitStore((state) => state.unit);
  const bighaRegion = useUnitStore((state) => state.bighaRegion);
  return formatAreaValue(sqft, unit, { bighaRegion });
}
