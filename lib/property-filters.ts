import type {
  FacingDirection,
  FurnishingStatus,
  ListingFilters,
  PossessionStatus,
  PropertyType,
} from "@/lib/queries/listings";

export interface ListingSearchFilters {
  localities: string[];
  propertyTypes: PropertyType[];
  bhk: number[];
  minPrice: number | null;
  maxPrice: number | null;
  furnishing: FurnishingStatus[];
  possessionStatus: PossessionStatus[];
  facingDirection: FacingDirection[];
  reraVerifiedOnly: boolean;
}

export const DEFAULT_SEARCH_FILTERS: ListingSearchFilters = {
  localities: [],
  propertyTypes: [],
  bhk: [],
  minPrice: null,
  maxPrice: null,
  furnishing: [],
  possessionStatus: [],
  facingDirection: [],
  reraVerifiedOnly: false,
};

const PROPERTY_TYPES: PropertyType[] = ["Apartment", "Villa", "Plot", "Commercial", "Office", "Shop"];
const FURNISHING_STATUSES: FurnishingStatus[] = ["Unfurnished", "Semi-Furnished", "Fully-Furnished"];
const POSSESSION_STATUSES: PossessionStatus[] = ["Ready", "Under Construction"];
const FACING_DIRECTIONS: FacingDirection[] = ["N", "S", "E", "W", "NE", "NW", "SE", "SW"];

function parseList<T extends string>(value: string | null, allowed: readonly T[]): T[] {
  if (!value) return [];
  return value.split(",").filter((v): v is T => (allowed as readonly string[]).includes(v));
}

/** Parses filters from a URL's search params -- the single source of truth for /properties. */
export function parseSearchFilters(searchParams: URLSearchParams): ListingSearchFilters {
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const bhk = searchParams.get("bhk");

  return {
    localities: searchParams.get("locality")?.split(",").filter(Boolean) ?? [],
    propertyTypes: parseList(searchParams.get("type"), PROPERTY_TYPES),
    bhk: bhk ? bhk.split(",").map(Number).filter((n) => Number.isFinite(n)) : [],
    minPrice: minPrice ? Number(minPrice) : null,
    maxPrice: maxPrice ? Number(maxPrice) : null,
    furnishing: parseList(searchParams.get("furnishing"), FURNISHING_STATUSES),
    possessionStatus: parseList(searchParams.get("possession"), POSSESSION_STATUSES),
    facingDirection: parseList(searchParams.get("facing"), FACING_DIRECTIONS),
    reraVerifiedOnly: searchParams.get("reraOnly") === "1",
  };
}

/** Serializes filters back to a query string for router.push, omitting empty/default values. */
export function serializeSearchFilters(filters: ListingSearchFilters): string {
  const params = new URLSearchParams();
  if (filters.localities.length) params.set("locality", filters.localities.join(","));
  if (filters.propertyTypes.length) params.set("type", filters.propertyTypes.join(","));
  if (filters.bhk.length) params.set("bhk", filters.bhk.join(","));
  if (filters.minPrice !== null) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== null) params.set("maxPrice", String(filters.maxPrice));
  if (filters.furnishing.length) params.set("furnishing", filters.furnishing.join(","));
  if (filters.possessionStatus.length) params.set("possession", filters.possessionStatus.join(","));
  if (filters.facingDirection.length) params.set("facing", filters.facingDirection.join(","));
  if (filters.reraVerifiedOnly) params.set("reraOnly", "1");
  return params.toString();
}

export function toListingFilters(filters: ListingSearchFilters): ListingFilters {
  return {
    localities: filters.localities.length ? filters.localities : undefined,
    propertyTypes: filters.propertyTypes.length ? filters.propertyTypes : undefined,
    bhk: filters.bhk.length ? filters.bhk : undefined,
    minPrice: filters.minPrice ?? undefined,
    maxPrice: filters.maxPrice ?? undefined,
    furnishing: filters.furnishing.length ? filters.furnishing : undefined,
    possessionStatus: filters.possessionStatus.length ? filters.possessionStatus : undefined,
    facingDirection: filters.facingDirection.length ? filters.facingDirection : undefined,
    reraVerifiedOnly: filters.reraVerifiedOnly || undefined,
  };
}

export function countActiveFilters(filters: ListingSearchFilters): number {
  return (
    filters.localities.length +
    filters.propertyTypes.length +
    filters.bhk.length +
    filters.furnishing.length +
    filters.possessionStatus.length +
    filters.facingDirection.length +
    (filters.minPrice !== null ? 1 : 0) +
    (filters.maxPrice !== null ? 1 : 0) +
    (filters.reraVerifiedOnly ? 1 : 0)
  );
}
