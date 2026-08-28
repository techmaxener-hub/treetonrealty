import { FileText } from "lucide-react";

import { ListingImage } from "@/components/property/listing-image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ListingFloorPlan } from "@/lib/queries/listings";

function isPdf(url: string): boolean {
  return url.toLowerCase().endsWith(".pdf");
}

function FloorPlanGrid({ plans }: { plans: ListingFloorPlan[] }) {
  if (plans.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl bg-alabaster text-sm text-muted-foreground">
        No floor plans uploaded for this listing yet.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {plans.map((plan) =>
        isPdf(plan.url) ? (
          <a
            key={plan.id}
            href={plan.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-alabaster text-sm font-medium text-slate-deep hover:bg-gold-600/10"
          >
            <FileText className="h-8 w-8 text-gold-600" />
            {plan.title}
            <span className="text-xs text-muted-foreground">View PDF</span>
          </a>
        ) : (
          <div key={plan.id} className="relative h-48 overflow-hidden rounded-xl">
            <ListingImage src={plan.url} alt={plan.alt} fill sizes="50vw" className="object-cover" />
          </div>
        )
      )}
    </div>
  );
}

export function FloorPlanViewer({ floorPlans }: { floorPlans: ListingFloorPlan[] }) {
  const plans2d = floorPlans.filter((p) => p.planType === "2D");
  const plans3d = floorPlans.filter((p) => p.planType === "3D");

  if (floorPlans.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-white p-6">
      <p className="font-display text-xl font-semibold text-slate-deep">Floor Plans</p>
      <Tabs defaultValue={plans2d.length > 0 ? "2d" : "3d"} className="mt-4">
        <TabsList>
          {plans2d.length > 0 && <TabsTrigger value="2d">2D Layout</TabsTrigger>}
          {plans3d.length > 0 && <TabsTrigger value="3d">3D Render</TabsTrigger>}
        </TabsList>

        {plans2d.length > 0 && (
          <TabsContent value="2d">
            <FloorPlanGrid plans={plans2d} />
            <p className="mt-2 text-xs text-muted-foreground">
              Indicative layout, not to scale. Actual unit configuration may vary by tower/floor.
            </p>
          </TabsContent>
        )}

        {plans3d.length > 0 && (
          <TabsContent value="3d">
            <FloorPlanGrid plans={plans3d} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
