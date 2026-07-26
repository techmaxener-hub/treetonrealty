import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "CRM",
  description: "Website + CRM + Automation",
};

// Exposed as CSS variables everywhere, but only ever applied via the
// `.site-theme` scope (marketing layout) -- the CRM's default font
// stack is untouched, since typography direction is a public-site
// concern, not an internal admin tool one.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
// Light-weight serif for headings only (hero + section titles), matching
// the reference's elegant display type; body copy stays on Inter.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-display",
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="antialiased">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
