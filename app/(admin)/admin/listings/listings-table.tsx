"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatINR } from "@/lib/currency";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateListingStatus } from "./actions";
import { LISTING_STATUSES, type ListingListItem, type ListingStatus } from "./types";

const STATUS_VARIANT: Record<ListingStatus, "default" | "verified" | "gold" | "muted"> = {
  Draft: "muted",
  Active: "verified",
  "Under Offer": "gold",
  Sold: "default",
  Withdrawn: "muted",
};

export function ListingsTable({ listings }: { listings: ListingListItem[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ListingStatus | "all">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<ListingStatus>("Active");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return listings.filter((listing) => {
      const matchesSearch =
        !term ||
        listing.title.toLowerCase().includes(term) ||
        listing.locality.toLowerCase().includes(term) ||
        listing.ref_code.toLowerCase().includes(term);
      const matchesStatus = statusFilter === "all" || listing.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [listings, search, statusFilter]);

  function toggleAll(checked: boolean) {
    setSelected(checked ? new Set(filtered.map((l) => l.id)) : new Set());
  }

  function toggleOne(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function applyBulkStatus() {
    const ids = Array.from(selected);
    startTransition(() => {
      updateListingStatus(ids, bulkStatus).then(() => {
        setSelected(new Set());
        router.refresh();
      });
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search title, locality, ref code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as ListingStatus | "all")}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {LISTING_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selected.size > 0 ? (
        <div className="flex items-center gap-3 rounded-md border border-border-subtle bg-white p-3">
          <span className="text-sm text-slate-deep">{selected.size} selected</span>
          <Select value={bulkStatus} onValueChange={(v) => setBulkStatus(v as ListingStatus)}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LISTING_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" disabled={isPending} onClick={applyBulkStatus}>
            {isPending ? "Applying..." : "Apply status"}
          </Button>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-border-subtle bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border-subtle bg-alabaster text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="w-10 px-4 py-3">
                <Checkbox
                  checked={filtered.length > 0 && selected.size === filtered.length}
                  onCheckedChange={(checked) => toggleAll(checked === true)}
                />
              </th>
              <th className="px-4 py-3">Listing</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Published</th>
              <th className="px-4 py-3">Updated</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((listing) => (
              <tr key={listing.id} className="border-b border-border-subtle last:border-0 hover:bg-alabaster/60">
                <td className="px-4 py-3">
                  <Checkbox
                    checked={selected.has(listing.id)}
                    onCheckedChange={(checked) => toggleOne(listing.id, checked === true)}
                  />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/listings/${listing.id}/edit`}
                    className="font-medium text-slate-deep hover:underline"
                  >
                    {listing.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {listing.ref_code} &middot; {listing.locality}
                    {listing.bhk ? ` · ${listing.bhk} BHK` : ""}
                  </p>
                </td>
                <td className="px-4 py-3 text-slate-deep">{listing.property_type}</td>
                <td className="px-4 py-3 text-slate-deep">{formatINR(listing.price_inr)}</td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_VARIANT[listing.status]}>{listing.status}</Badge>
                </td>
                <td className="px-4 py-3 text-slate-deep">
                  {listing.is_published ? "Yes" : "No"}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(listing.updated_at).toLocaleDateString("en-IN")}
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No listings match your filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
