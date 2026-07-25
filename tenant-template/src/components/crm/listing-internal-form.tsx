"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/types/database";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function ListingInternalForm({ listingId, internal }: { listingId: string; internal: Tables<"listing_internal"> | null }) {
  const router = useRouter();
  const [commission, setCommission] = useState(internal?.commission_percent?.toString() ?? "");
  const [flexibility, setFlexibility] = useState(internal?.seller_flexibility_notes ?? "");
  const [notes, setNotes] = useState(internal?.internal_notes ?? "");
  const [expiry, setExpiry] = useState(internal?.exclusive_agreement_expiry ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("listing_internal").upsert({
      listing_id: listingId,
      commission_percent: commission ? Number(commission) : null,
      seller_flexibility_notes: flexibility || null,
      internal_notes: notes || null,
      exclusive_agreement_expiry: expiry || null,
    });
    if (error) {
      toast.error(`Couldn't save: ${error.message}`);
    } else {
      toast.success("Saved");
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="rounded-md bg-amber-50 p-2 text-xs text-amber-700 dark:bg-amber-950 dark:text-amber-300">
        Never shown on the public site or to buyer-side leads — visible only to you and whoever else can already see this listing.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Commission %</Label>
          <Input type="number" step="0.1" value={commission} onChange={(e) => setCommission(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Exclusive agreement expiry</Label>
          <Input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Seller flexibility</Label>
        <Textarea rows={2} value={flexibility} onChange={(e) => setFlexibility(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Internal notes</Label>
        <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <div className="flex justify-end">
        <Button type="button" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}
