"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ListingImage } from "@/components/property/listing-image";

export interface GalleryPhoto {
  url: string;
  alt: string;
}

export function GalleryLightbox({ photos }: { photos: GalleryPhoto[] }) {
  const [open, setOpen] = React.useState(false);
  const [index, setIndex] = React.useState(0);

  function openAt(i: number) {
    setIndex(i);
    setOpen(true);
  }

  const next = React.useCallback(() => setIndex((i) => (i + 1) % photos.length), [photos.length]);
  const prev = React.useCallback(
    () => setIndex((i) => (i - 1 + photos.length) % photos.length),
    [photos.length]
  );

  React.useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, next, prev]);

  if (photos.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-2xl bg-alabaster-dark text-sm text-muted-foreground">
        No photos uploaded for this category yet.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl">
        <button
          onClick={() => openAt(0)}
          className="group relative col-span-2 row-span-2 h-full min-h-[280px] overflow-hidden"
        >
          <ListingImage
            src={photos[0].url}
            alt={photos[0].alt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            className="object-cover transition-transform duration-700 ease-luxury group-hover:scale-105"
          />
        </button>
        {photos.slice(1, 5).map((photo, i) => (
          <button
            key={photo.url}
            onClick={() => openAt(i + 1)}
            className="group relative h-full min-h-[136px] overflow-hidden"
          >
            <ListingImage
              src={photo.url}
              alt={photo.alt}
              fill
              sizes="25vw"
              className="object-cover transition-transform duration-700 ease-luxury group-hover:scale-105"
            />
            {i === 3 && photos.length > 5 && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-deep/60 text-sm font-medium text-alabaster">
                <Expand className="mr-1.5 h-4 w-4" />+{photos.length - 5} more
              </div>
            )}
          </button>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent hideClose className="max-w-6xl border-none bg-transparent p-0 shadow-none">
          <div className="relative flex h-[80vh] items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="relative h-full w-full"
              >
                <ListingImage
                  src={photos[index].url}
                  alt={photos[index].alt}
                  fill
                  sizes="90vw"
                  className="object-contain"
                />
              </motion.div>
            </AnimatePresence>

            <button
              onClick={() => setOpen(false)}
              aria-label="Close gallery"
              className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-alabaster hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              onClick={prev}
              aria-label="Previous photo"
              className="absolute left-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-alabaster hover:bg-white/20"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={next}
              aria-label="Next photo"
              className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-alabaster hover:bg-white/20"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs text-alabaster">
              {index + 1} / {photos.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
