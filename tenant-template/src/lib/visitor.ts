const STORAGE_KEY = "visitor-id";

// A stable per-browser id for page_events -- powers "viewed 3+ listings,
// didn't enquire" retargeting (Step 8) and listing view counts. Not tied
// to any identity; just enough to de-duplicate a browsing session.
export function getVisitorId(): string {
  if (typeof window === "undefined") return "server";
  let id = window.localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
