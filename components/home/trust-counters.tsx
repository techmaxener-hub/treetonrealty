"use client";

import * as React from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

import { formatINR } from "@/lib/currency";

interface CounterProps {
  value: number;
  format: (value: number) => string;
}

function Counter({ value, format }: CounterProps) {
  const ref = React.useRef<HTMLParagraphElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: 1800, bounce: 0 });
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    if (isInView) motionValue.set(value);
  }, [isInView, value, motionValue]);

  React.useEffect(() => {
    const unsubscribe = spring.on("change", (latest) => setDisplay(latest));
    return unsubscribe;
  }, [spring]);

  return (
    <p ref={ref} className="font-display text-4xl font-bold text-gold-600 md:text-5xl">
      {format(Math.round(display))}
    </p>
  );
}

export interface TrustStat {
  label: string;
  value: number;
  format: (value: number) => string;
}

export function TrustCounters({
  transactedValueInr,
  yearsExperience,
  verifiedInventoryCount,
}: {
  transactedValueInr: number | null;
  yearsExperience: number | null;
  verifiedInventoryCount: number | null;
}) {
  const stats: TrustStat[] = [];
  if (transactedValueInr !== null) {
    stats.push({ label: "Transacted", value: transactedValueInr, format: (v) => formatINR(v) });
  }
  if (yearsExperience !== null) {
    stats.push({ label: "Years of Experience", value: yearsExperience, format: (v) => `${v}+` });
  }
  if (verifiedInventoryCount !== null) {
    stats.push({
      label: "Verified Inventory",
      value: verifiedInventoryCount,
      format: (v) => `${v}+`,
    });
  }

  if (stats.length === 0) return null;

  return (
    <section className="bg-slate-deep py-20 text-alabaster">
      <div className="container grid gap-10 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <Counter value={stat.value} format={stat.format} />
            <p className="mt-2 text-sm uppercase tracking-wide text-alabaster/60">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
