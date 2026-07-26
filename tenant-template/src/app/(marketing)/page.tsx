import Link from "next/link";
import { Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getBrokerProfile, getReviewSummary } from "@/lib/data/public/broker-profile";
import { getFeaturedListings } from "@/lib/data/public/listings";
import { getPublishedTestimonials } from "@/lib/data/public/testimonials";
import { ListingCard } from "@/components/site/listing-card";
import { TestimonialsStrip } from "@/components/site/testimonials-strip";
import { YoutubeEmbed } from "@/components/site/youtube-embed";
import { Button } from "@/components/ui/button";
import type { BrokerContact, BrokerBranding } from "@/lib/types/broker-content";

export const dynamic = "force-dynamic";

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">{children}</p>;
}

export default async function HomePage() {
  const supabase = await createClient();
  const [broker, reviewSummary, featured, testimonials] = await Promise.all([
    getBrokerProfile(supabase),
    getReviewSummary(supabase),
    getFeaturedListings(supabase, 6),
    getPublishedTestimonials(supabase),
  ]);

  const contact = (broker?.contact ?? {}) as BrokerContact;
  const branding = (broker?.branding ?? {}) as BrokerBranding;

  const { data: featuredVideo } = await supabase
    .from("listing_media")
    .select("url, listing_id")
    .eq("media_type", "video_youtube")
    .in("listing_id", featured.map((l) => l.id))
    .limit(1)
    .maybeSingle();

  const hasHeroImage = Boolean(branding.hero_image_url);

  return (
    <div>
      <section className={hasHeroImage ? "relative overflow-hidden" : "border-b border-border/70"}>
        {hasHeroImage && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- broker-supplied banner, arbitrary external host (same reasoning as the logo in SiteHeader) */}
            <img src={branding.hero_image_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
          </>
        )}

        <div
          className={
            hasHeroImage
              ? "relative px-4 py-28 text-center sm:py-40"
              : "bg-gradient-to-b from-secondary/70 to-background px-4 py-20 text-center sm:py-32"
          }
        >
          <div className="mx-auto max-w-2xl">
            <p
              className={`text-xs font-semibold uppercase tracking-[0.3em] ${hasHeroImage ? "text-white/80" : "text-primary"}`}
            >
              Real Estate, Personalized
            </p>
            <h1
              className={`mt-4 font-display text-4xl leading-[1.1] tracking-tight sm:text-5xl md:text-6xl ${hasHeroImage ? "text-white" : ""}`}
            >
              {broker?.display_name ?? "Find your next home"}
            </h1>
            {broker?.seo && (broker.seo as { meta_description?: string }).meta_description ? (
              <p className={`mx-auto mt-5 max-w-lg text-base ${hasHeroImage ? "text-white/85" : "text-muted-foreground"}`}>
                {(broker.seo as { meta_description?: string }).meta_description}
              </p>
            ) : (
              <p className={`mx-auto mt-5 max-w-lg text-base ${hasHeroImage ? "text-white/85" : "text-muted-foreground"}`}>
                Personalized guidance from a team that knows the market.
              </p>
            )}

            {reviewSummary?.google_rating ? (
              <div
                className={`mt-5 flex items-center justify-center gap-1.5 text-sm ${hasHeroImage ? "text-white/90" : ""}`}
              >
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-medium">{reviewSummary.google_rating}</span>
                <span className={hasHeroImage ? "text-white/70" : "text-muted-foreground"}>
                  ({reviewSummary.google_review_count} Google reviews)
                </span>
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/listings">Browse listings</Link>
              </Button>
              {contact.whatsapp_number && (
                <Button
                  asChild
                  size="lg"
                  variant={hasHeroImage ? "secondary" : "outline"}
                  className={hasHeroImage ? "bg-white text-foreground hover:bg-white/90" : undefined}
                >
                  <a href={`https://wa.me/${contact.whatsapp_number.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer">
                    Talk to us
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <SectionEyebrow>Curated Inventory</SectionEyebrow>
              <h2 className="mt-1.5 font-display text-2xl sm:text-3xl">Featured listings</h2>
            </div>
            <Link href="/listings" className="text-sm font-medium text-primary hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      )}

      {featuredVideo?.url && (
        <section className="mx-auto max-w-4xl px-4 py-16 sm:py-20">
          <SectionEyebrow>See It For Yourself</SectionEyebrow>
          <h2 className="mt-1.5 mb-6 font-display text-2xl sm:text-3xl">Property walkthrough</h2>
          <YoutubeEmbed url={featuredVideo.url} />
        </section>
      )}

      {testimonials.length > 0 && (
        <section className="border-t border-border/70 bg-secondary/30 px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <SectionEyebrow>Client Stories</SectionEyebrow>
              <h2 className="mt-1.5 font-display text-2xl sm:text-3xl">What clients say</h2>
            </div>
            <div className="mt-8">
              <TestimonialsStrip testimonials={testimonials} />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
