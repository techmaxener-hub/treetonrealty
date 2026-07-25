"use client";

import { Star } from "lucide-react";
import type { Tables } from "@/lib/types/database";
import { useLocalizedText } from "@/lib/hooks/use-language";
import { Card, CardContent } from "@/components/ui/card";

function TestimonialCard({ testimonial }: { testimonial: Tables<"testimonials"> }) {
  const content = useLocalizedText(testimonial.content);

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="mb-2 flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-3.5 w-3.5 ${i < testimonial.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
          ))}
        </div>
        {content ? <p className="text-sm text-muted-foreground">&ldquo;{content}&rdquo;</p> : null}
        <p className="mt-3 text-sm font-medium">{testimonial.client_name}</p>
      </CardContent>
    </Card>
  );
}

export function TestimonialsStrip({ testimonials }: { testimonials: Tables<"testimonials">[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {testimonials.map((t) => (
        <TestimonialCard key={t.id} testimonial={t} />
      ))}
    </div>
  );
}
