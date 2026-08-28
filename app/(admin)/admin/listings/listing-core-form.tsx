"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EnumSelect } from "./enum-select";
import { checkDuplicateListings, createListing, updateListing } from "./actions";
import {
  FACING_DIRECTIONS,
  FURNISHING_STATUSES,
  LISTING_STATUSES,
  POSSESSION_STATUSES,
  PROPERTY_TYPES,
  VASTU_SCORES,
  type ListingRow,
} from "./types";

type DuplicateMatch = { id: string; ref_code: string; title: string; locality: string };

export function ListingCoreForm({ listing }: { listing?: ListingRow }) {
  const mode = listing ? "edit" : "create";
  const [propertyType, setPropertyType] = useState(listing?.property_type ?? "Apartment");
  const [status, setStatus] = useState(listing?.status ?? "Draft");
  const [furnishing, setFurnishing] = useState(listing?.furnishing_status ?? "");
  const [possession, setPossession] = useState(listing?.possession_status ?? "Ready");
  const [facing, setFacing] = useState(listing?.facing_direction ?? "");
  const [vastu, setVastu] = useState(listing?.vastu_score ?? "");

  const [error, setError] = useState<string | null>(null);
  const [duplicates, setDuplicates] = useState<DuplicateMatch[] | null>(null);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const formData = new FormData(e.currentTarget);

    if (mode === "edit" && listing) {
      startTransition(() => {
        updateListing(listing.id, formData).then((res) => {
          if (res?.error) setError(res.error);
          else setSaved(true);
        });
      });
      return;
    }

    const title = String(formData.get("title") ?? "");
    const address = String(formData.get("address") ?? "") || null;
    startTransition(() => {
      checkDuplicateListings(title, address).then((res) => {
        if (res.matches.length > 0) {
          setDuplicates(res.matches);
          setPendingFormData(formData);
        } else {
          createListing(formData).then((res) => {
            if (res?.error) setError(res.error);
          });
        }
      });
    });
  }

  function confirmCreateAnyway() {
    if (!pendingFormData) return;
    setDuplicates(null);
    startTransition(() => {
      createListing(pendingFormData).then((res) => {
        if (res?.error) setError(res.error);
      });
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Basic Info
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={listing?.title} required />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              defaultValue={listing?.description}
              required
              rows={4}
              className="flex w-full rounded-sm border border-border bg-white/80 px-4 py-2 text-sm text-slate-deep placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Property Type</Label>
            <EnumSelect
              name="property_type"
              value={propertyType}
              onChange={(v) => setPropertyType(v as typeof propertyType)}
              options={PROPERTY_TYPES}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <EnumSelect
              name="status"
              value={status}
              onChange={(v) => setStatus(v as typeof status)}
              options={LISTING_STATUSES}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Location
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="locality">Locality</Label>
            <Input id="locality" name="locality" defaultValue={listing?.locality} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" defaultValue={listing?.address ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" defaultValue={listing?.city ?? "Ahmedabad"} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="state">State</Label>
            <Input id="state" name="state" defaultValue={listing?.state ?? "Gujarat"} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              name="latitude"
              type="number"
              step="any"
              defaultValue={listing?.latitude ?? ""}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              name="longitude"
              type="number"
              step="any"
              defaultValue={listing?.longitude ?? ""}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Specifications
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="bhk">BHK</Label>
            <Input id="bhk" name="bhk" type="number" step="0.5" defaultValue={listing?.bhk ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bathrooms">Bathrooms</Label>
            <Input
              id="bathrooms"
              name="bathrooms"
              type="number"
              defaultValue={listing?.bathrooms ?? ""}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="carpet_area_sqft">Carpet Area (sq.ft)</Label>
            <Input
              id="carpet_area_sqft"
              name="carpet_area_sqft"
              type="number"
              step="any"
              defaultValue={listing?.carpet_area_sqft ?? ""}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="built_up_area_sqft">Built-up Area (sq.ft)</Label>
            <Input
              id="built_up_area_sqft"
              name="built_up_area_sqft"
              type="number"
              step="any"
              defaultValue={listing?.built_up_area_sqft ?? ""}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Furnishing</Label>
            <EnumSelect
              name="furnishing_status"
              value={furnishing ?? ""}
              onChange={setFurnishing}
              options={FURNISHING_STATUSES}
              allowEmpty
            />
          </div>
          <div className="space-y-1.5">
            <Label>Possession</Label>
            <EnumSelect
              name="possession_status"
              value={possession}
              onChange={(v) => setPossession(v as typeof possession)}
              options={POSSESSION_STATUSES}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="possession_date">Possession Date</Label>
            <Input
              id="possession_date"
              name="possession_date"
              type="date"
              defaultValue={listing?.possession_date ?? ""}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Facing Direction</Label>
            <EnumSelect
              name="facing_direction"
              value={facing ?? ""}
              onChange={setFacing}
              options={FACING_DIRECTIONS}
              allowEmpty
            />
          </div>
          <div className="space-y-1.5">
            <Label>Vastu Score</Label>
            <EnumSelect
              name="vastu_score"
              value={vastu ?? ""}
              onChange={setVastu}
              options={VASTU_SCORES}
              allowEmpty
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Pricing
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="price_inr">Price (INR)</Label>
            <Input
              id="price_inr"
              name="price_inr"
              type="number"
              defaultValue={listing?.price_inr ?? ""}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="parking_charges_inr">Parking Charges (INR)</Label>
            <Input
              id="parking_charges_inr"
              name="parking_charges_inr"
              type="number"
              defaultValue={listing?.parking_charges_inr ?? ""}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Publishing
        </h2>
        <div className="space-y-1.5">
          <Label htmlFor="virtual_tour_url">Virtual Tour URL</Label>
          <Input
            id="virtual_tour_url"
            name="virtual_tour_url"
            defaultValue={listing?.virtual_tour_url ?? ""}
          />
        </div>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-slate-deep">
            <input
              type="checkbox"
              name="is_rera_verified"
              defaultChecked={listing?.is_rera_verified}
              className="h-4 w-4 accent-emerald-600"
            />
            RERA Verified
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-deep">
            <input
              type="checkbox"
              name="is_published"
              defaultChecked={listing?.is_published}
              className="h-4 w-4 accent-emerald-600"
            />
            Published (visible on public site)
          </label>
        </div>
      </section>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {saved ? <p className="text-sm text-emerald-700">Saved.</p> : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : mode === "create" ? "Create listing" : "Save changes"}
      </Button>

      {duplicates && duplicates.length > 0 ? (
        <div className="rounded-md border border-gold-600/60 bg-gold-600/10 p-4">
          <p className="text-sm font-medium text-slate-deep">
            Possible duplicate listing{duplicates.length > 1 ? "s" : ""} found:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-slate-deep">
            {duplicates.map((d) => (
              <li key={d.id}>
                {d.title} ({d.ref_code}) &middot; {d.locality}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => setDuplicates(null)}>
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={confirmCreateAnyway} disabled={isPending}>
              Create anyway
            </Button>
          </div>
        </div>
      ) : null}
    </form>
  );
}
