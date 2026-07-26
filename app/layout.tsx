import type { Metadata } from "next";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { cormorant, jakarta, playfair } from "@/lib/fonts";
import { UnitProvider } from "@/lib/providers/unit-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Treeton Realty | Ultra-Luxury Homes in Ahmedabad, Gandhinagar & GIFT City",
    template: "%s | Treeton Realty",
  },
  description:
    "Curated Sky Villas, Penthouses & GIFT City SEZ residences across Ambli-SBR, S.G. Highway & Science City Road. GUJRERA-verified listings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${cormorant.variable} ${jakarta.variable}`}>
      <body className="font-sans antialiased">
        <UnitProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </UnitProvider>
      </body>
    </html>
  );
}
