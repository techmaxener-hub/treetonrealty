"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

import { HeroSearch } from "@/components/home/hero-search";

const SLIDES = [
  {
    src: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=2000&q=80",
    caption: "Bodakdev, Ahmedabad",
  },
  {
    src: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=2000&q=80",
    caption: "SG Highway, Ahmedabad",
  },
  {
    src: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=2000&q=80",
    caption: "South Bopal, Ahmedabad",
  },
];

export function Hero({ localities }: { localities: string[] }) {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden bg-slate-deep">
      <AnimatePresence mode="sync">
        <motion.div
          key={SLIDES[index].src}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={SLIDES[index].src}
            alt={SLIDES[index].caption}
            fill
            priority={index === 0}
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-slate-deep via-slate-deep/60 to-slate-deep/30" />

      <div className="container relative z-10 flex flex-col items-start gap-8 py-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="font-serif text-lg italic text-gold-600">Bodakdev / Ambli-Bopal, Ahmedabad</p>
          <h1 className="mt-3 max-w-2xl text-balance font-display text-5xl font-bold leading-[1.05] text-alabaster md:text-7xl">
            Your Trusted <span className="text-gradient-gold">Real Estate Partner</span>
          </h1>
          <p className="mt-5 max-w-xl text-balance text-alabaster/70">
            Residential &amp; commercial properties across Western Ahmedabad&rsquo;s SG Highway,
            Bodakdev, Bopal, Ambli, Thaltej, Satellite, South Bopal, Prahladnagar, and Vastrapur
            corridor.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
        >
          <HeroSearch localities={localities} />
        </motion.div>
      </div>

      <div className="absolute bottom-6 right-6 z-10 hidden gap-2 sm:flex">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            onClick={() => setIndex(i)}
            aria-label={`Show ${slide.caption}`}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-8 bg-gold-600" : "w-4 bg-alabaster/30"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
