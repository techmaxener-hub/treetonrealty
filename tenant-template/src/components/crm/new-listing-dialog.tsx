"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { LocalityLite } from "@/lib/data/localities";
import type { ListingOfferType, ListingSegment, PropertyTypeEnum } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { LocalitySelect } from "@/components/crm/locality-select";
import { PROPERTY_TYPE_LABELS, SEGMENT_LABELS, OFFER_TYPE_LABELS } from "@/lib/constants";

function slugify(title: string) {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || `listing-${Date.now()}`
  );
}

export function NewListingDialog({ localities: initialLocalities }: { localities: LocalityLite[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [propertyType, setPropertyType] = useState<PropertyTypeEnum>("apartment");
  const [segment, setSegment] = useState<ListingSegment>("premium");
  const [offerType, setOfferType] = useState<ListingOfferType>("sale");
  const [localityId, setLocalityId] = useState<string | null>(null);
  const [localities, setLocalities] = useState(initialLocalities);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from("listings")
      .insert({
        title: { en: title },
        slug: slugify(title),
        property_type: propertyType,
        segment,
        offer_type: offerType,
        locality_id: localityId,
      })
      .select("id")
      .single();

    if (error || !data) {
      toast.error(`Couldn't create listing: ${error?.message ?? "unknown error"}`);
      setSubmitting(false);
      return;
    }

    router.push(`/crm/listings/${data.id}`);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" /> New Listing
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New listing</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="listing_title">Title (English)</Label>
            <Input id="listing_title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="3 BHK in Bopal" />
            <p className="text-xs text-muted-foreground">Add Hindi and Gujarati copy after creating the listing.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Property type</Label>
              <Select value={propertyType} onValueChange={(v) => setPropertyType(v as PropertyTypeEnum)}>
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
              <Label>Offer</Label>
              <Select value={offerType} onValueChange={(v) => setOfferType(v as ListingOfferType)}>
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
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Segment</Label>
            <Select value={segment} onValueChange={(v) => setSegment(v as ListingSegment)}>
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
            <Label>Locality</Label>
            <LocalitySelect
              localities={localities}
              value={localityId}
              onChange={setLocalityId}
              onLocalityCreated={(l) => setLocalities((prev) => [...prev, l])}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting || !title.trim()}>
              {submitting ? "Creating…" : "Create & edit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
