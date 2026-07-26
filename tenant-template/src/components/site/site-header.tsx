"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Plus, Facebook, Youtube, Instagram, Linkedin, MessageCircle } from "lucide-react";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import type { Tables } from "@/lib/types/database";
import type { BrokerBranding, BrokerContact, BrokerSocialLinks } from "@/lib/types/broker-content";
import { cn } from "@/lib/utils";

const NAV_LINKS = [{ href: "/", label: "Home" }];

const NAV_GROUP = {
  label: "Find a property",
  children: [
    { href: "/listings", label: "Listings" },
    { href: "/localities", label: "Localities" },
    { href: "/compare", label: "Compare properties" },
  ],
};

const NAV_LINKS_AFTER = [
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
  const contact = (broker?.contact ?? {}) as BrokerContact;
  const social = (broker?.social_links ?? {}) as BrokerSocialLinks;
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);

  const socialIcons = [
    social.facebook ? { href: social.facebook, icon: Facebook, label: "Facebook" } : null,
    social.youtube ? { href: social.youtube, icon: Youtube, label: "YouTube" } : null,
    social.instagram ? { href: social.instagram, icon: Instagram, label: "Instagram" } : null,
    social.linkedin ? { href: social.linkedin, icon: Linkedin, label: "LinkedIn" } : null,
  ].filter((s): s is { href: string; icon: typeof Facebook; label: string } => s !== null);

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
          <nav className="mt-8 flex flex-1 flex-col overflow-y-auto">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="border-b border-background/15 py-4 text-2xl font-light transition-opacity hover:opacity-70"
              >
                {link.label}
              </Link>
            ))}

            <div className="border-b border-background/15">
              <button
                type="button"
                onClick={() => setGroupOpen((v) => !v)}
                aria-expanded={groupOpen}
                className="flex w-full items-center justify-between py-4 text-2xl font-light transition-opacity hover:opacity-70"
              >
                {NAV_GROUP.label}
                <Plus className={cn("h-5 w-5 shrink-0 transition-transform", groupOpen && "rotate-45")} />
              </button>
              {groupOpen && (
                <div className="flex flex-col pb-3 pl-4">
                  {NAV_GROUP.children.map((child) => (
                    <Link key={child.href} href={child.href} className="py-2 text-base text-background/75 transition-opacity hover:opacity-70">
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {NAV_LINKS_AFTER.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="border-b border-background/15 py-4 text-2xl font-light transition-opacity hover:opacity-70"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center justify-between pt-4">
            <Link href="/login" className="text-sm text-background/60 hover:text-background">
              Broker Login
            </Link>
            <div className="flex items-center gap-3">
              {socialIcons.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="text-background/60 transition-colors hover:text-background"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
              {contact.whatsapp_number && (
                <a
                  href={`https://wa.me/${contact.whatsapp_number.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="text-background/60 transition-colors hover:text-background"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
