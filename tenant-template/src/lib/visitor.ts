const STORAGE_KEY = "visitor-id";
const CONTACT_STORAGE_KEY = "visitor-contact";

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

// Once someone has identified themselves once (contact form, WhatsApp
// capture), don't make them retype it on the next enquiry in the same
// browser.
export function getRememberedContact(): { name: string; phone: string } | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(window.localStorage.getItem(CONTACT_STORAGE_KEY) ?? "null");
  } catch {
    return null;
  }
}

export function rememberContact(name: string, phone: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify({ name, phone }));
}
