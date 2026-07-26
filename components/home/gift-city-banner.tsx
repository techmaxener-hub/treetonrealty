import Image from "next/image";
import Link from "next/link";
import { TrendingUp } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";

const STATS = [
  { label: "Income Tax Exemption", value: "100%", note: "for 10 of 15 years, SEZ units*" },
  { label: "GST on SEZ Services", value: "0%", note: "zero-rated supply for authorized units*" },
  { label: "Projected Off-Plan Yield", value: "12–15%", note: "illustrative, 2026–2028 launches*" },
];

export function GiftCityBanner() {
  return (
    <section className="relative overflow-hidden bg-charcoal py-24 text-ivory">
      <div className="absolute inset-0 opacity-25">
        <Image
          src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=2000&q=80"
          alt="GIFT City skyline"
          fill
          className="object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/90 to-charcoal/60" />

      <div className="container relative z-10">
        <Reveal className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-champagne/40 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-champagne">
            <TrendingUp className="h-3.5 w-3.5" />
            GIFT City Special
          </div>
          <h2 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
            Invest in India&rsquo;s First{" "}
            <span className="text-gradient-gold">International Financial Hub</span>
          </h2>
          <p className="mt-4 text-ivory/70">
            GIFT City&rsquo;s SEZ &amp; IFSC status unlocks tax-advantaged ownership structures
            and strong rental demand from the incoming financial workforce — a rare early
            entry point into a fully planned smart city.
          </p>
          <Button variant="gold" size="lg" className="mt-7" asChild>
            <Link href="/properties?corridor=gift-city-sez">Explore GIFT City Residences</Link>
          </Button>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={0.1 + i * 0.08}>
              <div className="rounded-2xl border border-ivory/10 bg-ivory/5 p-6 backdrop-blur-sm">
                <p className="font-display text-4xl font-bold text-champagne">{stat.value}</p>
                <p className="mt-2 text-sm font-medium text-ivory">{stat.label}</p>
                <p className="mt-1 text-xs text-ivory/50">{stat.note}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-xs text-ivory/40">
          *Illustrative figures for reference only, subject to prevailing SEZ/IFSC regulations
          and individual eligibility. Consult a qualified tax advisor before investing.
        </p>
      </div>
    </section>
  );
}
