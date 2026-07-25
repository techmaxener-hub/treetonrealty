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
import type { BrokerContact } from "@/lib/types/broker-content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const [broker, reviewSummary, featured, testimonials] = await Promise.all([
    getBrokerProfile(supabase),
    getReviewSummary(supabase),
    getFeaturedListings(supabase, 6),
    getPublishedTestimonials(supabase),
  ]);

  const contact = (broker?.contact ?? {}) as BrokerContact;

  const { data: featuredVideo } = await supabase
    .from("listing_media")
    .select("url, listing_id")
    .eq("media_type", "video_youtube")
    .in("listing_id", featured.map((l) => l.id))
    .limit(1)
    .maybeSingle();

  return (
    <div>
      <section className="border-b bg-gradient-to-b from-secondary/60 to-background px-4 py-16 text-center sm:py-24">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{broker?.display_name ?? "Find your next home"}</h1>
          {broker?.seo && (broker.seo as { meta_description?: string }).meta_description ? (
            <p className="mt-4 text-muted-foreground">{(broker.seo as { meta_description?: string }).meta_description}</p>
          ) : (
            <p className="mt-4 text-muted-foreground">Personalized guidance from a team that knows the market.</p>
          )}

          {reviewSummary?.google_rating ? (
            <div className="mt-4 flex items-center justify-center gap-1.5 text-sm">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-medium">{reviewSummary.google_rating}</span>
              <span className="text-muted-foreground">({reviewSummary.google_review_count} Google reviews)</span>
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/listings">Browse listings</Link>
            </Button>
            {contact.whatsapp_number && (
              <Button asChild size="lg" variant="outline">
                <a href={`https://wa.me/${contact.whatsapp_number.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer">
                  Talk to us
                </a>
              </Button>
            )}
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-xl font-semibold">Featured listings</h2>
            <Link href="/listings" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      )}

      {featuredVideo?.url && (
        <section className="mx-auto max-w-4xl px-4 py-12">
          <h2 className="mb-6 text-xl font-semibold">Property walkthrough</h2>
          <YoutubeEmbed url={featuredVideo.url} />
        </section>
      )}

      {testimonials.length > 0 && (
        <section className="border-t bg-secondary/20 px-4 py-12">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-6 text-center text-xl font-semibold">What clients say</h2>
            <TestimonialsStrip testimonials={testimonials} />
          </div>
        </section>
      )}
    </div>
  );
}
