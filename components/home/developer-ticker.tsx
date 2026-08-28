import { ListingImage } from "@/components/property/listing-image";
import type { Developer } from "@/lib/queries/developers";

export function DeveloperTicker({ developers }: { developers: Developer[] }) {
  if (developers.length === 0) return null;

  // Duplicate the list once so the CSS marquee animation loops seamlessly.
  const looped = [...developers, ...developers];

  return (
    <section className="border-y border-border/60 bg-white py-10">
      <div className="container">
        <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Channel Partner Network
        </p>
      </div>
      <div className="relative mt-6 overflow-hidden">
        <div className="flex w-max animate-marquee gap-16">
          {looped.map((dev, i) => (
            <a
              key={`${dev.id}-${i}`}
              href={dev.websiteUrl ?? undefined}
              target={dev.websiteUrl ? "_blank" : undefined}
              rel={dev.websiteUrl ? "noopener noreferrer" : undefined}
              className="relative flex h-12 w-32 shrink-0 items-center justify-center grayscale transition-all hover:grayscale-0"
            >
              <ListingImage
                src={dev.logoUrl}
                alt={dev.logoAlt}
                fill
                sizes="128px"
                className="object-contain"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
