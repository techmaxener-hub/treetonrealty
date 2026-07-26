import { CorridorCarousel } from "@/components/home/corridor-carousel";
import { FeaturedCollections } from "@/components/home/featured-collections";
import { GiftCityBanner } from "@/components/home/gift-city-banner";
import { Hero } from "@/components/home/hero";
import { ValuationCta } from "@/components/home/valuation-cta";

export default function Home() {
  return (
    <>
      <Hero />
      <CorridorCarousel />
      <FeaturedCollections />
      <GiftCityBanner />
      <ValuationCta />
    </>
  );
}
