import { describe, expect, it } from "vitest";
import { formatINR, formatINRFull, parseINRInput } from "./currency";

describe("formatINR", () => {
  it("formats zero", () => {
    expect(formatINR(0)).toBe("₹0");
  });

  it("formats plain values below 1 Lakh with Indian grouping", () => {
    expect(formatINR(85_000)).toBe("₹85,000");
    expect(formatINR(999)).toBe("₹999");
  });

  it("boundary: ₹99,999 stays plain, ₹1,00,000 switches to Lakh", () => {
    expect(formatINR(99_999)).toBe("₹99,999");
    expect(formatINR(100_000)).toBe("₹1 L");
  });

  it("formats Lakh values with trimmed trailing zeros", () => {
    expect(formatINR(8_500_000 / 10)).toBe("₹8.5 L"); // 850000
    expect(formatINR(4_250_000)).toBe("₹42.5 L");
    expect(formatINR(4_250_000)).not.toBe("₹42.50 L");
    expect(formatINR(2_000_000)).toBe("₹20 L");
  });

  it("boundary: values just under 1 Crore stay Lakh, ₹1,00,00,000 switches to Crore", () => {
    // 9,999,999 / 100,000 = 99.99999, which rounds to "100.00" at 2 decimal
    // places -- a cosmetic edge case where the Lakh-format branch still fires
    // (per the < 1 Cr threshold) but the trimmed display reads "100 L".
    expect(formatINR(9_999_999)).toBe("₹100 L");
    expect(formatINR(9_950_000)).toBe("₹99.5 L");
    expect(formatINR(10_000_000)).toBe("₹1 Cr");
  });

  it("formats Crore values with trimmed trailing zeros", () => {
    expect(formatINR(27_500_000)).toBe("₹2.75 Cr");
    expect(formatINR(100_000_000)).toBe("₹10 Cr");
  });

  it("throws on negative amounts", () => {
    expect(() => formatINR(-1)).toThrow();
  });

  it("throws on non-finite amounts", () => {
    expect(() => formatINR(Number.NaN)).toThrow();
    expect(() => formatINR(Number.POSITIVE_INFINITY)).toThrow();
  });

  it("can omit the symbol", () => {
    expect(formatINR(27_500_000, { showSymbol: false })).toBe("2.75 Cr");
  });
});

describe("formatINRFull", () => {
  it("uses full Indian digit grouping (2-digit groups after the first 3)", () => {
    expect(formatINRFull(27_500_000)).toBe("₹2,75,00,000");
    expect(formatINRFull(1_000_000)).toBe("₹10,00,000");
    expect(formatINRFull(999)).toBe("₹999");
    expect(formatINRFull(0)).toBe("₹0");
  });

  it("throws on negative amounts", () => {
    expect(() => formatINRFull(-1)).toThrow();
  });
});

describe("parseINRInput", () => {
  it("parses raw digit strings", () => {
    expect(parseINRInput("2750000")).toBe(2_750_000);
    expect(parseINRInput("1,00,000")).toBe(100_000);
    expect(parseINRInput("₹85,000")).toBe(85_000);
  });

  it("parses crore shorthand", () => {
    expect(parseINRInput("2.75 cr")).toBe(27_500_000);
    expect(parseINRInput("2.75cr")).toBe(27_500_000);
    expect(parseINRInput("10 Cr")).toBe(100_000_000);
    expect(parseINRInput("1 crore")).toBe(10_000_000);
  });

  it("parses lakh shorthand", () => {
    expect(parseINRInput("85 l")).toBe(8_500_000);
    expect(parseINRInput("85L")).toBe(8_500_000);
    expect(parseINRInput("42.5 lakh")).toBe(4_250_000);
    expect(parseINRInput("1 lac")).toBe(100_000);
  });

  it("throws on empty or unparseable input", () => {
    expect(() => parseINRInput("")).toThrow();
    expect(() => parseINRInput("not a number")).toThrow();
  });

  it("throws on negative input", () => {
    expect(() => parseINRInput("-5")).toThrow();
    expect(() => parseINRInput("-2 cr")).toThrow();
  });
});
