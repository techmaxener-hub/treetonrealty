import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "CRM",
  description: "Website + CRM + Automation",
};

// Exposed as CSS variables everywhere, but only ever applied via the
// `font-display` Tailwind utility or the `.site-theme` scope (marketing
// layout) -- the CRM's default font stack is untouched, since a premium
// editorial look is a public-site concern, not an internal admin tool one.
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="antialiased">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
