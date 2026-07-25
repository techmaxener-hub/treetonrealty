import { Star, ShieldCheck, Languages, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getBrokerProfile, getReviewSummary } from "@/lib/data/public/broker-profile";
import { getPublishedTestimonials } from "@/lib/data/public/testimonials";
import { TestimonialsStrip } from "@/components/site/testimonials-strip";
import { Card, CardContent } from "@/components/ui/card";
import type { BrokerSocialLinks } from "@/lib/types/broker-content";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const supabase = await createClient();
  const [broker, reviewSummary, testimonials] = await Promise.all([
    getBrokerProfile(supabase),
    getReviewSummary(supabase),
    getPublishedTestimonials(supabase),
  ]);
  const social = (broker?.social_links ?? {}) as BrokerSocialLinks;

  const badges = [
    broker?.years_in_business ? { icon: ShieldCheck, label: `${broker.years_in_business}+ years in business` } : null,
    broker?.supported_languages?.length
      ? { icon: Languages, label: `Speaking ${broker.supported_languages.join(", ")}` }
      : null,
    reviewSummary?.google_rating
      ? { icon: Star, label: `${reviewSummary.google_rating}★ on Google (${reviewSummary.google_review_count} reviews)` }
      : null,
    social.magicpin_url ? { icon: Users, label: "Verified on magicpin" } : null,
  ].filter((b): b is { icon: typeof ShieldCheck; label: string } => b !== null);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-semibold">Why {broker?.display_name ?? "us"}</h1>
      <p className="mb-8 text-muted-foreground">
        {(broker?.seo as { meta_description?: string } | undefined)?.meta_description ??
          "Transparent, personalized guidance for your next property decision."}
      </p>

      {badges.length > 0 && (
        <div className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {badges.map((badge) => (
            <Card key={badge.label}>
              <CardContent className="flex items-center gap-3 pt-4">
                <badge.icon className="h-5 w-5 shrink-0 text-primary" />
                <p className="text-sm font-medium">{badge.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {testimonials.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-semibold">What clients say</h2>
          <TestimonialsStrip testimonials={testimonials} />
        </div>
      )}
    </div>
  );
}
