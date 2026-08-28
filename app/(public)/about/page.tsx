import type { Metadata } from "next";
import { BadgeCheck, MapPin, Users } from "lucide-react";

import { ListingImage } from "@/components/property/listing-image";
import { getSiteSettings } from "@/lib/queries/site-settings";
import { getPublishedTeamMembers } from "@/lib/queries/team";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Treeton Realty is a real estate brokerage based in Bodakdev / Ambli-Bopal, Ahmedabad, focused on residential and commercial properties across Western Ahmedabad.",
};

// ISR: admin-editable (site_settings, team_members), no build-time Supabase dependency.
export const revalidate = 3600;

export default async function AboutPage() {
  const [settings, team] = await Promise.all([getSiteSettings(), getPublishedTeamMembers()]);

  return (
    <div className="min-h-screen bg-alabaster px-6 pb-24 pt-28">
      <div className="container max-w-4xl">
        <p className="font-serif text-lg italic text-gold-600">Our Story</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-slate-deep">About Treeton Realty</h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
          Treeton Realty is a real estate brokerage based in Bodakdev / Ambli-Bopal, Ahmedabad,
          focused on residential and commercial properties -- sales, leasing, and investments --
          with a lean toward premium and luxury inventory across Western Ahmedabad&rsquo;s SG Highway,
          Bodakdev, Bopal, Ambli, Thaltej, Satellite, South Bopal, Prahladnagar, and Vastrapur
          corridor.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-white p-6 shadow-elevate">
          <BadgeCheck className="h-6 w-6 shrink-0 text-gold-600" />
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Broker RERA Registration
            </p>
            <p className="font-display text-lg font-semibold text-slate-deep">
              {settings.reraBrokerRegNo ?? "Add your RERA number in admin settings"}
            </p>
          </div>
        </div>

        <section className="mt-14">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gold-600" />
            <p className="font-display text-2xl font-semibold text-slate-deep">Our Team</p>
          </div>

          {team.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              Team profiles are being added -- check back soon.
            </div>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((member) => (
                <div key={member.id} className="rounded-2xl border border-border bg-white p-6 text-center shadow-elevate">
                  <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full">
                    <ListingImage
                      src={member.photoUrl ?? ""}
                      alt={member.photoAlt ?? member.fullName}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>
                  <p className="mt-4 font-display text-lg font-semibold text-slate-deep">
                    {member.fullName}
                  </p>
                  <p className="text-sm text-gold-600">{member.role}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{member.bio}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {(settings.companyAddress || settings.googleMapsEmbedUrl) && (
          <section className="mt-14">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gold-600" />
              <p className="font-display text-2xl font-semibold text-slate-deep">Visit Us</p>
            </div>
            {settings.companyAddress && (
              <p className="mt-3 text-muted-foreground">{settings.companyAddress}</p>
            )}
            {settings.googleMapsEmbedUrl && (
              <div className="mt-6 h-80 overflow-hidden rounded-2xl border border-border">
                <iframe
                  src={settings.googleMapsEmbedUrl}
                  title="Office location map"
                  className="h-full w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
