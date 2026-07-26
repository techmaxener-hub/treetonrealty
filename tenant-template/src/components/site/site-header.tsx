"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import type { Tables } from "@/lib/types/database";
import type { BrokerBranding } from "@/lib/types/broker-content";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/listings", label: "Listings" },
  { href: "/localities", label: "Localities" },
  { href: "/team", label: "Team" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

// Minimal top bar (logo + a single menu trigger) with everything else
// tucked into a full-screen slide-out panel -- the reference direction
// keeps chrome out of the way of the hero's photography, rather than a
// permanent inline nav row competing with it.
export function SiteHeader({ broker }: { broker: Tables<"broker_profile"> | null }) {
  const branding = (broker?.branding ?? {}) as BrokerBranding;
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            {branding.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element -- broker-supplied logo, arbitrary external host
              <img src={branding.logo_url} alt={broker?.display_name ?? "Logo"} className="h-7 w-auto" />
            ) : (
              <span className="text-base font-medium uppercase tracking-[0.15em]">{broker?.display_name ?? "Realty"}</span>
            )}
          </Link>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              className="flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary"
            >
              <Menu className="h-4 w-4" />
              Menu
            </button>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 bg-foreground text-background transition-transform duration-300 ease-out ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!menuOpen}
      >
        <div className="mx-auto flex h-full max-w-md flex-col px-8 py-6">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-background/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="mt-8 flex flex-1 flex-col">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="border-b border-background/15 py-4 text-2xl font-light transition-opacity hover:opacity-70"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <Link href="/login" className="pb-4 text-sm text-background/60 hover:text-background">
            Broker Login
          </Link>
        </div>
      </div>
    </>
  );
}
