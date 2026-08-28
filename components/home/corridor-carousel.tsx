"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { ListingImage } from "@/components/property/listing-image";
import { Reveal } from "@/components/motion/reveal";
import type { LocalitySummary } from "@/lib/queries/listings";

export function CorridorCarousel({ localities }: { localities: LocalitySummary[] }) {
  if (localities.length === 0) return null;

  return (
    <section className="bg-alabaster py-24">
      <div className="container">
        <Reveal>
          <p className="font-serif text-lg italic text-gold-600">Micro-Markets</p>
          <h2 className="mt-2 text-4xl font-bold text-slate-deep md:text-5xl">
            Explore Western Ahmedabad
          </h2>
        </Reveal>

        <div className="mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {localities.map((locality, i) => (
            <motion.div
              key={locality.locality}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="group relative w-[320px] shrink-0 snap-start overflow-hidden rounded-2xl shadow-elevate transition-shadow duration-500 ease-luxury hover:shadow-elevate-lg sm:w-[380px]"
            >
              <Link href={`/properties?locality=${encodeURIComponent(locality.locality)}`} className="block">
                <div className="relative h-[320px] w-full overflow-hidden">
                  <ListingImage
                    src={locality.imageUrl ?? ""}
                    alt={locality.imageAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, 380px"
                    className="object-cover transition-transform duration-700 ease-luxury group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-deep via-slate-deep/30 to-transparent" />
                </div>

                <div className="absolute inset-x-0 bottom-0 p-6 text-alabaster">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-display text-xl font-semibold leading-tight">
                        {locality.locality}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-wider text-gold-600">
                        {locality.activeCount} Active {locality.activeCount === 1 ? "Listing" : "Listings"}
                      </p>
                    </div>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-gradient text-slate-deep transition-transform duration-300 ease-luxury group-hover:rotate-45">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
