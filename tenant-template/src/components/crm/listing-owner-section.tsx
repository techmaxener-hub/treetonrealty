"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, Trash2, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/types/database";
import { useCurrentProfile, canManage } from "@/lib/hooks/use-current-profile";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type OwnerRow = Tables<"listing_owners"> & { contact: Tables<"contacts"> | null };

export function ListingOwnerSection({ listingId, owners }: { listingId: string; owners: OwnerRow[] }) {
  const router = useRouter();
  const profile = useCurrentProfile();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Tables<"contacts">[]>([]);
  const [searching, setSearching] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  async function handleSearch() {
    if (!query.trim()) return;
    setSearching(true);
    const supabase = createClient();
    const { data } = await supabase.from("contacts").select("*").ilike("full_name", `%${query}%`).limit(5);
    setResults(data ?? []);
    setSearching(false);
  }

  async function linkOwner(contactId: string) {
    const supabase = createClient();
    const { error } = await supabase.from("listing_owners").insert({ listing_id: listingId, contact_id: contactId });
    if (error) {
      toast.error(`Couldn't link owner: ${error.message}`);
    } else {
      setResults([]);
      setQuery("");
      router.refresh();
    }
  }

  async function handleCreateAndLink() {
    if (!newName.trim()) return;
    const supabase = createClient();
    const { data: contact, error } = await supabase
      .from("contacts")
      .insert({ full_name: newName, phone: newPhone || null, contact_type: ["seller"] })
      .select("id")
      .single();
    if (error || !contact) {
      toast.error(`Couldn't create contact: ${error?.message ?? "unknown error"}`);
      return;
    }
    await linkOwner(contact.id);
    setNewName("");
    setNewPhone("");
  }

  async function handleUnlink(ownerId: string) {
    const supabase = createClient();
    const { error } = await supabase.from("listing_owners").delete().eq("id", ownerId);
    if (error) toast.error(`Couldn't remove: ${error.message}`);
    else router.refresh();
  }

  async function toggleConfidential(owner: OwnerRow) {
    const supabase = createClient();
    const { error } = await supabase.from("listing_owners").update({ confidential: !owner.confidential }).eq("id", owner.id);
    if (error) toast.error(`Couldn't update: ${error.message}`);
    else router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-muted-foreground">
        Seller/landlord contact for this property — kept separate from buyer-side leads.
      </p>

      {owners.length === 0 ? (
        <p className="text-sm text-muted-foreground">No owner linked yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {owners.map((owner) => (
            <li key={owner.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
              <div>
                <p className="font-medium">{owner.contact?.full_name ?? "Unknown"}</p>
                <p className="text-xs text-muted-foreground">{owner.contact?.phone ?? "—"}</p>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <input type="checkbox" checked={owner.confidential} onChange={() => toggleConfidential(owner)} className="h-3.5 w-3.5" />
                  Confidential
                </label>
                <button type="button" onClick={() => handleUnlink(owner.id)} className="text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-2 border-t pt-3">
        <Label className="text-xs">Link an existing contact</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Search by name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearch())}
          />
          <Button type="button" size="sm" variant="outline" onClick={handleSearch} disabled={searching}>
            <Search className="h-3.5 w-3.5" />
          </Button>
        </div>
        {results.length > 0 && (
          <ul className="flex flex-col gap-1">
            {results.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => linkOwner(c.id)}
                  className="w-full rounded-md border p-2 text-left text-sm hover:bg-secondary/50"
                >
                  {c.full_name} <span className="text-xs text-muted-foreground">{c.phone}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {canManage(profile.role) && (
        <div className="flex flex-col gap-2 border-t pt-3">
          <Label className="text-xs">Or add a new owner contact</Label>
          <div className="flex gap-2">
            <Input placeholder="Name" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <Input placeholder="Phone" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
            <Button type="button" size="sm" onClick={handleCreateAndLink} disabled={!newName.trim()}>
              <UserPlus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
