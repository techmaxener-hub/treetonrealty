import { PropertyCard } from "@/components/property/property-card";
import { PROPERTIES, type Property } from "@/lib/mock-data";

export function RelatedProperties({ property }: { property: Property }) {
  const related = PROPERTIES.filter(
    (p) => p.corridorSlug === property.corridorSlug && p.id !== property.id
  ).slice(0, 3);

  if (related.length === 0) return null;

  return (
    <div>
      <p className="font-display text-xl font-semibold text-charcoal">
        More in {property.corridorName}
      </p>
      <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((p, i) => (
          <PropertyCard key={p.id} property={p} index={i} />
        ))}
      </div>
    </div>
  );
}
