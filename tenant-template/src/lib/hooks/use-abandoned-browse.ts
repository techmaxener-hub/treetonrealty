"use client";

import { useEffect, useState } from "react";

const VIEWS_KEY = "abandoned-browse-views";
const PROMPTED_KEY = "abandoned-browse-prompted-at";

// Mirrors the server-side scan_abandoned_browse() defaults
// (min_views: 3, window_hours: 48) so the two halves of this trigger --
// client widget and server email retarget -- feel like one behavior even
// though they run on completely different data (this browser's own
// localStorage vs. page_events keyed by contact_id). A broker can retune
// the server side via the CRM automation settings page; this client copy
// stays a reasonable fixed default since there's no signed-in session on
// the public site to read broker config from without an extra request.
const MIN_VIEWS = 3;
const WINDOW_HOURS = 48;
const RE_PROMPT_HOURS = 48;

type ViewRecord = { listingId: string; at: number };

function readViews(): ViewRecord[] {
  try {
    const raw = window.localStorage.getItem(VIEWS_KEY);
    return raw ? (JSON.parse(raw) as ViewRecord[]) : [];
  } catch {
    return [];
  }
}

// Called on every listing detail page mount (see ListingViewTracker) --
// separate from the server-side page_events insert, since this needs to
// be readable synchronously on the client without a round trip.
export function recordListingView(listingId: string) {
  if (typeof window === "undefined") return;
  try {
    const cutoff = Date.now() - WINDOW_HOURS * 60 * 60 * 1000;
    const recent = readViews().filter((v) => v.at > cutoff);
    if (!recent.some((v) => v.listingId === listingId)) {
      recent.push({ listingId, at: Date.now() });
    }
    window.localStorage.setItem(VIEWS_KEY, JSON.stringify(recent));
  } catch {
    // localStorage unavailable (private browsing, quota) -- widget just won't fire
  }
}

export function useAbandonedBrowse(): { shouldPrompt: boolean; dismiss: () => void } {
  const [shouldPrompt, setShouldPrompt] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const cutoff = Date.now() - WINDOW_HOURS * 60 * 60 * 1000;
      const distinctListings = new Set(readViews().filter((v) => v.at > cutoff).map((v) => v.listingId));
      if (distinctListings.size < MIN_VIEWS) return;

      const lastPrompted = Number(window.localStorage.getItem(PROMPTED_KEY) ?? "0");
      if (Date.now() - lastPrompted < RE_PROMPT_HOURS * 60 * 60 * 1000) return;

      setShouldPrompt(true);
    } catch {
      // ignore -- no prompt is a safe fallback
    }
  }, []);

  function dismiss() {
    try {
      window.localStorage.setItem(PROMPTED_KEY, String(Date.now()));
    } catch {
      // ignore
    }
    setShouldPrompt(false);
  }

  return { shouldPrompt, dismiss };
}
