"use client";

import * as React from "react";
import { AlertCircle, CalendarCheck2, CheckCircle2, Download, Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { ListingDetail } from "@/lib/queries/listings";

interface BrokerContactProps {
  listing: ListingDetail;
  whatsappNumber: string | null;
}

function buildWhatsAppLink(listing: ListingDetail, whatsappNumber: string) {
  const message = `Hi, I'm interested in ${listing.title} — Ref# ${listing.refCode}`;
  const digitsOnly = whatsappNumber.replace(/[^0-9]/g, "");
  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`;
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error ?? "Something went wrong. Please try again.");
  }
  return json as T;
}

function SiteVisitDialog({ listing }: { listing: ListingDetail }) {
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    name: "",
    phone: "",
    date: "",
    time: "",
    cabPickup: false,
    pickupAddress: "",
  });

  const mutation = useMutation({
    mutationFn: () =>
      postJson("/api/site-visits", {
        listingId: listing.id,
        name: form.name,
        phone: form.phone,
        preferredDate: form.date,
        preferredTime: form.time,
        cabPickupRequested: form.cabPickup,
        pickupAddress: form.pickupAddress,
      }),
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setTimeout(() => mutation.reset(), 300);
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
        {mutation.isSuccess ? (
          <div className="flex flex-col items-center py-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-600" />
            <p className="mt-4 font-display text-xl font-semibold text-slate-deep">
              Site Visit Requested
            </p>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Our team will confirm your visit to {listing.title} shortly.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Book a Site Visit</DialogTitle>
              <DialogDescription>{listing.title}</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                mutation.mutate();
              }}
              className="mt-4 space-y-4"
            >
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
              <div className="grid grid-cols-2 gap-3">
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
                <div>
                  <Label htmlFor="visit-time">Preferred Time</Label>
                  <Input
                    id="visit-time"
                    type="time"
                    required
                    className="mt-1.5"
                    value={form.time}
                    onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="cab-pickup"
                  checked={form.cabPickup}
                  onCheckedChange={(c) => setForm((f) => ({ ...f, cabPickup: c === true }))}
                />
                <Label htmlFor="cab-pickup" className="font-normal">
                  Request a cab pickup
                </Label>
              </div>
              {form.cabPickup && (
                <div>
                  <Label htmlFor="pickup-address">Pickup Address</Label>
                  <Input
                    id="pickup-address"
                    required
                    className="mt-1.5"
                    value={form.pickupAddress}
                    onChange={(e) => setForm((f) => ({ ...f, pickupAddress: e.target.value }))}
                  />
                </div>
              )}

              {mutation.isError && (
                <p className="flex items-start gap-1.5 text-sm text-red-600">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {mutation.error.message}
                </p>
              )}

              <Button type="submit" variant="primary" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? "Submitting…" : "Confirm Site Visit"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function BrochureDownloadDialog({ listing }: { listing: ListingDetail }) {
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({ name: "", phone: "" });

  const mutation = useMutation({
    mutationFn: () =>
      postJson<{ url: string }>("/api/brochure-download", {
        listingId: listing.id,
        name: form.name,
        phone: form.phone,
      }),
    onSuccess: (data) => {
      window.open(data.url, "_blank", "noopener,noreferrer");
    },
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setTimeout(() => mutation.reset(), 300);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="w-full">
          <Download className="h-4 w-4" />
          Download Brochure
        </Button>
      </DialogTrigger>
      <DialogContent>
        {mutation.isSuccess ? (
          <div className="flex flex-col items-center py-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-600" />
            <p className="mt-4 font-display text-xl font-semibold text-slate-deep">
              Brochure Ready
            </p>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Your download should have opened in a new tab. The link expires in a few minutes.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Download Brochure</DialogTitle>
              <DialogDescription>{listing.title}</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                mutation.mutate();
              }}
              className="mt-4 space-y-4"
            >
              <div>
                <Label htmlFor="brochure-name">Full Name</Label>
                <Input
                  id="brochure-name"
                  required
                  className="mt-1.5"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="brochure-phone">Phone Number</Label>
                <Input
                  id="brochure-phone"
                  type="tel"
                  required
                  className="mt-1.5"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>

              {mutation.isError && (
                <p className="flex items-start gap-1.5 text-sm text-red-600">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {mutation.error.message}
                </p>
              )}

              <Button type="submit" variant="primary" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? "Preparing…" : "Get Brochure"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function BrokerContact({ listing, whatsappNumber }: BrokerContactProps) {
  // The agency's WhatsApp number doubles as its call number -- there is currently
  // no separate voice-line field in site_settings (see spec's placeholder list).
  const phoneTel = whatsappNumber ? `tel:${whatsappNumber}` : null;
  const whatsappLink = whatsappNumber ? buildWhatsAppLink(listing, whatsappNumber) : null;

  return (
    <>
      {/* Desktop sticky sidebar */}
      <div className="hidden lg:sticky lg:top-28 lg:block">
        <div className="rounded-2xl border border-border bg-white p-6 shadow-elevate-lg">
          <p className="font-display text-lg font-semibold text-slate-deep">Speak to a Specialist</p>
          <p className="mt-1 text-sm text-muted-foreground">Corridor advisor for {listing.locality}</p>
          {whatsappNumber && (
            <p className="mt-4 font-display text-xl font-semibold text-gold-600">
              {whatsappNumber}
            </p>
          )}

          <div className="mt-5 space-y-3">
            <Button variant="primary" size="lg" className="w-full" disabled={!phoneTel} asChild={Boolean(phoneTel)}>
              {phoneTel ? (
                <a href={phoneTel}>
                  <Phone className="h-4 w-4" />
                  Call Now
                </a>
              ) : (
                <span>Call Now</span>
              )}
            </Button>
            <Button
              variant="default"
              size="lg"
              className="w-full bg-[#25D366] text-white hover:bg-[#1ebe5a]"
              disabled={!whatsappLink}
              asChild={Boolean(whatsappLink)}
            >
              {whatsappLink ? (
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <FaWhatsapp className="h-4 w-4" />
                  WhatsApp
                </a>
              ) : (
                <span>WhatsApp</span>
              )}
            </Button>
            <SiteVisitDialog listing={listing} />
            <BrochureDownloadDialog listing={listing} />
          </div>
        </div>
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-border bg-white/95 p-3 backdrop-blur-lg lg:hidden">
        <Button variant="outline" size="lg" className="flex-1" disabled={!phoneTel} asChild={Boolean(phoneTel)}>
          {phoneTel ? (
            <a href={phoneTel}>
              <Phone className="h-4 w-4" />
            </a>
          ) : (
            <span>
              <Phone className="h-4 w-4" />
            </span>
          )}
        </Button>
        <Button
          variant="default"
          size="lg"
          className="flex-1 bg-[#25D366] text-white hover:bg-[#1ebe5a]"
          disabled={!whatsappLink}
          asChild={Boolean(whatsappLink)}
        >
          {whatsappLink ? (
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <FaWhatsapp className="h-4 w-4" />
            </a>
          ) : (
            <span>
              <FaWhatsapp className="h-4 w-4" />
            </span>
          )}
        </Button>
        <div className="flex-[2]">
          <SiteVisitDialog listing={listing} />
        </div>
      </div>
    </>
  );
}
