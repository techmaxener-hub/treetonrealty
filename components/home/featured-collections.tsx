"use client";

import * as React from "react";

import { Reveal } from "@/components/motion/reveal";
import { PropertyCard } from "@/components/property/property-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PROPERTIES } from "@/lib/mock-data";

const COLLECTIONS = [
  { value: "all", label: "All", match: () => true },
  {
    value: "sky-villas",
    label: "Sky Villas",
    match: (typology: string) => typology.includes("Sky Villa"),
  },
  {
    value: "penthouses",
    label: "Penthouses & Duplexes",
    match: (typology: string) => typology === "Luxury Penthouse" || typology === "Duplex",
  },
  {
    value: "commercial",
    label: "Commercial Hubs",
    match: (typology: string) => typology === "Commercial Office",
  },
];

export function FeaturedCollections() {
  const [tab, setTab] = React.useState("all");
  const active = COLLECTIONS.find((c) => c.value === tab) ?? COLLECTIONS[0];
  const listings = PROPERTIES.filter((p) => active.match(p.typology)).slice(0, 6);

  return (
    <section className="bg-white py-24">
      <div className="container">
        <Reveal className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="font-serif text-lg italic text-champagne-dark">Curated Collections</p>
            <h2 className="mt-2 text-4xl font-bold text-charcoal md:text-5xl">
              Featured Luxury Inventory
            </h2>
          </div>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              {COLLECTIONS.map((c) => (
                <TabsTrigger key={c.value} value={c.value}>
                  {c.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </Reveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((property, i) => (
            <PropertyCard key={property.id} property={property} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
