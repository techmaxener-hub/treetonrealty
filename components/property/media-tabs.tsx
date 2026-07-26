"use client";

import { Compass, PlayCircle } from "lucide-react";

import { GalleryLightbox } from "@/components/property/gallery-lightbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function ComingSoonPanel({
  icon: Icon,
  title,
  note,
}: {
  icon: typeof Compass;
  title: string;
  note: string;
}) {
  return (
    <div className="flex h-[420px] flex-col items-center justify-center gap-3 rounded-2xl bg-charcoal text-ivory">
      <Icon className="h-10 w-10 text-champagne" />
      <p className="font-display text-lg font-semibold">{title}</p>
      <p className="max-w-sm text-center text-sm text-ivory/60">{note}</p>
    </div>
  );
}

export function MediaTabs({ images, title }: { images: string[]; title: string }) {
  return (
    <Tabs defaultValue="photos">
      <TabsList>
        <TabsTrigger value="photos">Photos</TabsTrigger>
        <TabsTrigger value="tour">360° Virtual Tour</TabsTrigger>
        <TabsTrigger value="video">Video Walkthrough</TabsTrigger>
      </TabsList>

      <TabsContent value="photos">
        <GalleryLightbox images={images} title={title} />
      </TabsContent>

      <TabsContent value="tour">
        <ComingSoonPanel
          icon={Compass}
          title="360° Tour Coming Soon"
          note="The developer's immersive walkthrough for this project is being onboarded. Request early access from your relationship manager."
        />
      </TabsContent>

      <TabsContent value="video">
        <ComingSoonPanel
          icon={PlayCircle}
          title="Video Walkthrough Coming Soon"
          note="A guided video walkthrough for this listing will be published shortly."
        />
      </TabsContent>
    </Tabs>
  );
}
