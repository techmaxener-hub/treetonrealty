"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, Ruler } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useUnit } from "@/lib/providers/unit-provider";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Buy", href: "/properties?intent=buy" },
  { label: "Rent", href: "/properties?intent=rent" },
  { label: "Off-Plan Luxury", href: "/off-plan" },
  { label: "GIFT City Special", href: "/properties?corridor=gift-city-sez" },
];

export function Header() {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { unit, toggleUnit } = useUnit();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-luxury",
        scrolled ? "glass shadow-elevate" : "bg-transparent"
      )}
    >
      <div className="container flex h-20 items-center justify-between">
        <Link href="/" className="font-display text-2xl font-bold tracking-tight text-charcoal">
          Treeton <span className="text-gradient-gold">Realty</span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-charcoal/80 transition-colors hover:text-champagne-dark"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <button
            onClick={toggleUnit}
            className="flex items-center gap-1.5 rounded-full border border-champagne/40 px-3 py-1.5 text-xs font-medium text-charcoal/70 transition-colors hover:bg-champagne/10"
            aria-label="Toggle area unit"
          >
            <Ruler className="h-3.5 w-3.5" />
            {unit === "sqft" ? "Sq. Ft" : "Sq. Yd"}
          </button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/list-property">List Property</Link>
          </Button>
          <Button variant="gold" size="sm" asChild>
            <Link href="/consultation">Schedule Consultation</Link>
          </Button>
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>
                Treeton <span className="text-gradient-gold">Realty</span>
              </SheetTitle>
            </SheetHeader>
            <nav className="mt-8 flex flex-col gap-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="font-display text-xl font-medium text-charcoal"
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={toggleUnit}
                className="flex w-fit items-center gap-1.5 rounded-full border border-champagne/40 px-3 py-1.5 text-xs font-medium text-charcoal/70"
              >
                <Ruler className="h-3.5 w-3.5" />
                {unit === "sqft" ? "Sq. Ft" : "Sq. Yd"}
              </button>
              <Button variant="outline" asChild>
                <Link href="/list-property" onClick={() => setMobileOpen(false)}>
                  List Property
                </Link>
              </Button>
              <Button variant="gold" asChild>
                <Link href="/consultation" onClick={() => setMobileOpen(false)}>
                  Schedule Consultation
                </Link>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </motion.header>
  );
}
