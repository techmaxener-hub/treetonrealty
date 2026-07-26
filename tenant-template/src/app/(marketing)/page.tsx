import Link from "next/link";
import { Star, Building2, Users, Scale, MapPinned } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getBrokerProfile, getReviewSummary } from "@/lib/data/public/broker-profile";
import { getFeaturedListings } from "@/lib/data/public/listings";
import { getPublishedTestimonials } from "@/lib/data/public/testimonials";
import { getLocalitiesLiteForFilter } from "@/lib/data/public/localities";
import { FeaturedListingsCarousel } from "@/components/site/featured-listings-carousel";
import { TestimonialsStrip } from "@/components/site/testimonials-strip";
import { YoutubeEmbed } from "@/components/site/youtube-embed";
import { HeroSearchWidget } from "@/components/site/hero-search-widget";
import type { BrokerBranding } from "@/lib/types/broker-content";

export const dynamic = "force-dynamic";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{children}</p>;
}

const QUICK_LINKS = [
  { href: "/listings", label: "Browse listings", icon: Building2 },
  { href: "/team", label: "Meet the team", icon: Users },
  { href: "/compare", label: "Compare properties", icon: Scale },
  { href: "/localities", label: "Explore localities", icon: MapPinned },
];

export default async function HomePage() {
  const supabase = await createClient();
  const [broker, reviewSummary, featured, testimonials, localities] = await Promise.all([
    getBrokerProfile(supabase),
    getReviewSummary(supabase),
    getFeaturedListings(supabase, 8),
    getPublishedTestimonials(supabase),
    getLocalitiesLiteForFilter(supabase),
  ]);

  const branding = (broker?.branding ?? {}) as BrokerBranding;

  const { data: featuredVideo } = await supabase
    .from("listing_media")
    .select("url, listing_id")
    .eq("media_type", "video_youtube")
    .in("listing_id", featured.map((l) => l.id))
    .limit(1)
    .maybeSingle();

  return (
    <div>
      <section className="relative overflow-hidden">
        {branding.hero_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- broker-supplied banner, arbitrary external host (same reasoning as the logo in SiteHeader)
          <img src={branding.hero_image_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-foreground" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/45 to-black/25" />

        <div className="relative px-4 py-20 text-center sm:py-28">
          <h1 className="mx-auto max-w-2xl text-4xl font-light leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl">
            {broker?.display_name ? `Find your next home with ${broker.display_name}` : "Find your next home"}
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-base text-white/85">
            {(broker?.seo as { meta_description?: string } | null)?.meta_description ??
              "Real estate agency known for clarity, expertise, and curated property guidance."}
          </p>

          <div className="mt-9">
            <HeroSearchWidget localities={localities} />
          </div>

          {reviewSummary?.google_rating ? (
            <div className="mt-6 flex items-center justify-center gap-1.5 text-sm text-white/85">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-medium">{reviewSummary.google_rating}</span>
              <span className="text-white/60">({reviewSummary.google_review_count} Google reviews)</span>
            </div>
          ) : null}
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-border sm:grid-cols-4">
          {QUICK_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="flex flex-col items-center gap-2 bg-background px-4 py-6 text-center transition-colors hover:bg-secondary">
              <link.icon className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">{link.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <SectionLabel>Property</SectionLabel>
              <h2 className="mt-1.5 text-2xl font-light sm:text-3xl">View top listings</h2>
            </div>
            <Link href="/listings" className="text-sm font-medium hover:underline">
              View all properties →
            </Link>
          </div>
          <FeaturedListingsCarousel listings={featured} watermark={broker?.display_name} />
        </section>
      )}

      {featuredVideo?.url && (
        <section className="mx-auto max-w-4xl px-4 py-16 sm:py-20">
          <SectionLabel>See It For Yourself</SectionLabel>
          <h2 className="mb-6 mt-1.5 text-2xl font-light sm:text-3xl">Property walkthrough</h2>
          <YoutubeEmbed url={featuredVideo.url} />
        </section>
      )}

      {testimonials.length > 0 && (
        <section className="border-t border-border bg-secondary/40 px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <SectionLabel>Client Stories</SectionLabel>
              <h2 className="mt-1.5 text-2xl font-light sm:text-3xl">What clients say</h2>
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
