import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server-auth-client";
import { Button } from "@/components/ui/button";
import { ListingsTable } from "./listings-table";
import type { ListingListItem } from "./types";

export default async function ListingsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: listings, error } = await supabase
    .from("listings")
    .select(
      "id, ref_code, title, locality, property_type, status, price_inr, bhk, is_published, updated_at"
    )
    .order("updated_at", { ascending: false })
    .returns<ListingListItem[]>();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-deep">Inventory</h1>
          <p className="text-sm text-muted-foreground">
            {listings?.length ?? 0} listing{listings?.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button asChild variant="primary">
          <Link href="/admin/listings/new">+ New Listing</Link>
        </Button>
      </div>

      {error ? (
        <p className="text-sm text-destructive">Couldn&apos;t load listings: {error.message}</p>
      ) : (
        <ListingsTable listings={listings ?? []} />
      )}
    </div>
  );
}
