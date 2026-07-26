"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CORRIDORS } from "@/lib/mock-data";

const STEPS = ["Property Details", "Area & Configuration", "Contact Information"];

export function ValuationCta() {
  const [step, setStep] = React.useState(0);
  const [submitted, setSubmitted] = React.useState(false);
  const [form, setForm] = React.useState({
    typology: "",
    corridor: "",
    areaSqFt: "",
    bhk: "",
    name: "",
    phone: "",
  });

  const isLastStep = step === STEPS.length - 1;

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleNext() {
    if (isLastStep) {
      setSubmitted(true);
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  return (
    <section className="bg-ivory-dark py-24">
      <div className="container grid gap-12 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <p className="font-serif text-lg italic text-champagne-dark">Sell With Us</p>
          <h2 className="mt-2 text-4xl font-bold text-charcoal md:text-5xl">
            Get a Free Instant Property Valuation
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            Our corridor specialists benchmark your property against live GUJRERA-registered
            inventory to give you a defensible asking price in minutes.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="rounded-2xl border border-border bg-white p-8 shadow-elevate-lg">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-10 text-center"
              >
                <CheckCircle2 className="h-12 w-12 text-champagne" />
                <p className="mt-4 font-display text-xl font-semibold text-charcoal">
                  Request Received
                </p>
                <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                  A Treeton Realty valuation specialist will call {form.name || "you"} within 24
                  hours.
                </p>
              </motion.div>
            ) : (
              <>
                <div className="mb-8 flex items-center gap-2">
                  {STEPS.map((label, i) => (
                    <div key={label} className="flex flex-1 items-center gap-2">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                          i <= step
                            ? "bg-champagne-gradient text-charcoal"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {i + 1}
                      </div>
                      {i < STEPS.length - 1 && (
                        <div
                          className={`h-px flex-1 transition-colors ${
                            i < step ? "bg-champagne" : "bg-border"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-4"
                  >
                    <p className="font-display text-sm font-semibold uppercase tracking-wider text-champagne-dark">
                      {STEPS[step]}
                    </p>

                    {step === 0 && (
                      <>
                        <div>
                          <Label>Property Type</Label>
                          <Select
                            value={form.typology}
                            onValueChange={(v) => update("typology", v)}
                          >
                            <SelectTrigger className="mt-1.5">
                              <SelectValue placeholder="Select property type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Sky Villa">Sky Villa</SelectItem>
                              <SelectItem value="Penthouse">Penthouse</SelectItem>
                              <SelectItem value="Duplex">Duplex</SelectItem>
                              <SelectItem value="Commercial Office">Commercial Office</SelectItem>
                              <SelectItem value="Plot / Land Parcel">Plot / Land Parcel</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Corridor</Label>
                          <Select value={form.corridor} onValueChange={(v) => update("corridor", v)}>
                            <SelectTrigger className="mt-1.5">
                              <SelectValue placeholder="Select corridor" />
                            </SelectTrigger>
                            <SelectContent>
                              {CORRIDORS.map((c) => (
                                <SelectItem key={c.slug} value={c.slug}>
                                  {c.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}

                    {step === 1 && (
                      <>
                        <div>
                          <Label htmlFor="areaSqFt">Carpet Area (Sq. Ft.)</Label>
                          <Input
                            id="areaSqFt"
                            className="mt-1.5"
                            type="number"
                            placeholder="e.g. 2400"
                            value={form.areaSqFt}
                            onChange={(e) => update("areaSqFt", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>BHK Configuration</Label>
                          <Select value={form.bhk} onValueChange={(v) => update("bhk", v)}>
                            <SelectTrigger className="mt-1.5">
                              <SelectValue placeholder="Select BHK" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="2">2 BHK</SelectItem>
                              <SelectItem value="3">3 BHK</SelectItem>
                              <SelectItem value="4">4 BHK</SelectItem>
                              <SelectItem value="5+">5+ BHK</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}

                    {step === 2 && (
                      <>
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            className="mt-1.5"
                            placeholder="Your name"
                            value={form.name}
                            onChange={(e) => update("name", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            className="mt-1.5"
                            type="tel"
                            placeholder="+91 98765 43210"
                            value={form.phone}
                            onChange={(e) => update("phone", e.target.value)}
                          />
                        </div>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="mt-8 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={() => setStep((s) => Math.max(s - 1, 0))}
                    disabled={step === 0}
                  >
                    Back
                  </Button>
                  <Button variant="gold" onClick={handleNext}>
                    {isLastStep ? "Get My Valuation" : "Continue"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
