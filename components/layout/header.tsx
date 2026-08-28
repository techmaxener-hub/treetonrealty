"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu } from "lucide-react";

import { AreaUnitSwitcher } from "@/components/property/area-unit-switcher";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Properties", href: "/properties" },
  { label: "Collections", href: "/collections/luxury-penthouses" },
  { label: "Calculators", href: "/calculators/emi" },
  { label: "About", href: "/about" },
];

interface HeaderProps {
  reraBrokerRegNo: string | null;
}

export function Header({ reraBrokerRegNo }: HeaderProps) {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
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
        <Link href="/" className="font-display text-2xl font-bold tracking-tight text-slate-deep">
          Treeton <span className="text-gradient-gold">Realty</span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-slate-deep/80 transition-colors hover:text-gold-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {reraBrokerRegNo && (
            <span className="hidden whitespace-nowrap text-xs text-slate-deep/50 xl:inline">
              RERA: {reraBrokerRegNo}
            </span>
          )}
          <AreaUnitSwitcher />
          <Button variant="primary" size="sm" asChild>
            <Link href="/contact">Contact Us</Link>
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
                  className="font-display text-xl font-medium text-slate-deep"
                >
                  {link.label}
                </Link>
              ))}
              <AreaUnitSwitcher className="w-fit" />
              {reraBrokerRegNo && (
                <span className="text-xs text-slate-deep/50">RERA: {reraBrokerRegNo}</span>
              )}
              <Button variant="primary" asChild>
                <Link href="/contact" onClick={() => setMobileOpen(false)}>
                  Contact Us
                </Link>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </motion.header>
  );
}
