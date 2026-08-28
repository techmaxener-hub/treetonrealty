import type { Metadata } from "next";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { StickyContactBar } from "@/components/layout/sticky-contact-bar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cormorant, jakarta, playfair } from "@/lib/fonts";
import { QueryProvider } from "@/lib/providers/query-provider";
import { getSiteSettings } from "@/lib/queries/site-settings";
import { SITE_URL } from "@/lib/site";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Treeton Realty | Your Trusted Real Estate Partner in Ahmedabad",
    template: "%s | Treeton Realty",
  },
  description:
    "Residential & commercial properties -- sales, leasing, and investments -- across Western Ahmedabad's SG Highway, Bodakdev, Bopal, Ambli, Thaltej, Satellite, South Bopal, Prahladnagar, and Vastrapur corridor.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  return (
    <html lang="en" className={`${playfair.variable} ${cormorant.variable} ${jakarta.variable}`}>
      <body className="font-sans antialiased">
        <QueryProvider>
          <TooltipProvider delayDuration={150}>
            <Header reraBrokerRegNo={settings.reraBrokerRegNo} />
            <main>{children}</main>
            <Footer />
            <StickyContactBar whatsappNumber={settings.whatsappNumber} />
          </TooltipProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
