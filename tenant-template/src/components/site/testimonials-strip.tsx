"use client";

import { Star, Quote } from "lucide-react";
import type { Tables } from "@/lib/types/database";
import { useLocalizedText } from "@/lib/hooks/use-language";

function TestimonialCard({ testimonial }: { testimonial: Tables<"testimonials"> }) {
  const content = useLocalizedText(testimonial.content);

  return (
    <div className="flex flex-col rounded-lg border border-border/70 bg-card p-6 shadow-sm">
      <Quote className="h-6 w-6 text-primary/40" />
      <div className="mb-3 mt-2 flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`h-3.5 w-3.5 ${i < testimonial.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
        ))}
      </div>
      {content ? <p className="flex-1 text-sm leading-relaxed text-foreground/80">&ldquo;{content}&rdquo;</p> : null}
      <p className="mt-4 text-sm font-semibold">{testimonial.client_name}</p>
    </div>
  );
}

export function TestimonialsStrip({ testimonials }: { testimonials: Tables<"testimonials">[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {testimonials.map((t) => (
        <TestimonialCard key={t.id} testimonial={t} />
      ))}
    </div>
  );
}
