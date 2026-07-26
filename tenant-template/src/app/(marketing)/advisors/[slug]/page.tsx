import { notFound } from "next/navigation";
import Image from "next/image";
import { Linkedin, Instagram, User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAdvisorBySlug } from "@/lib/data/public/advisors";
import { getBrokerProfile } from "@/lib/data/public/broker-profile";
import { ListingCard } from "@/components/site/listing-card";
import { LocalizedDisplay } from "@/components/site/localized-display";
import { WhatsAppButton } from "@/components/site/whatsapp-button";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import type { BrokerContact } from "@/lib/types/broker-content";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const result = await getAdvisorBySlug(supabase, slug);
  return result ? { title: result.advisor.display_name } : {};
}

export default async function AdvisorDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const [result, broker] = await Promise.all([getAdvisorBySlug(supabase, slug), getBrokerProfile(supabase)]);
  if (!result) notFound();

  const { advisor, listings } = result;
  const contact = (broker?.contact ?? {}) as BrokerContact;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Breadcrumbs items={[{ label: "Team", href: "/team" }, { label: advisor.display_name }]} />
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full bg-secondary">
          {advisor.photo_url ? (
            <Image src={advisor.photo_url} alt={advisor.display_name} fill className="object-cover" sizes="112px" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <User className="h-10 w-10" />
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{advisor.display_name}</h1>
          {advisor.specialization.length > 0 && (
            <div className="mt-1 flex flex-wrap justify-center gap-1.5 sm:justify-start">
              {advisor.specialization.map((s) => (
                <Badge key={s} variant="outline">
                  {s}
                </Badge>
              ))}
            </div>
          )}
          {advisor.years_experience ? (
            <p className="mt-1 text-sm text-muted-foreground">{advisor.years_experience}+ years of experience</p>
          ) : null}
          {advisor.languages_spoken.length > 0 && (
            <p className="text-sm text-muted-foreground">Speaks {advisor.languages_spoken.join(", ")}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
            {contact.whatsapp_number && (
              <WhatsAppButton
                number={contact.whatsapp_number}
                message={`Hi ${advisor.display_name}, I'd like to get in touch.`}
                variant="inline"
                label="WhatsApp"
              />
            )}
            {advisor.linkedin_url && (
              <a href={advisor.linkedin_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
                <Linkedin className="h-5 w-5" />
              </a>
            )}
            {advisor.instagram_url && (
              <a href={advisor.instagram_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
                <Instagram className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {Object.keys(advisor.bio ?? {}).length > 0 && (
        <div className="mt-8">
          <LocalizedDisplay value={advisor.bio} as="p" className="whitespace-pre-line text-muted-foreground" />
        </div>
      )}

      {listings.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 text-xl font-semibold">Listings by {advisor.display_name}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
