import Link from "next/link";
import { Instagram, Linkedin, Youtube, MapPin, Phone, Mail } from "lucide-react";
import type { Tables } from "@/lib/types/database";
import type { BrokerContact, BrokerSocialLinks } from "@/lib/types/broker-content";

export function SiteFooter({ broker }: { broker: Tables<"broker_profile"> | null }) {
  const contact = (broker?.contact ?? {}) as BrokerContact;
  const social = (broker?.social_links ?? {}) as BrokerSocialLinks;

  return (
    <footer className="mt-16 border-t bg-secondary/30">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <p className="text-base font-semibold">{broker?.display_name ?? "Realty"}</p>
          {broker?.years_in_business ? (
            <p className="mt-1 text-sm text-muted-foreground">{broker.years_in_business}+ years in business</p>
          ) : null}
          {broker?.supported_languages?.length ? (
            <p className="mt-1 text-sm text-muted-foreground">Speaking {broker.supported_languages.join(", ")}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <p className="font-medium">Explore</p>
          <Link href="/listings" className="text-muted-foreground hover:text-foreground">
            Listings
          </Link>
          <Link href="/localities" className="text-muted-foreground hover:text-foreground">
            Localities
          </Link>
          <Link href="/team" className="text-muted-foreground hover:text-foreground">
            Team
          </Link>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <p className="font-medium">Contact</p>
          {contact.phone && (
            <a href={`tel:${contact.phone}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
              <Phone className="h-3.5 w-3.5" /> {contact.phone}
            </a>
          )}
          {contact.email && (
            <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
              <Mail className="h-3.5 w-3.5" /> {contact.email}
            </a>
          )}
          {contact.address && (
            <p className="flex items-start gap-1.5 text-muted-foreground">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {contact.address}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <p className="font-medium">Follow</p>
          <div className="flex gap-3">
            {social.instagram && (
              <a href={social.instagram} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
                <Instagram className="h-4 w-4" />
              </a>
            )}
            {social.linkedin && (
              <a href={social.linkedin} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
                <Linkedin className="h-4 w-4" />
              </a>
            )}
            {social.youtube && (
              <a href={social.youtube} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
                <Youtube className="h-4 w-4" />
              </a>
            )}
          </div>
          {social.google_business_url && (
            <a href={social.google_business_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
              Google reviews
            </a>
          )}
          {social.magicpin_url && (
            <a href={social.magicpin_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
              magicpin reviews
            </a>
          )}
        </div>
      </div>
      <div className="border-t px-4 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {broker?.display_name ?? "Realty"}. All rights reserved.
      </div>
    </footer>
  );
}
