"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";

import { ListingImage } from "@/components/property/listing-image";
import { Reveal } from "@/components/motion/reveal";
import type { Testimonial } from "@/lib/queries/testimonials";

export function TestimonialsCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [index, setIndex] = React.useState(0);

  if (testimonials.length === 0) return null;

  const testimonial = testimonials[index];
  const next = () => setIndex((i) => (i + 1) % testimonials.length);
  const prev = () => setIndex((i) => (i - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="bg-alabaster-dark py-24">
      <div className="container max-w-3xl text-center">
        <Reveal>
          <p className="font-serif text-lg italic text-gold-600">What Clients Say</p>
        </Reveal>

        <div className="mt-8">
          <Quote className="mx-auto h-8 w-8 text-gold-600/40" />
          <p className="mt-4 text-balance font-display text-xl leading-relaxed text-slate-deep md:text-2xl">
            &ldquo;{testimonial.content}&rdquo;
          </p>

          {testimonial.rating && (
            <div className="mt-4 flex justify-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < testimonial.rating! ? "fill-gold-600 text-gold-600" : "text-border"
                  }`}
                />
              ))}
            </div>
          )}

          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
              <ListingImage
                src={testimonial.avatarUrl ?? ""}
                alt={testimonial.avatarAlt ?? testimonial.authorName}
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
            <div className="text-left">
              <p className="font-medium text-slate-deep">{testimonial.authorName}</p>
              {testimonial.authorLocation && (
                <p className="text-sm text-muted-foreground">{testimonial.authorLocation}</p>
              )}
            </div>
          </div>
        </div>

        {testimonials.length > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={prev}
              aria-label="Previous testimonial"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-slate-deep/70 hover:border-gold-600/50 hover:text-slate-deep"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex gap-1.5">
              {testimonials.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => setIndex(i)}
                  aria-label={`Show testimonial ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-6 bg-gold-600" : "w-1.5 bg-border"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              aria-label="Next testimonial"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-slate-deep/70 hover:border-gold-600/50 hover:text-slate-deep"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
