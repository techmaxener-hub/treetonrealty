"use client";

import * as React from "react";

import { GalleryLightbox } from "@/components/property/gallery-lightbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ListingImage } from "@/lib/queries/listings";
import { cn } from "@/lib/utils";

const ROOM_CATEGORY_ORDER = ["Living Room", "Bedroom", "Kitchen", "Exterior", "Amenities"] as const;

export function MediaTabs({
  images,
  virtualTourUrl,
  title,
}: {
  images: ListingImage[];
  virtualTourUrl: string | null;
  title: string;
}) {
  const categoriesPresent = ROOM_CATEGORY_ORDER.filter((category) =>
    images.some((img) => img.roomCategory === category)
  );
  const [activeCategory, setActiveCategory] = React.useState<string>(categoriesPresent[0] ?? "All");

  const filteredPhotos = (
    activeCategory === "All" ? images : images.filter((img) => img.roomCategory === activeCategory)
  ).map((img) => ({ url: img.url, alt: img.alt }));

  return (
    <Tabs defaultValue="photos">
      <TabsList>
        <TabsTrigger value="photos">Photos</TabsTrigger>
        {virtualTourUrl && <TabsTrigger value="tour">360° Virtual Tour</TabsTrigger>}
      </TabsList>

      <TabsContent value="photos">
        {categoriesPresent.length > 1 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {categoriesPresent.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  activeCategory === category
                    ? "border-transparent bg-gold-gradient text-slate-deep shadow-gold"
                    : "border-border text-slate-deep/70 hover:border-gold-600/50"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        )}
        <GalleryLightbox photos={filteredPhotos} />
      </TabsContent>

      {virtualTourUrl && (
        <TabsContent value="tour">
          <div className="h-[480px] overflow-hidden rounded-2xl border border-border">
            <iframe
              src={virtualTourUrl}
              title={`${title} 360° virtual tour`}
              className="h-full w-full"
              allow="xr-spatial-tracking; gyroscope; accelerometer"
              allowFullScreen
            />
          </div>
        </TabsContent>
      )}
    </Tabs>
  );
}
