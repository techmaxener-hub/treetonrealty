"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { CORRIDORS, PROPERTIES } from "@/lib/mock-data";

const FEATURED_SLUGS = ["ambli-sbr", "gift-city-sez", "science-city-road"];

const ORDERED_CORRIDORS = [
  ...CORRIDORS.filter((c) => FEATURED_SLUGS.includes(c.slug)),
  ...CORRIDORS.filter((c) => !FEATURED_SLUGS.includes(c.slug)),
];

export function CorridorCarousel() {
  return (
    <section className="bg-ivory py-24">
      <div className="container">
        <Reveal>
          <p className="font-serif text-lg italic text-champagne-dark">Micro-markets</p>
          <h2 className="mt-2 text-4xl font-bold text-charcoal md:text-5xl">
            Explore Ahmedabad&rsquo;s Luxury Corridors
          </h2>
        </Reveal>

        <div className="mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {ORDERED_CORRIDORS.map((corridor, i) => {
            const inventory = PROPERTIES.filter((p) => p.corridorSlug === corridor.slug);
            const image = inventory[0]?.heroImage ?? PROPERTIES[0].heroImage;

            return (
              <motion.div
                key={corridor.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                className="group relative w-[320px] shrink-0 snap-start overflow-hidden rounded-2xl shadow-elevate transition-shadow duration-500 ease-luxury hover:shadow-elevate-lg sm:w-[380px]"
              >
                <Link href={`/properties?corridor=${corridor.slug}`} className="block">
                  <div className="relative h-[440px] w-full overflow-hidden">
                    <Image
                      src={image}
                      alt={corridor.name}
                      fill
                      className="object-cover transition-transform duration-700 ease-luxury group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/30 to-transparent" />
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-6 text-ivory">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-display text-xl font-semibold leading-tight">
                          {corridor.name}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-wider text-champagne">
                          {inventory.length} Active {inventory.length === 1 ? "Listing" : "Listings"}
                        </p>
                      </div>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-champagne-gradient text-charcoal transition-transform duration-300 ease-luxury group-hover:rotate-45">
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-ivory/70">{corridor.blurb}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
