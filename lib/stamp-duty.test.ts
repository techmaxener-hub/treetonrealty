import { describe, expect, it } from "vitest";
import { calculateStampDuty } from "./stamp-duty";

const GUJARAT_RATE = { stampDutyPercent: 4.9, registrationPercent: 1.0, womenDiscountPercent: null };
const DELHI_RATE = { stampDutyPercent: 6.0, registrationPercent: 1.0, womenDiscountPercent: 2.0 };

describe("calculateStampDuty", () => {
  it("computes stamp duty, registration, and total for a state with no women's discount", () => {
    const result = calculateStampDuty(10_000_000, GUJARAT_RATE);
    expect(result.stampDutyAmount).toBe(490_000);
    expect(result.registrationAmount).toBe(100_000);
    expect(result.total).toBe(10_590_000);
    expect(result.womenDiscountApplied).toBe(false);
  });

  it("applies the women's discount when requested and the rate defines one", () => {
    const result = calculateStampDuty(10_000_000, DELHI_RATE, { isWomanSoleOrCoOwner: true });
    expect(result.stampDutyPercent).toBe(4.0);
    expect(result.stampDutyAmount).toBe(400_000);
    expect(result.womenDiscountApplied).toBe(true);
    expect(result.womenDiscountAmount).toBe(200_000);
  });

  it("does not apply a discount if the rate has none, even if requested", () => {
    const result = calculateStampDuty(10_000_000, GUJARAT_RATE, { isWomanSoleOrCoOwner: true });
    expect(result.womenDiscountApplied).toBe(false);
    expect(result.stampDutyAmount).toBe(490_000);
  });

  it("throws on negative base price", () => {
    expect(() => calculateStampDuty(-1, GUJARAT_RATE)).toThrow();
  });
});
