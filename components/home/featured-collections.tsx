"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { ListingImage } from "@/components/property/listing-image";
import { Reveal } from "@/components/motion/reveal";
import type { Collection } from "@/lib/queries/collections";

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

export function FeaturedCollections({ collections }: { collections: Collection[] }) {
  if (collections.length === 0) return null;

  return (
    <section className="bg-white py-24">
      <div className="container">
        <Reveal>
          <p className="font-serif text-lg italic text-gold-600">Curated Collections</p>
          <h2 className="mt-2 text-4xl font-bold text-slate-deep md:text-5xl">
            Handpicked, Not Auto-Filtered
          </h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Every collection below is manually assembled by our team -- we control what
            &ldquo;curated&rdquo; means, not an algorithm.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collections.slice(0, 3).map((collection, i) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link href={`/collections/${collection.slug}`} className="group block">
                <div className="relative h-72 w-full overflow-hidden rounded-2xl">
                  <ListingImage
                    src={collection.coverImageUrl ?? ""}
                    alt={collection.coverImageAlt ?? collection.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-luxury group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-deep via-slate-deep/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-alabaster">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-display text-xl font-semibold leading-tight">
                        {collection.title}
                      </p>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-gradient text-slate-deep transition-transform duration-300 ease-luxury group-hover:rotate-45">
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-alabaster/70">
                      {stripHtml(collection.introRichtext)}
                    </p>
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
