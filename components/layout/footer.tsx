import Link from "next/link";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube } from "react-icons/fa6";

import { NewsletterForm } from "@/components/layout/newsletter-form";
import { Separator } from "@/components/ui/separator";
import { CORRIDORS } from "@/lib/mock-data";

const SOCIALS = [
  { label: "Instagram", href: "https://instagram.com", icon: FaInstagram },
  { label: "Facebook", href: "https://facebook.com", icon: FaFacebookF },
  { label: "LinkedIn", href: "https://linkedin.com", icon: FaLinkedinIn },
  { label: "YouTube", href: "https://youtube.com", icon: FaYoutube },
];

export function Footer() {
  return (
    <footer className="bg-charcoal-gradient text-ivory">
      <div className="container py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <p className="font-display text-2xl font-bold">
              Treeton <span className="text-gradient-gold">Realty</span>
            </p>
            <p className="mt-4 max-w-xs text-sm text-ivory/60">
              Ultra-luxury real estate advisory for Ahmedabad, Gandhinagar &amp; GIFT City —
              curated Sky Villas, Penthouses and SEZ residences.
            </p>
            <div className="mt-6 flex gap-3">
              {SOCIALS.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-ivory/15 text-ivory/70 transition-colors hover:border-champagne hover:text-champagne"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="font-display text-sm font-semibold uppercase tracking-wider text-champagne">
              Corridors
            </p>
            <ul className="mt-4 space-y-3 text-sm text-ivory/70">
              {CORRIDORS.slice(0, 6).map((corridor) => (
                <li key={corridor.slug}>
                  <Link
                    href={`/properties?corridor=${corridor.slug}`}
                    className="transition-colors hover:text-champagne"
                  >
                    {corridor.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-display text-sm font-semibold uppercase tracking-wider text-champagne">
              Company
            </p>
            <ul className="mt-4 space-y-3 text-sm text-ivory/70">
              <li>
                <Link href="/off-plan" className="transition-colors hover:text-champagne">
                  Off-Plan Developers
                </Link>
              </li>
              <li>
                <Link href="/list-property" className="transition-colors hover:text-champagne">
                  List Your Property
                </Link>
              </li>
              <li>
                <Link href="/consultation" className="transition-colors hover:text-champagne">
                  Schedule Consultation
                </Link>
              </li>
              <li>
                <Link href="/properties" className="transition-colors hover:text-champagne">
                  Search &amp; Map Portal
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-display text-sm font-semibold uppercase tracking-wider text-champagne">
              Stay Informed
            </p>
            <p className="mt-4 text-sm text-ivory/60">
              New off-plan launches and GIFT City yield reports, once a month.
            </p>
            <NewsletterForm />
          </div>
        </div>

        <Separator className="my-10 bg-ivory/10" />

        <div className="flex flex-col gap-4 text-xs text-ivory/50 lg:flex-row lg:items-start lg:justify-between">
          <p className="max-w-2xl leading-relaxed">
            GUJRERA Disclaimer: All listings are subject to project-specific GUJRERA
            registration. Registration numbers, floor plans, and possession timelines are
            provided by respective developers and are indicative; buyers are advised to verify
            details on the official{" "}
            <a
              href="https://gujrera.gujarat.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-champagne"
            >
              GUJRERA portal
            </a>{" "}
            before making any investment decision. Treeton Realty acts solely as a marketing
            &amp; advisory partner.
          </p>
          <p>&copy; {new Date().getFullYear()} Treeton Realty. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
