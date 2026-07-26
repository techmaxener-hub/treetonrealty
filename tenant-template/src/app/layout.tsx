import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "CRM",
  description: "Website + CRM + Automation",
};

// Exposed as a CSS variable everywhere, but only ever applied via the
// `.site-theme` scope (marketing layout) -- the CRM's default font
// stack is untouched, since typography direction is a public-site
// concern, not an internal admin tool one.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
