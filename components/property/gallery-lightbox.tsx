"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";

import { Dialog, DialogContent } from "@/components/ui/dialog";

export function GalleryLightbox({ images, title }: { images: string[]; title: string }) {
  const [open, setOpen] = React.useState(false);
  const [index, setIndex] = React.useState(0);

  function openAt(i: number) {
    setIndex(i);
    setOpen(true);
  }

  const next = React.useCallback(() => setIndex((i) => (i + 1) % images.length), [images.length]);
  const prev = React.useCallback(
    () => setIndex((i) => (i - 1 + images.length) % images.length),
    [images.length]
  );

  React.useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, next, prev]);

  return (
    <>
      <div className="grid grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl">
        <button
          onClick={() => openAt(0)}
          className="group relative col-span-2 row-span-2 h-full min-h-[280px] overflow-hidden"
        >
          <Image
            src={images[0]}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            className="object-cover transition-transform duration-700 ease-luxury group-hover:scale-105"
          />
        </button>
        {images.slice(1, 5).map((img, i) => (
          <button
            key={img + i}
            onClick={() => openAt(i + 1)}
            className="group relative h-full min-h-[136px] overflow-hidden"
          >
            <Image
              src={img}
              alt={`${title} photo ${i + 2}`}
              fill
              sizes="25vw"
              className="object-cover transition-transform duration-700 ease-luxury group-hover:scale-105"
            />
            {i === 3 && images.length > 5 && (
              <div className="absolute inset-0 flex items-center justify-center bg-charcoal/60 text-sm font-medium text-ivory">
                <Expand className="mr-1.5 h-4 w-4" />+{images.length - 5} more
              </div>
            )}
          </button>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          hideClose
          className="max-w-6xl border-none bg-transparent p-0 shadow-none"
        >
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
                <Image
                  src={images[index]}
                  alt={`${title} photo ${index + 1}`}
                  fill
                  sizes="90vw"
                  className="object-contain"
                />
              </motion.div>
            </AnimatePresence>

            <button
              onClick={() => setOpen(false)}
              aria-label="Close gallery"
              className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-ivory hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              onClick={prev}
              aria-label="Previous photo"
              className="absolute left-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-ivory hover:bg-white/20"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={next}
              aria-label="Next photo"
              className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-ivory hover:bg-white/20"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs text-ivory">
              {index + 1} / {images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
