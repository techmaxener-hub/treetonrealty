// Indian rupee formatting. Store all prices as integer INR in the database and
// format ONLY through these functions -- never format currency inline in a component.

const LAKH = 100_000;
const CRORE = 10_000_000;

function assertNonNegative(amount: number, fnName: string): void {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error(`${fnName}: amount must be a non-negative finite number, got ${amount}`);
  }
}

/** Trims trailing zeros from a fixed-decimal string, e.g. "42.50" -> "42.5", "10.00" -> "10". */
function trimTrailingZeros(value: string): string {
  if (!value.includes(".")) return value;
  return value.replace(/0+$/, "").replace(/\.$/, "");
}

export interface FormatINROptions {
  /** Show the ₹ symbol. Defaults to true. */
  showSymbol?: boolean;
}

/**
 * Compact Indian-style rupee formatting:
 *  - < ₹1,00,000            -> full Indian-grouped value, e.g. ₹85,000
 *  - ₹1,00,000-₹99,99,999   -> Lakh format, e.g. ₹85 L, ₹42.50 L
 *  - >= ₹1,00,00,000        -> Crore format, e.g. ₹2.75 Cr, ₹10 Cr
 */
export function formatINR(amount: number, options: FormatINROptions = {}): string {
  assertNonNegative(amount, "formatINR");
  const symbol = options.showSymbol === false ? "" : "₹";

  if (amount >= CRORE) {
    const crores = trimTrailingZeros((amount / CRORE).toFixed(2));
    return `${symbol}${crores} Cr`;
  }
  if (amount >= LAKH) {
    const lakhs = trimTrailingZeros((amount / LAKH).toFixed(2));
    return `${symbol}${lakhs} L`;
  }
  return `${symbol}${Math.round(amount).toLocaleString("en-IN")}`;
}

/** Full Indian-grouped rupee value for the cost-breakdown sheet, e.g. ₹2,75,00,000. */
export function formatINRFull(amount: number, options: FormatINROptions = {}): string {
  assertNonNegative(amount, "formatINRFull");
  const symbol = options.showSymbol === false ? "" : "₹";
  return `${symbol}${Math.round(amount).toLocaleString("en-IN")}`;
}

/**
 * Parses admin input in raw-digit or shorthand form ("2750000", "2.75 cr", "85 l",
 * "85L", "1,00,000") into a plain integer rupee amount. Throws on unparseable or
 * negative input.
 */
export function parseINRInput(input: string): number {
  const trimmed = input.trim().toLowerCase().replace(/₹/g, "").replace(/,/g, "");
  if (trimmed === "") {
    throw new Error("parseINRInput: empty input");
  }

  const shorthandMatch = trimmed.match(/^(-?\d+(?:\.\d+)?)\s*(cr|crore|l|lakh|lac)s?$/);
  if (shorthandMatch) {
    const value = Number.parseFloat(shorthandMatch[1]);
    const unit = shorthandMatch[2];
    if (value < 0) throw new Error(`parseINRInput: negative amount not allowed: ${input}`);
    const multiplier = unit === "cr" || unit === "crore" ? CRORE : LAKH;
    return Math.round(value * multiplier);
  }

  const rawMatch = trimmed.match(/^-?\d+(?:\.\d+)?$/);
  if (rawMatch) {
    const value = Number.parseFloat(trimmed);
    if (value < 0) throw new Error(`parseINRInput: negative amount not allowed: ${input}`);
    return Math.round(value);
  }

  throw new Error(`parseINRInput: unrecognized format: ${input}`);
}
