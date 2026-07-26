"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ListingCard } from "@/components/site/listing-card";
import { cn } from "@/lib/utils";
import type { PublicListingCard } from "@/lib/data/public/listings";

export function FeaturedListingsCarousel({ listings, watermark }: { listings: PublicListingCard[]; watermark?: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  function scrollToIndex(index: number) {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(index, listings.length - 1));
    const card = track.children[clamped] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    setActive(clamped);
  }

  return (
    <div>
      <div ref={trackRef} className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {listings.map((listing) => (
          <div key={listing.id} className="w-[280px] shrink-0 snap-start sm:w-[300px]">
            <ListingCard listing={listing} watermark={watermark} />
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => scrollToIndex(active - 1)}
          disabled={active === 0}
          aria-label="Previous"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background transition-opacity disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-1.5">
          {listings.map((listing, i) => (
            <button
              key={listing.id}
              type="button"
              onClick={() => scrollToIndex(i)}
              aria-label={`Go to listing ${i + 1}`}
              className={cn("h-1.5 rounded-full transition-all", i === active ? "w-5 bg-foreground" : "w-1.5 bg-border")}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => scrollToIndex(active + 1)}
          disabled={active === listings.length - 1}
          aria-label="Next"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background transition-opacity disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
