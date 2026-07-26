import type { Metadata } from "next";
import { Suspense } from "react";

import { PropertiesClient } from "@/components/property/properties-client";

export const metadata: Metadata = {
  title: "Search Luxury Properties",
  description:
    "Browse GUJRERA-verified Sky Villas, Penthouses, and GIFT City residences across Ahmedabad and Gandhinagar with an interactive map.",
};

export default function PropertiesPage() {
  return (
    <Suspense fallback={null}>
      <PropertiesClient />
    </Suspense>
  );
}
