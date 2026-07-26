"use client";

import * as React from "react";
import { CalendarCheck2, CheckCircle2, Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Property } from "@/lib/mock-data";

const AGENCY_PHONE_DISPLAY = "+91 98765 43210";
const AGENCY_PHONE_TEL = "+919876543210";
const AGENCY_WHATSAPP = "919876543210";

function buildWhatsAppLink(property: Property) {
  const message = `Interested in ${property.title} (${property.gujreraNumber}). Could you share more details?`;
  return `https://wa.me/${AGENCY_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

function SiteVisitDialog({ property }: { property: Property }) {
  const [open, setOpen] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [form, setForm] = React.useState({ name: "", phone: "", date: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setTimeout(() => setSubmitted(false), 300);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="w-full">
          <CalendarCheck2 className="h-4 w-4" />
          Book a Site Visit
        </Button>
      </DialogTrigger>
      <DialogContent>
        {submitted ? (
          <div className="flex flex-col items-center py-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-champagne" />
            <p className="mt-4 font-display text-xl font-semibold text-charcoal">
              Site Visit Requested
            </p>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Our corridor specialist will confirm your visit to {property.title} shortly.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Book a Site Visit</DialogTitle>
              <DialogDescription>{property.title}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <Label htmlFor="visit-name">Full Name</Label>
                <Input
                  id="visit-name"
                  required
                  className="mt-1.5"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="visit-phone">Phone Number</Label>
                <Input
                  id="visit-phone"
                  type="tel"
                  required
                  className="mt-1.5"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="visit-date">Preferred Date</Label>
                <Input
                  id="visit-date"
                  type="date"
                  required
                  className="mt-1.5"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                />
              </div>
              <Button type="submit" variant="gold" className="w-full">
                Confirm Site Visit
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function BrokerContact({ property }: { property: Property }) {
  const whatsappLink = buildWhatsAppLink(property);

  return (
    <>
      {/* Desktop sticky sidebar */}
      <div className="hidden lg:sticky lg:top-28 lg:block">
        <div className="rounded-2xl border border-border bg-white p-6 shadow-elevate-lg">
          <p className="font-display text-lg font-semibold text-charcoal">Speak to a Specialist</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Corridor advisor for {property.corridorName}
          </p>
          <p className="mt-4 font-display text-xl font-semibold text-champagne-dark">
            {AGENCY_PHONE_DISPLAY}
          </p>

          <div className="mt-5 space-y-3">
            <Button variant="gold" size="lg" className="w-full" asChild>
              <a href={`tel:${AGENCY_PHONE_TEL}`}>
                <Phone className="h-4 w-4" />
                Call Now
              </a>
            </Button>
            <Button
              variant="default"
              size="lg"
              className="w-full bg-[#25D366] text-white hover:bg-[#1ebe5a]"
              asChild
            >
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <FaWhatsapp className="h-4 w-4" />
                WhatsApp
              </a>
            </Button>
            <SiteVisitDialog property={property} />
          </div>
        </div>
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-border bg-white/95 p-3 backdrop-blur-lg lg:hidden">
        <Button variant="outline" size="lg" className="flex-1" asChild>
          <a href={`tel:${AGENCY_PHONE_TEL}`}>
            <Phone className="h-4 w-4" />
          </a>
        </Button>
        <Button
          variant="default"
          size="lg"
          className="flex-1 bg-[#25D366] text-white hover:bg-[#1ebe5a]"
          asChild
        >
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
            <FaWhatsapp className="h-4 w-4" />
          </a>
        </Button>
        <div className="flex-[2]">
          <SiteVisitDialog property={property} />
        </div>
      </div>
    </>
  );
}
