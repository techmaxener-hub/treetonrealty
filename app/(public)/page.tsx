import { CorridorCarousel } from "@/components/home/corridor-carousel";
import { DeveloperTicker } from "@/components/home/developer-ticker";
import { FeaturedCollections } from "@/components/home/featured-collections";
import { Hero } from "@/components/home/hero";
import { TestimonialsCarousel } from "@/components/home/testimonials-carousel";
import { TrustCounters } from "@/components/home/trust-counters";
import { ValuationCta } from "@/components/home/valuation-cta";
import { getPublishedCollections } from "@/lib/queries/collections";
import { getActiveDevelopers } from "@/lib/queries/developers";
import { getActiveLocalities, getLocalitySummaries } from "@/lib/queries/listings";
import { getSiteSettings } from "@/lib/queries/site-settings";
import { getPublishedTestimonials } from "@/lib/queries/testimonials";

// CMS-driven content (site_settings, collections, testimonials, developers) --
// ISR instead of pure static generation, so admin edits show up within an hour
// without a redeploy, and this page never depends on Supabase at `next build` time.
export const revalidate = 3600;

export default async function Home() {
  const [localities, localitySummaries, developers, collections, settings, testimonials] =
    await Promise.all([
      getActiveLocalities(),
      getLocalitySummaries(),
      getActiveDevelopers(),
      getPublishedCollections(),
      getSiteSettings(),
      getPublishedTestimonials(),
    ]);

  return (
    <>
      <Hero localities={localities} />
      <DeveloperTicker developers={developers} />
      <CorridorCarousel localities={localitySummaries} />
      <FeaturedCollections collections={collections} />
      <TrustCounters
        transactedValueInr={settings.statTransactedValueInr}
        yearsExperience={settings.statYearsExperience}
        verifiedInventoryCount={settings.statVerifiedInventoryCount}
      />
      <TestimonialsCarousel testimonials={testimonials} />
      <ValuationCta localities={localities} />
    </>
  );
}
