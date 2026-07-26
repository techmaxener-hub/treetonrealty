"use client";

import Link from "next/link";
import Image from "next/image";
import { ImageOff, Home, BedDouble, Bath, Ruler, Phone, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WhatsAppButton } from "@/components/site/whatsapp-button";
import { useLocalizedText } from "@/lib/hooks/use-language";
import { PROPERTY_TYPE_LABELS } from "@/lib/constants";
import { formatCurrencyINR } from "@/lib/utils";
import type { PublicListingCard } from "@/lib/data/public/listings";
import type { BrokerContact } from "@/lib/types/broker-content";

// The distinctive piece of this layout vs. a plain card grid: every
// result pairs to whoever's actually handling it. An agent's own
// public_phone/public_whatsapp (advisor_profiles) wins when a broker's
// set one; otherwise every CTA falls back to the office's single
// WhatsApp/phone/email (broker_profile.contact), same as everywhere
// else on the site -- an assigned advisor is never a hard requirement
// to make contact possible.
export function ListingRow({ listing, brokerContact, brokerName }: { listing: PublicListingCard; brokerContact: BrokerContact; brokerName: string }) {
  const title = useLocalizedText(listing.title);
  const description = useLocalizedText(listing.description);

  const phone = listing.advisor?.publicPhone ?? brokerContact.phone;
  const whatsapp = listing.advisor?.publicWhatsapp ?? brokerContact.whatsapp_number;
  const contactName = listing.advisor?.displayName ?? brokerName;
  const contactPhoto = listing.advisor?.photoUrl ?? null;

  return (
    <article className="flex flex-col gap-5 border-b border-border py-8 sm:flex-row">
      <Link href={`/listings/${listing.slug}`} className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-md bg-secondary sm:w-72">
        {listing.coverUrl ? (
          <Image src={listing.coverUrl} alt={title} fill className="object-cover" sizes="(min-width: 640px) 288px, 100vw" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <ImageOff className="h-8 w-8" />
          </div>
        )}
        <Badge className="absolute left-2 top-2 rounded-sm bg-foreground px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-background">
          {listing.offer_type === "sale" ? "For Sale" : "For Rent"}
        </Badge>
      </Link>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/listings/${listing.slug}`} className="text-lg font-medium hover:underline">
            {title || listing.slug}
          </Link>
          <p className="shrink-0 text-lg font-semibold tabular-nums">
            {formatCurrencyINR(listing.price)}
            {listing.offer_type === "rent" && <span className="text-sm font-normal text-muted-foreground">/mo</span>}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">{listing.localityName ?? listing.address ?? ""}</p>

        {description && (
          <p className="line-clamp-2 text-sm text-foreground/75">
            {description}{" "}
            <Link href={`/listings/${listing.slug}`} className="font-medium text-foreground hover:underline">
              Read more
            </Link>
          </p>
        )}

        <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Home className="h-3.5 w-3.5" /> {PROPERTY_TYPE_LABELS[listing.property_type]}
          </span>
          {listing.bhk ? (
            <span className="flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5" /> {listing.bhk} BHK
            </span>
          ) : null}
          {listing.bathrooms ? (
            <span className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" /> {listing.bathrooms}
            </span>
          ) : null}
          {listing.carpet_area_sqft ? (
            <span className="flex items-center gap-1">
              <Ruler className="h-3.5 w-3.5" /> {listing.carpet_area_sqft} sqft
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-xs font-medium">
              {contactPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage public URL, small avatar
                <img src={contactPhoto} alt="" className="h-full w-full object-cover" />
              ) : (
                contactName.slice(0, 1)
              )}
            </div>
            <div className="leading-tight">
              <p className="text-sm font-medium">{contactName}</p>
              <p className="text-xs text-muted-foreground">{listing.advisor ? "Point of contact" : "Office"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {phone && (
              <a
                href={`tel:${phone}`}
                className="flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-medium hover:bg-secondary"
              >
                <Phone className="h-3.5 w-3.5" /> Call
              </a>
            )}
            {whatsapp && (
              <WhatsAppButton
                number={whatsapp}
                message={`Hi, I'm interested in "${title}" (${listing.slug}). Could you share more details?`}
                listingId={listing.id}
                variant="inline"
                label="WhatsApp"
              />
            )}
            {brokerContact.email && (
              <a
                href={`mailto:${brokerContact.email}`}
                className="flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-medium hover:bg-secondary"
              >
                <Mail className="h-3.5 w-3.5" /> Email
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
