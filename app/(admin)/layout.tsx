import type { Metadata } from "next";
import { jakarta } from "@/lib/fonts";
import { QueryProvider } from "@/lib/providers/query-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import "../globals.css";

// Independent root layout for the internal CRM -- deliberately has no Header,
// Footer, or StickyContactBar from the public site (app/(public)/layout.tsx).
// The (admin) route group gives it its own <html>/<body>, since Next.js only
// allows one active root layout per route group.
export const metadata: Metadata = {
  title: "Treeton Realty CRM",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="min-h-screen bg-alabaster font-sans antialiased">
        <QueryProvider>
          <TooltipProvider delayDuration={150}>{children}</TooltipProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
