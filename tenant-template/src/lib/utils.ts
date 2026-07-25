import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function initials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function formatCurrencyINR(value: number | null | undefined) {
  if (value == null) return "—";
  if (value >= 1_00_00_000) return `₹${(value / 1_00_00_000).toFixed(value % 1_00_00_000 === 0 ? 0 : 2)} Cr`;
  if (value >= 1_00_000) return `₹${(value / 1_00_000).toFixed(value % 1_00_000 === 0 ? 0 : 2)} L`;
  return `₹${value.toLocaleString("en-IN")}`;
}

export function formatPhoneDisplay(phone: string | null | undefined) {
  if (!phone) return "—";
  return phone;
}

export function localizedText(value: Partial<Record<"en" | "hi" | "gu", string>> | null | undefined, lang: "en" | "hi" | "gu" = "en") {
  if (!value) return "";
  return value[lang] ?? value.en ?? Object.values(value)[0] ?? "";
}
