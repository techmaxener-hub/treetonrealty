// Standard reducing-balance (amortizing) home loan EMI math -- not an approximation.
// EMI = P * r * (1+r)^n / ((1+r)^n - 1), where r is the monthly rate and n the
// number of monthly installments.

export interface EmiInput {
  principal: number;
  annualRatePercent: number;
  tenureYears: number;
}

export interface EmiResult {
  monthlyEmi: number;
  totalPayment: number;
  totalInterest: number;
}

function assertPositiveFinite(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be a positive finite number, got ${value}`);
  }
}

export function calculateEmi({ principal, annualRatePercent, tenureYears }: EmiInput): EmiResult {
  assertPositiveFinite(principal, "principal");
  assertPositiveFinite(tenureYears, "tenureYears");
  if (!Number.isFinite(annualRatePercent) || annualRatePercent < 0) {
    throw new Error(`annualRatePercent must be a non-negative finite number, got ${annualRatePercent}`);
  }

  const months = Math.round(tenureYears * 12);
  const monthlyRate = annualRatePercent / 12 / 100;

  let monthlyEmi: number;
  if (monthlyRate === 0) {
    monthlyEmi = principal / months;
  } else {
    const factor = Math.pow(1 + monthlyRate, months);
    monthlyEmi = (principal * monthlyRate * factor) / (factor - 1);
  }

  const totalPayment = monthlyEmi * months;
  const totalInterest = totalPayment - principal;

  return { monthlyEmi, totalPayment, totalInterest };
}

export interface AmortizationMonth {
  month: number;
  principalPaid: number;
  interestPaid: number;
  balance: number;
}

export interface AmortizationYear {
  year: number;
  principalPaid: number;
  interestPaid: number;
  balance: number;
}

/** Month-by-month amortization schedule for the reducing-balance loan. */
export function generateAmortizationSchedule(input: EmiInput): AmortizationMonth[] {
  const { principal, annualRatePercent, tenureYears } = input;
  const { monthlyEmi } = calculateEmi(input);
  const months = Math.round(tenureYears * 12);
  const monthlyRate = annualRatePercent / 12 / 100;

  const schedule: AmortizationMonth[] = [];
  let balance = principal;

  for (let month = 1; month <= months; month++) {
    const interestPaid = balance * monthlyRate;
    const principalPaid = Math.min(monthlyEmi - interestPaid, balance);
    balance = Math.max(balance - principalPaid, 0);
    schedule.push({ month, principalPaid, interestPaid, balance });
  }

  return schedule;
}

/** Aggregates the monthly schedule into year-by-year totals for the breakdown table/chart. */
export function aggregateByYear(monthlySchedule: AmortizationMonth[]): AmortizationYear[] {
  const years: AmortizationYear[] = [];

  for (let i = 0; i < monthlySchedule.length; i += 12) {
    const yearRows = monthlySchedule.slice(i, i + 12);
    years.push({
      year: i / 12 + 1,
      principalPaid: yearRows.reduce((sum, row) => sum + row.principalPaid, 0),
      interestPaid: yearRows.reduce((sum, row) => sum + row.interestPaid, 0),
      balance: yearRows[yearRows.length - 1].balance,
    });
  }

  return years;
}
