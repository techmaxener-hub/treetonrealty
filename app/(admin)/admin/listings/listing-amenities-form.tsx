"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { setAmenities } from "./actions";
import type { AmenityRow } from "./types";

export function ListingAmenitiesForm({
  listingId,
  amenities,
  selectedIds,
}: {
  listingId: string;
  amenities: AmenityRow[];
  selectedIds: string[];
}) {
  const [selected, setSelected] = useState(new Set(selectedIds));
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function toggle(id: string, checked: boolean) {
    setSaved(false);
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function handleSave() {
    startTransition(() => {
      setAmenities(listingId, Array.from(selected)).then((res) => {
        if (!res.error) setSaved(true);
      });
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {amenities.map((amenity) => (
          <label key={amenity.id} className="flex items-center gap-2 text-sm text-slate-deep">
            <Checkbox
              checked={selected.has(amenity.id)}
              onCheckedChange={(checked) => toggle(amenity.id, checked === true)}
            />
            {amenity.name}
          </label>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Button type="button" size="sm" disabled={isPending} onClick={handleSave}>
          {isPending ? "Saving..." : "Save amenities"}
        </Button>
        {saved ? <span className="text-sm text-emerald-700">Saved.</span> : null}
      </div>
    </div>
  );
}
