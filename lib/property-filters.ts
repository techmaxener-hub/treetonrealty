import type { Developer, PossessionYear, Property, PropertyTypology } from "@/lib/mock-data";

export type PossessionFilter = "all" | "ready" | "2026" | "2027" | "2028";

export interface PropertyFilters {
  corridor: string | "all";
  typology: PropertyTypology | "all";
  developer: Developer | "all";
  possession: PossessionFilter;
  bhk: string | null;
  priceRange: [number, number];
  amenities: string[];
  gujreraVerifiedOnly: boolean;
}

export const DEFAULT_PRICE_RANGE: [number, number] = [0.75, 15];

export const DEFAULT_FILTERS: PropertyFilters = {
  corridor: "all",
  typology: "all",
  developer: "all",
  possession: "all",
  bhk: null,
  priceRange: DEFAULT_PRICE_RANGE,
  amenities: [],
  gujreraVerifiedOnly: false,
};

function matchesPossession(possessionYear: PossessionYear, filter: PossessionFilter) {
  if (filter === "all") return true;
  if (filter === "ready") return possessionYear === "Ready";
  return possessionYear === Number(filter);
}

function matchesBhk(property: Property, bhk: string | null) {
  if (!bhk) return true;
  if (bhk === "5+") return property.bedrooms >= 5;
  return property.bedrooms === Number(bhk);
}

export function filterProperties(properties: Property[], filters: PropertyFilters) {
  return properties.filter((property) => {
    if (filters.corridor !== "all" && property.corridorSlug !== filters.corridor) return false;
    if (filters.typology !== "all" && property.typology !== filters.typology) return false;
    if (filters.developer !== "all" && property.developer !== filters.developer) return false;
    if (!matchesPossession(property.possessionYear, filters.possession)) return false;
    if (!matchesBhk(property, filters.bhk)) return false;
    if (property.priceInCr < filters.priceRange[0] || property.priceInCr > filters.priceRange[1]) {
      return false;
    }
    if (filters.gujreraVerifiedOnly && !property.gujreraVerified) return false;
    if (
      filters.amenities.length > 0 &&
      !filters.amenities.every((a) => property.amenities.includes(a))
    ) {
      return false;
    }
    return true;
  });
}

export function countActiveFilters(filters: PropertyFilters) {
  let count = 0;
  if (filters.developer !== "all") count++;
  if (filters.possession !== "all") count++;
  if (filters.gujreraVerifiedOnly) count++;
  if (filters.amenities.length > 0) count += filters.amenities.length;
  if (
    filters.priceRange[0] !== DEFAULT_PRICE_RANGE[0] ||
    filters.priceRange[1] !== DEFAULT_PRICE_RANGE[1]
  ) {
    count++;
  }
  return count;
}
