import Link from "next/link";
import { Instagram, Linkedin, Youtube, MapPin, Phone, Mail } from "lucide-react";
import type { Tables } from "@/lib/types/database";
import type { BrokerContact, BrokerSocialLinks } from "@/lib/types/broker-content";

export function SiteFooter({ broker }: { broker: Tables<"broker_profile"> | null }) {
  const contact = (broker?.contact ?? {}) as BrokerContact;
  const social = (broker?.social_links ?? {}) as BrokerSocialLinks;

  return (
    <footer className="mt-24 bg-foreground text-background">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <p className="text-lg font-medium uppercase tracking-[0.1em]">{broker?.display_name ?? "Realty"}</p>
          {broker?.years_in_business ? (
            <p className="mt-2 text-sm text-background/60">{broker.years_in_business}+ years in business</p>
          ) : null}
          {broker?.supported_languages?.length ? (
            <p className="mt-1 text-sm text-background/60">Speaking {broker.supported_languages.join(", ")}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2.5 text-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-background/50">Explore</p>
          <Link href="/listings" className="text-background/75 hover:text-background">
            Listings
          </Link>
          <Link href="/localities" className="text-background/75 hover:text-background">
            Localities
          </Link>
          <Link href="/team" className="text-background/75 hover:text-background">
            Team
          </Link>
        </div>

        <div className="flex flex-col gap-2.5 text-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-background/50">Contact</p>
          {contact.phone && (
            <a href={`tel:${contact.phone}`} className="flex items-center gap-1.5 text-background/75 hover:text-background">
              <Phone className="h-3.5 w-3.5" /> {contact.phone}
            </a>
          )}
          {contact.email && (
            <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 text-background/75 hover:text-background">
              <Mail className="h-3.5 w-3.5" /> {contact.email}
            </a>
          )}
          {contact.address && (
            <p className="flex items-start gap-1.5 text-background/75">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {contact.address}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2.5 text-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-background/50">Follow</p>
          <div className="flex gap-4">
            {social.instagram && (
              <a href={social.instagram} target="_blank" rel="noreferrer" className="text-background/75 hover:text-background">
                <Instagram className="h-4 w-4" />
              </a>
            )}
            {social.linkedin && (
              <a href={social.linkedin} target="_blank" rel="noreferrer" className="text-background/75 hover:text-background">
                <Linkedin className="h-4 w-4" />
              </a>
            )}
            {social.youtube && (
              <a href={social.youtube} target="_blank" rel="noreferrer" className="text-background/75 hover:text-background">
                <Youtube className="h-4 w-4" />
              </a>
            )}
          </div>
          {social.google_business_url && (
            <a href={social.google_business_url} target="_blank" rel="noreferrer" className="text-background/75 hover:text-background">
              Google reviews
            </a>
          )}
          {social.magicpin_url && (
            <a href={social.magicpin_url} target="_blank" rel="noreferrer" className="text-background/75 hover:text-background">
              magicpin reviews
            </a>
          )}
        </div>
      </div>
      <div className="border-t border-background/15 px-4 py-4 text-center text-xs text-background/50">
        © {new Date().getFullYear()} {broker?.display_name ?? "Realty"}. All rights reserved.
      </div>
    </footer>
  );
}
