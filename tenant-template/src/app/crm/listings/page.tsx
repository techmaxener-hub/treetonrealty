import { createClient } from "@/lib/supabase/server";
import { getListingsList } from "@/lib/data/listings";
import { getLocalitiesLite } from "@/lib/data/localities";
import { ListingsGrid } from "@/components/crm/listings-grid";

export const dynamic = "force-dynamic";

export default async function ListingsPage() {
  const supabase = await createClient();
  const [listings, localities] = await Promise.all([getListingsList(supabase), getLocalitiesLite(supabase)]);

  return <ListingsGrid listings={listings} localities={localities} />;
}
