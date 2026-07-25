"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { searchListings } from "@/lib/data/deals";
import type { TeamMember } from "@/lib/data/team";
import type { Tables } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { localizedText } from "@/lib/utils";

type ListingOption = Awaited<ReturnType<typeof searchListings>>[number];

export function NewDealDialog({
  team,
  prefill,
}: {
  team: TeamMember[];
  prefill?: { listingId?: string; listingLabel?: string; buyerContactId?: string; buyerLabel?: string; advisorId?: string | null };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [listingQuery, setListingQuery] = useState("");
  const [listingResults, setListingResults] = useState<ListingOption[]>([]);
  const [listingId, setListingId] = useState(prefill?.listingId ?? "");
  const [listingLabel, setListingLabel] = useState(prefill?.listingLabel ?? "");

  const [buyerQuery, setBuyerQuery] = useState("");
  const [buyerResults, setBuyerResults] = useState<Tables<"contacts">[]>([]);
  const [buyerId, setBuyerId] = useState(prefill?.buyerContactId ?? "");
  const [buyerLabel, setBuyerLabel] = useState(prefill?.buyerLabel ?? "");

  const [advisorId, setAdvisorId] = useState(prefill?.advisorId ?? "");
  const [dealValue, setDealValue] = useState("");
  const [commissionPercent, setCommissionPercent] = useState("");

  async function handleListingSearch() {
    if (!listingQuery.trim()) return;
    const supabase = createClient();
    setListingResults(await searchListings(supabase, listingQuery));
  }

  async function handleBuyerSearch() {
    if (!buyerQuery.trim()) return;
    const supabase = createClient();
    const { data } = await supabase.from("contacts").select("*").ilike("full_name", `%${buyerQuery}%`).limit(5);
    setBuyerResults(data ?? []);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!listingId || !buyerId || !advisorId) {
      toast.error("Listing, buyer, and primary advisor are all required");
      return;
    }
    setSubmitting(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("deals")
      .insert({
        listing_id: listingId,
        buyer_contact_id: buyerId,
        primary_advisor_id: advisorId,
        deal_value: dealValue ? Number(dealValue) : null,
        commission_percent: commissionPercent ? Number(commissionPercent) : null,
      })
      .select("id")
      .single();

    if (error || !data) {
      toast.error(`Couldn't create deal: ${error?.message ?? "unknown error"}`);
      setSubmitting(false);
      return;
    }
    router.push(`/crm/deals/${data.id}`);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" /> New Deal
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New deal</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <Label>Listing</Label>
            {listingId ? (
              <div className="flex items-center justify-between rounded-md border p-2 text-sm">
                {listingLabel}
                <button type="button" className="text-xs text-muted-foreground underline" onClick={() => setListingId("")}>
                  Change
                </button>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <Input placeholder="Search listings…" value={listingQuery} onChange={(e) => setListingQuery(e.target.value)} />
                  <Button type="button" size="sm" variant="outline" onClick={handleListingSearch}>
                    <Search className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {listingResults.length > 0 && (
                  <ul className="flex flex-col gap-1">
                    {listingResults.map((l) => (
                      <li key={l.id}>
                        <button
                          type="button"
                          className="w-full rounded-md border p-2 text-left text-sm hover:bg-secondary/50"
                          onClick={() => {
                            setListingId(l.id);
                            setListingLabel(localizedText(l.title) || l.slug);
                            setListingResults([]);
                          }}
                        >
                          {localizedText(l.title) || l.slug}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Buyer</Label>
            {buyerId ? (
              <div className="flex items-center justify-between rounded-md border p-2 text-sm">
                {buyerLabel}
                <button type="button" className="text-xs text-muted-foreground underline" onClick={() => setBuyerId("")}>
                  Change
                </button>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <Input placeholder="Search contacts…" value={buyerQuery} onChange={(e) => setBuyerQuery(e.target.value)} />
                  <Button type="button" size="sm" variant="outline" onClick={handleBuyerSearch}>
                    <Search className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {buyerResults.length > 0 && (
                  <ul className="flex flex-col gap-1">
                    {buyerResults.map((c) => (
                      <li key={c.id}>
                        <button
                          type="button"
                          className="w-full rounded-md border p-2 text-left text-sm hover:bg-secondary/50"
                          onClick={() => {
                            setBuyerId(c.id);
                            setBuyerLabel(c.full_name);
                            setBuyerResults([]);
                          }}
                        >
                          {c.full_name} <span className="text-xs text-muted-foreground">{c.phone}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Primary advisor</Label>
            <Select value={advisorId} onValueChange={setAdvisorId}>
              <SelectTrigger>
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                {team.map((m) => (
                  <SelectItem key={m.profileId} value={m.profileId}>
                    {m.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Deal value (₹)</Label>
              <Input type="number" value={dealValue} onChange={(e) => setDealValue(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Commission %</Label>
              <Input type="number" step="0.1" value={commissionPercent} onChange={(e) => setCommissionPercent(e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={submitting || !listingId || !buyerId || !advisorId}>
              {submitting ? "Creating…" : "Create & edit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
