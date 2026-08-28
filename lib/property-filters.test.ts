import { describe, expect, it } from "vitest";
import {
  DEFAULT_SEARCH_FILTERS,
  countActiveFilters,
  parseSearchFilters,
  serializeSearchFilters,
} from "./property-filters";

describe("parseSearchFilters", () => {
  it("returns defaults for an empty query string", () => {
    expect(parseSearchFilters(new URLSearchParams())).toEqual(DEFAULT_SEARCH_FILTERS);
  });

  it("parses a fully-populated query string", () => {
    const params = new URLSearchParams(
      "locality=Bodakdev,Bopal&type=Apartment,Villa&bhk=3,4&minPrice=5000000&maxPrice=20000000&furnishing=Semi-Furnished&possession=Ready&facing=NE&reraOnly=1"
    );
    const filters = parseSearchFilters(params);
    expect(filters.localities).toEqual(["Bodakdev", "Bopal"]);
    expect(filters.propertyTypes).toEqual(["Apartment", "Villa"]);
    expect(filters.bhk).toEqual([3, 4]);
    expect(filters.minPrice).toBe(5_000_000);
    expect(filters.maxPrice).toBe(20_000_000);
    expect(filters.furnishing).toEqual(["Semi-Furnished"]);
    expect(filters.possessionStatus).toEqual(["Ready"]);
    expect(filters.facingDirection).toEqual(["NE"]);
    expect(filters.reraVerifiedOnly).toBe(true);
  });

  it("drops unrecognized enum values instead of throwing", () => {
    const params = new URLSearchParams("type=NotARealType,Apartment");
    expect(parseSearchFilters(params).propertyTypes).toEqual(["Apartment"]);
  });
});

describe("serializeSearchFilters", () => {
  it("produces an empty string for default filters", () => {
    expect(serializeSearchFilters(DEFAULT_SEARCH_FILTERS)).toBe("");
  });

  it("round-trips through parse/serialize", () => {
    const original = parseSearchFilters(
      new URLSearchParams("locality=Bodakdev&type=Apartment&bhk=3&reraOnly=1")
    );
    const roundTripped = parseSearchFilters(new URLSearchParams(serializeSearchFilters(original)));
    expect(roundTripped).toEqual(original);
  });
});

describe("countActiveFilters", () => {
  it("counts zero for defaults", () => {
    expect(countActiveFilters(DEFAULT_SEARCH_FILTERS)).toBe(0);
  });

  it("counts each active filter", () => {
    const filters = parseSearchFilters(new URLSearchParams("locality=Bodakdev,Bopal&reraOnly=1"));
    expect(countActiveFilters(filters)).toBe(3);
  });
});
