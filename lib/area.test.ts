import { describe, expect, it } from "vitest";
import { convertArea, formatArea } from "./area";

describe("convertArea", () => {
  it("returns the same value for sqft", () => {
    expect(convertArea(1000, "sqft")).toBe(1000);
  });

  it("converts sqft to sqyd (1 Sq.Yard = 9 Sq.Ft)", () => {
    expect(convertArea(900, "sqyd")).toBe(100);
  });

  it("converts sqft to guntha (1 Guntha = 1089 Sq.Ft)", () => {
    expect(convertArea(1089, "guntha")).toBe(1);
  });

  it("converts sqft to acre (1 Acre = 43,560 Sq.Ft)", () => {
    expect(convertArea(43_560, "acre")).toBe(1);
  });

  it("converts sqft to cent (1 Cent = 435.6 Sq.Ft)", () => {
    expect(convertArea(435.6, "cent")).toBe(1);
  });

  it("converts sqft to marla (1 Marla = 272.25 Sq.Ft, Punjab/North India)", () => {
    expect(convertArea(272.25, "marla")).toBe(1);
  });

  it("converts sqft to sqm (1 Sq.Meter = 10.7639 Sq.Ft)", () => {
    expect(convertArea(10.7639, "sqm")).toBeCloseTo(1, 10);
  });

  it("converts sqft to Gujarat bigha by default (~17,427 Sq.Ft)", () => {
    expect(convertArea(17_427, "bigha")).toBe(1);
  });

  it("throws for a state with no registered Bigha factor", () => {
    // @ts-expect-error deliberately passing an unregistered region
    expect(() => convertArea(17_427, "bigha", { bighaRegion: "maharashtra" })).toThrow();
  });

  it("throws on negative sqft", () => {
    expect(() => convertArea(-1, "sqft")).toThrow();
  });

  it("throws on non-finite sqft", () => {
    expect(() => convertArea(Number.NaN, "sqft")).toThrow();
  });
});

describe("formatArea", () => {
  it("formats sqft with no decimals", () => {
    expect(formatArea(2450, "sqft")).toBe("2,450 Sq.Ft");
  });

  it("formats non-sqft units with up to 2 decimals", () => {
    expect(formatArea(900, "sqyd")).toBe("100 Sq.Yard (Gaj)");
    expect(formatArea(1000, "sqyd")).toBe("111.11 Sq.Yard (Gaj)");
  });
});
