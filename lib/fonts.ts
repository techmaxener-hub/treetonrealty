import { Cormorant_Garamond, Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";

// Primary luxury display face — hero headlines, corridor names, price hero type.
export const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

// Secondary editorial serif — pull quotes, developer credits, section eyebrows.
export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif-alt",
  display: "swap",
});

// Body copy / UI / data cards — crisp and legible at small sizes.
export const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});
