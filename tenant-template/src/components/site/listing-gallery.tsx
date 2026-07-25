"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff, ChevronLeft, ChevronRight } from "lucide-react";
import type { Tables } from "@/lib/types/database";
import { cn } from "@/lib/utils";

export function ListingGallery({ media, title }: { media: Tables<"listing_media">[]; title: string }) {
  const photos = media.filter((m) => m.media_type === "photo" || m.media_type === "floor_plan");
  const [active, setActive] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-lg border bg-secondary text-muted-foreground">
        <ImageOff className="h-10 w-10" />
      </div>
    );
  }

  const current = photos[active] ?? photos[0]!;

  return (
    <div className="flex flex-col gap-2">
      <div className="relative aspect-video overflow-hidden rounded-lg border bg-secondary">
        <Image src={current.url} alt={title} fill className="object-cover" sizes="(min-width: 1024px) 60vw, 100vw" priority />
        {current.media_type === "floor_plan" && (
          <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-1 text-xs text-white">Floor plan</span>
        )}
        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setActive((i) => (i - 1 + photos.length) % photos.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setActive((i) => (i + 1) % photos.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
              aria-label="Next photo"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setActive(index)}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2",
                index === active ? "border-primary" : "border-transparent",
              )}
            >
              <Image src={photo.url} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
