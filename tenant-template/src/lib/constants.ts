import type {
  AutomationTriggerType,
  DealDocType,
  DealDocStatus,
  DealStage,
  LeadScore,
  LeadSource,
  LeadStage,
  ListingMediaType,
  ListingOfferType,
  ListingSegment,
  ListingStatus,
  NotificationChannel,
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

export const DEAL_STAGES: { value: DealStage; label: string }[] = [
  { value: "negotiation", label: "Negotiation" },
  { value: "documentation", label: "Documentation" },
  { value: "closed", label: "Closed" },
];

export const DEAL_DOC_TYPE_LABELS: Record<DealDocType, string> = {
  agreement: "Agreement",
  token_receipt: "Token Receipt",
  kyc_buyer: "Buyer KYC",
  kyc_seller: "Seller KYC",
  other: "Other",
};

export const DEAL_DOC_STATUS_LABELS: Record<DealDocStatus, string> = {
  pending: "Pending",
  uploaded: "Uploaded",
  verified: "Verified",
};

export const DEAL_DOC_STATUS_CLASSES: Record<DealDocStatus, string> = {
  pending: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  uploaded: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900",
  verified: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900",
};

export const AUTOMATION_TRIGGER_LABELS: Record<AutomationTriggerType, string> = {
  new_lead: "New lead acknowledgment + agent alert",
  no_response_sla: "No-response SLA nudge",
  drip_sequence: "Drip follow-up sequence",
  new_listing_match: "New listing matches saved search",
  post_site_visit: "Post-site-visit feedback request",
  post_closing: "Post-closing review/referral request",
  abandoned_browse: "Abandoned browse retargeting",
  birthday_anniversary: "Birthday / anniversary greetings",
  price_drop_status_change: "Price drop / status change alert",
};

export const AUTOMATION_TRIGGER_DESCRIPTIONS: Record<AutomationTriggerType, string> = {
  new_lead: "Fires the moment a lead is captured -- WhatsApp + email acknowledgment to the lead, plus a WhatsApp alert to the assigned agent (or the broker, if unassigned).",
  no_response_sla: "Nudges the assigned agent if a lead has had no logged activity within the configured number of hours.",
  drip_sequence: "Sends a check-in WhatsApp message to a lead on each configured day offset (e.g. Day 1, 3, 7) if they're still in an open stage.",
  new_listing_match: "When a listing is published, alerts anyone with a saved search whose criteria it matches.",
  post_site_visit: "Asks for feedback shortly after a site visit is logged against a lead.",
  post_closing: "Asks the buyer for a review/referral once a deal reaches the closed stage.",
  abandoned_browse: "Emails a contact who has viewed several listings without enquiring further, once linked to a submitted form.",
  birthday_anniversary: "Sends a greeting on a contact's birthday or anniversary, if on file.",
  price_drop_status_change: "Alerts leads tied to a listing when its price drops or its status changes.",
};

export const NOTIFICATION_CHANNEL_LABELS: Record<NotificationChannel, string> = {
  whatsapp: "WhatsApp",
  email: "Email",
  sms: "SMS",
};
