import Link from "next/link";
import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa6";

import { Separator } from "@/components/ui/separator";
import { getActiveLocalities } from "@/lib/queries/listings";
import { getSiteSettings } from "@/lib/queries/site-settings";

export async function Footer() {
  const [localities, settings] = await Promise.all([getActiveLocalities(), getSiteSettings()]);

  const socials = [
    { label: "Instagram", href: settings.instagramUrl, icon: FaInstagram },
    { label: "Facebook", href: settings.facebookUrl, icon: FaFacebookF },
    { label: "LinkedIn", href: settings.linkedinUrl, icon: FaLinkedinIn },
  ].filter((s): s is typeof s & { href: string } => Boolean(s.href));

  return (
    <footer className="bg-slate-gradient text-alabaster">
      <div className="container py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="font-display text-2xl font-bold">
              Treeton <span className="text-gradient-gold">Realty</span>
            </p>
            <p className="mt-2 font-serif text-sm italic text-gold-600">
              Your Trusted Real Estate Partner
            </p>
            <p className="mt-4 max-w-xs text-sm text-alabaster/60">
              Residential &amp; commercial real estate advisory based in Bodakdev / Ambli-Bopal,
              Ahmedabad -- sales, leasing, and investments across Western Ahmedabad.
            </p>
            {socials.length > 0 && (
              <div className="mt-6 flex gap-3">
                {socials.map(({ label, href, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-alabaster/15 text-alabaster/70 transition-colors hover:border-gold-600 hover:text-gold-600"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="font-display text-sm font-semibold uppercase tracking-wider text-gold-600">
              Localities
            </p>
            <ul className="mt-4 space-y-3 text-sm text-alabaster/70">
              {localities.length === 0 ? (
                <li className="text-alabaster/40">Listings coming soon</li>
              ) : (
                localities.slice(0, 6).map((locality) => (
                  <li key={locality}>
                    <Link
                      href={`/properties?locality=${encodeURIComponent(locality)}`}
                      className="transition-colors hover:text-gold-600"
                    >
                      {locality}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div>
            <p className="font-display text-sm font-semibold uppercase tracking-wider text-gold-600">
              Company
            </p>
            <ul className="mt-4 space-y-3 text-sm text-alabaster/70">
              <li>
                <Link href="/about" className="transition-colors hover:text-gold-600">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors hover:text-gold-600">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/collections/luxury-penthouses" className="transition-colors hover:text-gold-600">
                  Curated Collections
                </Link>
              </li>
              <li>
                <Link href="/properties" className="transition-colors hover:text-gold-600">
                  Search &amp; Map Portal
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-display text-sm font-semibold uppercase tracking-wider text-gold-600">
              Calculators
            </p>
            <ul className="mt-4 space-y-3 text-sm text-alabaster/70">
              <li>
                <Link href="/calculators/emi" className="transition-colors hover:text-gold-600">
                  Home Loan EMI
                </Link>
              </li>
              <li>
                <Link href="/calculators/stamp-duty" className="transition-colors hover:text-gold-600">
                  Stamp Duty &amp; Registration
                </Link>
              </li>
              <li>
                <Link href="/calculators/area-converter" className="transition-colors hover:text-gold-600">
                  Area Unit Converter
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-10 bg-alabaster/10" />

        <div className="flex flex-col gap-4 text-xs text-alabaster/50 lg:flex-row lg:items-start lg:justify-between">
          <p className="max-w-2xl leading-relaxed">
            RERA Disclaimer: All listings are subject to project-specific RERA registration.
            Registration numbers, floor plans, and possession timelines are provided by respective
            developers and are indicative; buyers are advised to verify details on the official{" "}
            <a
              href="https://gujrera.gujarat.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gold-600"
            >
              Gujarat RERA portal
            </a>{" "}
            before making any investment decision. Treeton Realty
            {settings.reraBrokerRegNo ? ` (Broker RERA Reg. No. ${settings.reraBrokerRegNo})` : ""} acts
            solely as a marketing &amp; advisory partner.
          </p>
          <p>&copy; {new Date().getFullYear()} Treeton Realty. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
