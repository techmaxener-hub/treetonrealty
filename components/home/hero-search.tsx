"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CORRIDORS, formatIndianPrice } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const SEARCH_TABS = [
  { value: "buy", label: "Buy" },
  { value: "rent", label: "Rent" },
  { value: "off-plan", label: "Off-Plan" },
  { value: "plots", label: "Plots" },
];

const PROPERTY_TYPES = [
  "3BHK Sky Villa",
  "4BHK Sky Villa",
  "5BHK Sky Villa",
  "Luxury Penthouse",
  "Duplex",
  "Commercial Office",
  "Plot / Land Parcel",
];

const BHK_OPTIONS = ["2", "3", "4", "5+"];

export function HeroSearch() {
  const router = useRouter();
  const [intent, setIntent] = React.useState("buy");
  const [corridor, setCorridor] = React.useState<string>("all");
  const [propertyType, setPropertyType] = React.useState<string>("all");
  const [budget, setBudget] = React.useState<[number, number]>([0.75, 15]);
  const [bhk, setBhk] = React.useState<string | null>(null);

  function handleSearch() {
    const params = new URLSearchParams();
    params.set("intent", intent);
    if (corridor !== "all") params.set("corridor", corridor);
    if (propertyType !== "all") params.set("type", propertyType);
    if (bhk) params.set("bhk", bhk);
    params.set("minPrice", String(budget[0]));
    params.set("maxPrice", String(budget[1]));
    router.push(`/properties?${params.toString()}`);
  }

  return (
    <div className="w-full max-w-4xl rounded-2xl bg-white/90 p-6 shadow-elevate-lg backdrop-blur-xl sm:p-8">
      <Tabs value={intent} onValueChange={setIntent}>
        <TabsList>
          {SEARCH_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Micro-market Corridor
          </label>
          <Select value={corridor} onValueChange={setCorridor}>
            <SelectTrigger>
              <SelectValue placeholder="All Corridors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Corridors</SelectItem>
              {CORRIDORS.map((c) => (
                <SelectItem key={c.slug} value={c.slug}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Property Type
          </label>
          <Select value={propertyType} onValueChange={setPropertyType}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {PROPERTY_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Budget
          </label>
          <span className="font-display text-sm font-semibold text-charcoal">
            {formatIndianPrice(budget[0])} &ndash;{" "}
            {budget[1] >= 15 ? "₹15+ Cr" : formatIndianPrice(budget[1])}
          </span>
        </div>
        <Slider
          min={0.75}
          max={15}
          step={0.25}
          value={budget}
          onValueChange={(v) => setBudget([v[0], v[1]])}
        />
      </div>

      <div className="mt-6">
        <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
          BHK
        </label>
        <div className="flex flex-wrap gap-2">
          {BHK_OPTIONS.map((option) => (
            <button
              key={option}
              onClick={() => setBhk(bhk === option ? null : option)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                bhk === option
                  ? "border-transparent bg-champagne-gradient text-charcoal shadow-gold"
                  : "border-border text-charcoal/70 hover:border-champagne/50"
              )}
            >
              {option} BHK
            </button>
          ))}
        </div>
      </div>

      <Button onClick={handleSearch} variant="gold" size="lg" className="mt-7 w-full sm:w-auto">
        Search Luxury Homes
      </Button>
    </div>
  );
}
