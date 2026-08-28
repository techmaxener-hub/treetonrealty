import { describe, expect, it } from "vitest";
import { aggregateByYear, calculateEmi, generateAmortizationSchedule } from "./emi";

describe("calculateEmi", () => {
  it("matches a known reducing-balance EMI value", () => {
    // Textbook example: 10,00,000 principal, 10% p.a., 12 months -> EMI ~= 87,916
    const result = calculateEmi({ principal: 1_000_000, annualRatePercent: 10, tenureYears: 1 });
    expect(result.monthlyEmi).toBeCloseTo(87_916, 0);
  });

  it("handles a 0% interest rate as a simple division", () => {
    const result = calculateEmi({ principal: 1_200_000, annualRatePercent: 0, tenureYears: 1 });
    expect(result.monthlyEmi).toBeCloseTo(100_000, 5);
    expect(result.totalInterest).toBeCloseTo(0, 5);
  });

  it("computes total payment and total interest consistently", () => {
    const result = calculateEmi({ principal: 5_000_000, annualRatePercent: 8.5, tenureYears: 20 });
    expect(result.totalPayment).toBeCloseTo(result.monthlyEmi * 240, 4);
    expect(result.totalInterest).toBeCloseTo(result.totalPayment - 5_000_000, 4);
  });

  it("throws on non-positive principal or tenure", () => {
    expect(() => calculateEmi({ principal: 0, annualRatePercent: 8, tenureYears: 20 })).toThrow();
    expect(() => calculateEmi({ principal: 1_000_000, annualRatePercent: 8, tenureYears: 0 })).toThrow();
  });

  it("throws on negative interest rate", () => {
    expect(() => calculateEmi({ principal: 1_000_000, annualRatePercent: -1, tenureYears: 10 })).toThrow();
  });
});

describe("generateAmortizationSchedule", () => {
  it("produces one row per month and fully amortizes to zero balance", () => {
    const schedule = generateAmortizationSchedule({
      principal: 1_000_000,
      annualRatePercent: 9,
      tenureYears: 2,
    });
    expect(schedule).toHaveLength(24);
    expect(schedule[23].balance).toBeCloseTo(0, 4);
  });

  it("each month's principal + interest approximately equals the EMI", () => {
    const input = { principal: 2_000_000, annualRatePercent: 7.5, tenureYears: 5 };
    const { monthlyEmi } = calculateEmi(input);
    const schedule = generateAmortizationSchedule(input);
    for (const row of schedule.slice(0, -1)) {
      expect(row.principalPaid + row.interestPaid).toBeCloseTo(monthlyEmi, 6);
    }
  });
});

describe("aggregateByYear", () => {
  it("aggregates a 24-month schedule into 2 years", () => {
    const schedule = generateAmortizationSchedule({
      principal: 1_000_000,
      annualRatePercent: 9,
      tenureYears: 2,
    });
    const years = aggregateByYear(schedule);
    expect(years).toHaveLength(2);
    expect(years[1].balance).toBeCloseTo(0, 4);
  });
});
