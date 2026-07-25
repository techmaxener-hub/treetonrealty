import type { LeadSource } from "@/lib/types/database";

const STORAGE_KEY = "lead-attribution";

export type StoredAttribution = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  landingPath?: string;
};

// First-touch attribution: a campaign link's utm_* params only live on
// the URL of whichever page they landed on, and Next.js client-side
// navigation drops them the moment the visitor clicks anywhere else on
// the site. Capture once, on first load, and never overwrite -- so
// "how did they find us" survives all the way to whichever page they
// actually submit a form or click WhatsApp from.
export function captureAttributionOnce() {
  if (typeof window === "undefined") return;
  if (window.sessionStorage.getItem(STORAGE_KEY)) return;

  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get("utm_source") ?? undefined;
  const utmMedium = params.get("utm_medium") ?? undefined;
  const utmCampaign = params.get("utm_campaign") ?? undefined;

  if (!utmSource && !utmCampaign) return;

  const attribution: StoredAttribution = { utmSource, utmMedium, utmCampaign, landingPath: window.location.pathname };
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
}

export function getStoredAttribution(): StoredAttribution {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

const SOURCE_MAP: Record<string, LeadSource> = {
  instagram: "instagram",
  ig: "instagram",
  google: "google",
  whatsapp: "whatsapp_click",
  referral: "referral",
  magicbricks: "magicbricks",
  "99acres": "acres_99",
};

// Maps a known utm_source to the CRM's lead_source enum where there's an
// honest match (so an Instagram-bio-link campaign shows up as an
// Instagram lead in the pipeline, not a generic "website form" one);
// falls back to the channel-appropriate default otherwise rather than
// guessing at a mapping that isn't there.
export function resolveLeadSource(fallback: LeadSource): { source: LeadSource; sourceDetail: string | null; campaign: string | null } {
  const attribution = getStoredAttribution();
  const mapped = attribution.utmSource ? SOURCE_MAP[attribution.utmSource.toLowerCase()] : undefined;

  return {
    source: mapped ?? fallback,
    sourceDetail: attribution.utmMedium ?? attribution.landingPath ?? null,
    campaign: attribution.utmCampaign ?? null,
  };
}
