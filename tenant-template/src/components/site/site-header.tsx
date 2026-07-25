import Link from "next/link";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import type { Tables } from "@/lib/types/database";
import type { BrokerBranding } from "@/lib/types/broker-content";

const NAV_LINKS = [
  { href: "/listings", label: "Listings" },
  { href: "/localities", label: "Localities" },
  { href: "/team", label: "Team" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ broker }: { broker: Tables<"broker_profile"> | null }) {
  const branding = (broker?.branding ?? {}) as BrokerBranding;

  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          {branding.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element -- broker-supplied logo, arbitrary external host
            <img src={branding.logo_url} alt={broker?.display_name ?? "Logo"} className="h-8 w-auto" />
          ) : (
            <span className="text-lg font-semibold">{broker?.display_name ?? "Realty"}</span>
          )}
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-foreground/80 transition-colors hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link href="/login" className="hidden text-xs text-muted-foreground hover:text-foreground sm:block">
            Broker Login
          </Link>
        </div>
      </div>
      <nav className="flex items-center gap-4 overflow-x-auto border-t px-4 py-2 text-sm font-medium md:hidden">
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="shrink-0 text-foreground/80">
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
