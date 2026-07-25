import type {
  LeadScore,
  LeadSource,
  LeadStage,
  ListingMediaType,
  ListingOfferType,
  ListingSegment,
  ListingStatus,
  PossessionStatus,
  ProfileRole,
  PropertyTypeEnum,
} from "@/lib/types/database";

export const LEAD_STAGES: { value: LeadStage; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "site_visit_scheduled", label: "Site Visit Scheduled" },
  { value: "site_visit_done", label: "Site Visit Done" },
  { value: "negotiation", label: "Negotiation" },
  { value: "documentation", label: "Documentation" },
  { value: "closed_won", label: "Closed Won" },
  { value: "closed_lost", label: "Closed Lost" },
];

export const OPEN_LEAD_STAGES = LEAD_STAGES.filter((s) => s.value !== "closed_won" && s.value !== "closed_lost");

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  website_form: "Website Form",
  whatsapp_click: "WhatsApp",
  instagram: "Instagram",
  referral: "Referral",
  walk_in: "Walk-in",
  magicbricks: "MagicBricks",
  acres_99: "99acres",
  google: "Google",
  other: "Other",
};

export const LEAD_SCORE_LABELS: Record<LeadScore, string> = {
  hot: "Hot",
  warm: "Warm",
  cold: "Cold",
};

export const LEAD_SCORE_CLASSES: Record<LeadScore, string> = {
  hot: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900",
  warm: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900",
  cold: "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-900",
};

export const ROLE_LABELS: Record<ProfileRole, string> = {
  broker: "Broker",
  employee: "Employee",
  master_advisor: "Master Advisor",
  advisor: "Advisor",
};

export const PROPERTY_TYPE_LABELS: Record<PropertyTypeEnum, string> = {
  apartment: "Apartment",
  villa: "Villa",
  plot: "Plot",
  commercial: "Commercial",
  farmhouse: "Farmhouse",
  penthouse: "Penthouse",
};

export const SEGMENT_LABELS: Record<ListingSegment, string> = {
  luxury: "Luxury",
  premium: "Premium",
  affordable: "Affordable",
  commercial: "Commercial",
  weekend_home: "Weekend Home",
};

export const OFFER_TYPE_LABELS: Record<ListingOfferType, string> = {
  sale: "Sale",
  rent: "Rent",
};

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  available: "Available",
  under_offer: "Under Offer",
  sold: "Sold",
  rented: "Rented",
  off_market: "Off-Market",
};

export const LISTING_STATUS_CLASSES: Record<ListingStatus, string> = {
  available: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900",
  under_offer: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900",
  sold: "bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  rented: "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-900",
  off_market: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900",
};

export const POSSESSION_STATUS_LABELS: Record<PossessionStatus, string> = {
  ready_to_move: "Ready to Move",
  under_construction: "Under Construction",
};

export const LISTING_MEDIA_TYPE_LABELS: Record<ListingMediaType, string> = {
  photo: "Photo",
  floor_plan: "Floor Plan",
  video_youtube: "YouTube Video",
  document: "Document",
};

export const LANGUAGES: { value: "en" | "hi" | "gu"; label: string }[] = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "gu", label: "Gujarati" },
];
