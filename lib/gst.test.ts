import { describe, expect, it } from "vitest";
import { calculateGstAmount, getGstApplicability } from "./gst";

describe("getGstApplicability", () => {
  it("does not apply GST to ready-to-move residential", () => {
    expect(getGstApplicability("Apartment", "Ready").applies).toBe(false);
    expect(getGstApplicability("Villa", "Ready").applies).toBe(false);
  });

  it("applies GST to under-construction residential", () => {
    const result = getGstApplicability("Apartment", "Under Construction");
    expect(result.applies).toBe(true);
    expect(result.rate).toBeGreaterThan(0);
  });

  it("applies GST to commercial property regardless of possession status", () => {
    expect(getGstApplicability("Commercial", "Ready").applies).toBe(true);
    expect(getGstApplicability("Office", "Under Construction").applies).toBe(true);
    expect(getGstApplicability("Shop", "Ready").applies).toBe(true);
  });
});

describe("calculateGstAmount", () => {
  it("returns 0 for ready-to-move residential", () => {
    expect(calculateGstAmount(10_000_000, "Apartment", "Ready")).toBe(0);
  });

  it("returns a positive amount for under-construction residential", () => {
    expect(calculateGstAmount(10_000_000, "Apartment", "Under Construction")).toBeGreaterThan(0);
  });

  it("returns a positive amount for commercial", () => {
    expect(calculateGstAmount(10_000_000, "Office", "Ready")).toBeGreaterThan(0);
  });

  it("throws on negative base price", () => {
    expect(() => calculateGstAmount(-1, "Apartment", "Ready")).toThrow();
  });
});
