"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Tables, ListingOfferType, ListingSegment, ListingStatus, PossessionStatus, PropertyTypeEnum } from "@/lib/types/database";
import type { LocalityLite } from "@/lib/data/localities";
import type { TeamMember } from "@/lib/data/team";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LocalizedField } from "@/components/crm/localized-field";
import { LocalitySelect } from "@/components/crm/locality-select";
import {
  PROPERTY_TYPE_LABELS,
  SEGMENT_LABELS,
  OFFER_TYPE_LABELS,
  LISTING_STATUS_LABELS,
  POSSESSION_STATUS_LABELS,
} from "@/lib/constants";
import type { LocalizedText } from "@/lib/types/database";

const UNASSIGNED = "__unassigned__";

export function ListingOverviewForm({
  listing,
  localities: initialLocalities,
  team,
}: {
  listing: Tables<"listings">;
  localities: LocalityLite[];
  team: TeamMember[];
}) {
  const router = useRouter();
  const [form, setForm] = useState(listing);
  const [localities, setLocalities] = useState(initialLocalities);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof Tables<"listings">>(key: K, value: Tables<"listings">[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const { id, created_at, updated_at, published_at, ...updatable } = form;
    void id;
    void created_at;
    void updated_at;
    void published_at;

    const { error } = await supabase.from("listings").update(updatable).eq("id", listing.id);
    if (error) {
      toast.error(`Couldn't save: ${error.message}`);
    } else {
      toast.success("Saved");
      router.refresh();
    }
    setSaving(false);
  }

  async function togglePublish() {
    const nextPublished = !form.is_published;
    setForm((prev) => ({ ...prev, is_published: nextPublished }));
    const supabase = createClient();
    const { error } = await supabase
      .from("listings")
      .update({ is_published: nextPublished, published_at: nextPublished ? new Date().toISOString() : null })
      .eq("id", listing.id);
    if (error) {
      setForm((prev) => ({ ...prev, is_published: !nextPublished }));
      toast.error(`Couldn't update: ${error.message}`);
    } else {
      toast.success(nextPublished ? "Published to the public site" : "Unpublished");
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between rounded-md border p-3">
        <div>
          <p className="text-sm font-medium">{form.is_published ? "Published" : "Draft"}</p>
          <p className="text-xs text-muted-foreground">
            {form.is_published ? "Visible on the public site." : "Only visible inside the CRM."}
          </p>
        </div>
        <Button type="button" variant={form.is_published ? "outline" : "default"} size="sm" onClick={togglePublish}>
          {form.is_published ? "Unpublish" : "Publish"}
        </Button>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Title</Label>
        <LocalizedField value={form.title as LocalizedText} onChange={(v) => set("title", v)} placeholder="3 BHK in Bopal" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Description</Label>
        <LocalizedField
          value={form.description as LocalizedText}
          onChange={(v) => set("description", v)}
          multiline
          placeholder="Spacious apartment with…"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label>Property type</Label>
          <Select value={form.property_type} onValueChange={(v) => set("property_type", v as PropertyTypeEnum)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(PROPERTY_TYPE_LABELS) as [PropertyTypeEnum, string][]).map(([v, l]) => (
                <SelectItem key={v} value={v}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Segment</Label>
          <Select value={form.segment} onValueChange={(v) => set("segment", v as ListingSegment)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(SEGMENT_LABELS) as [ListingSegment, string][]).map(([v, l]) => (
                <SelectItem key={v} value={v}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Offer</Label>
          <Select value={form.offer_type} onValueChange={(v) => set("offer_type", v as ListingOfferType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(OFFER_TYPE_LABELS) as [ListingOfferType, string][]).map(([v, l]) => (
                <SelectItem key={v} value={v}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Status</Label>
          <Select value={form.status} onValueChange={(v) => set("status", v as ListingStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(LISTING_STATUS_LABELS) as [ListingStatus, string][]).map(([v, l]) => (
                <SelectItem key={v} value={v}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Locality</Label>
          <LocalitySelect
            localities={localities}
            value={form.locality_id}
            onChange={(v) => set("locality_id", v)}
            onLocalityCreated={(l) => setLocalities((prev) => [...prev, l])}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Point of contact</Label>
          <Select value={form.advisor_id ?? UNASSIGNED} onValueChange={(v) => set("advisor_id", v === UNASSIGNED ? null : v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
              {team.map((m) => (
                <SelectItem key={m.profileId} value={m.profileId}>
                  {m.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="flex flex-col gap-1.5">
          <Label>Price (₹)</Label>
          <Input type="number" value={form.price ?? ""} onChange={(e) => set("price", e.target.value ? Number(e.target.value) : null)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Maintenance (₹/mo)</Label>
          <Input
            type="number"
            value={form.maintenance_charges ?? ""}
            onChange={(e) => set("maintenance_charges", e.target.value ? Number(e.target.value) : null)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>BHK</Label>
          <Input type="number" step="0.5" value={form.bhk ?? ""} onChange={(e) => set("bhk", e.target.value ? Number(e.target.value) : null)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Developer</Label>
          <Input value={form.developer_name ?? ""} onChange={(e) => set("developer_name", e.target.value || null)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Carpet area (sqft)</Label>
          <Input
            type="number"
            value={form.carpet_area_sqft ?? ""}
            onChange={(e) => set("carpet_area_sqft", e.target.value ? Number(e.target.value) : null)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Built-up area (sqft)</Label>
          <Input
            type="number"
            value={form.builtup_area_sqft ?? ""}
            onChange={(e) => set("builtup_area_sqft", e.target.value ? Number(e.target.value) : null)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Floor</Label>
          <Input
            type="number"
            value={form.floor_number ?? ""}
            onChange={(e) => set("floor_number", e.target.value ? Number(e.target.value) : null)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Total floors</Label>
          <Input
            type="number"
            value={form.total_floors ?? ""}
            onChange={(e) => set("total_floors", e.target.value ? Number(e.target.value) : null)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label>Possession</Label>
          <Select
            value={form.possession_status ?? ""}
            onValueChange={(v) => set("possession_status", v as PossessionStatus)}
          >
            <SelectTrigger>
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(POSSESSION_STATUS_LABELS) as [PossessionStatus, string][]).map(([v, l]) => (
                <SelectItem key={v} value={v}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {form.possession_status === "under_construction" && (
          <div className="flex flex-col gap-1.5">
            <Label>Possession date</Label>
            <Input type="date" value={form.possession_date ?? ""} onChange={(e) => set("possession_date", e.target.value || null)} />
          </div>
        )}
        <div className="flex items-center gap-2 self-end pb-2">
          <input
            type="checkbox"
            id="is_exclusive"
            checked={form.is_exclusive}
            onChange={(e) => set("is_exclusive", e.target.checked)}
            className="h-4 w-4"
          />
          <Label htmlFor="is_exclusive" className="cursor-pointer">
            Exclusive listing
          </Label>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Amenities (comma separated)</Label>
        <Input
          value={form.amenities.join(", ")}
          onChange={(e) =>
            set(
              "amenities",
              e.target.value.split(",").map((a) => a.trim()).filter(Boolean),
            )
          }
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Address</Label>
        <Input value={form.address ?? ""} onChange={(e) => set("address", e.target.value || null)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Latitude</Label>
          <Input type="number" step="any" value={form.lat ?? ""} onChange={(e) => set("lat", e.target.value ? Number(e.target.value) : null)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Longitude</Label>
          <Input type="number" step="any" value={form.lng ?? ""} onChange={(e) => set("lng", e.target.value ? Number(e.target.value) : null)} />
        </div>
      </div>

      <div className="flex justify-end border-t pt-4">
        <Button type="button" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
