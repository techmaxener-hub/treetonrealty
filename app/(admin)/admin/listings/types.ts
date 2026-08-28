import type { Database } from "@/lib/supabase/database.types";

export type PropertyType = Database["public"]["Enums"]["property_type_enum"];
export type ListingStatus = Database["public"]["Enums"]["listing_status_enum"];
export type FurnishingStatus = Database["public"]["Enums"]["furnishing_status_enum"];
export type PossessionStatus = Database["public"]["Enums"]["possession_status_enum"];
export type FacingDirection = Database["public"]["Enums"]["facing_direction_enum"];
export type VastuScore = Database["public"]["Enums"]["vastu_score_enum"];
export type RoomCategory = Database["public"]["Enums"]["room_category_enum"];
export type CertificateStatus = Database["public"]["Enums"]["certificate_status_enum"];

export const PROPERTY_TYPES: PropertyType[] = [
  "Apartment",
  "Villa",
  "Plot",
  "Commercial",
  "Office",
  "Shop",
];

export const LISTING_STATUSES: ListingStatus[] = [
  "Draft",
  "Active",
  "Under Offer",
  "Sold",
  "Withdrawn",
];

export const FURNISHING_STATUSES: FurnishingStatus[] = [
  "Unfurnished",
  "Semi-Furnished",
  "Fully-Furnished",
];

export const POSSESSION_STATUSES: PossessionStatus[] = ["Ready", "Under Construction"];

export const FACING_DIRECTIONS: FacingDirection[] = [
  "N",
  "S",
  "E",
  "W",
  "NE",
  "NW",
  "SE",
  "SW",
];

export const VASTU_SCORES: VastuScore[] = [
  "Excellent",
  "Good",
  "Average",
  "Not Vastu Compliant",
];

export const ROOM_CATEGORIES: RoomCategory[] = [
  "Living Room",
  "Bedroom",
  "Kitchen",
  "Exterior",
  "Amenities",
  "Floor Plan",
];

export const CERTIFICATE_STATUSES: CertificateStatus[] = ["Not Applied", "Applied", "Received"];

export type ListingRow = Database["public"]["Tables"]["listings"]["Row"];

export type ListingListItem = Pick<
  ListingRow,
  | "id"
  | "ref_code"
  | "title"
  | "locality"
  | "property_type"
  | "status"
  | "price_inr"
  | "bhk"
  | "is_published"
  | "updated_at"
>;

export type ListingImageRow = Database["public"]["Tables"]["listing_images"]["Row"];
export type AmenityRow = Database["public"]["Tables"]["amenities"]["Row"];
export type LegalTitleTypeRow = Database["public"]["Tables"]["legal_title_types"]["Row"];
export type ListingLegalStatusRow = Database["public"]["Tables"]["listing_legal_status"]["Row"];

export type ListingFormInitialData = {
  listing: ListingRow;
  images: ListingImageRow[];
  amenityIds: string[];
  legalStatus: ListingLegalStatusRow | null;
};
