"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getVisitorId } from "@/lib/visitor";
import { recordListingView } from "@/lib/hooks/use-abandoned-browse";

// No UI -- mounted once per listing detail page. Feeds both halves of
// the abandoned_browse trigger: the local view-count history the client
// widget reads synchronously, and the page_events row the server-side
// scan (scan_abandoned_browse) reads once this visitor_id gets linked to
// a contact_id via submit_lead/create_saved_search.
export function ListingViewTracker({ listingId }: { listingId: string }) {
  useEffect(() => {
    recordListingView(listingId);
    const supabase = createClient();
    void supabase.rpc("log_page_event", {
      p_visitor_id: getVisitorId(),
      p_event_type: "listing_view",
      p_listing_id: listingId,
    });
  }, [listingId]);

  return null;
}
