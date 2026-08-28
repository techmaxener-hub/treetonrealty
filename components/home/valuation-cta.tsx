"use client";

import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";

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
import type { PropertyType } from "@/lib/queries/listings";

const STEPS = ["Property Details", "Area & Configuration", "Contact Information"];
const PROPERTY_TYPES: PropertyType[] = ["Apartment", "Villa", "Plot", "Commercial", "Office", "Shop"];

interface ValuationForm {
  propertyType: string;
  locality: string;
  areaSqFt: string;
  bhk: string;
  name: string;
  phone: string;
}

async function submitValuationRequest(form: ValuationForm) {
  const message = [
    `Free valuation request:`,
    form.propertyType && `Property Type: ${form.propertyType}`,
    form.locality && `Locality: ${form.locality}`,
    form.areaSqFt && `Carpet Area: ${form.areaSqFt} Sq.Ft`,
    form.bhk && `Configuration: ${form.bhk} BHK`,
  ]
    .filter(Boolean)
    .join(" | ");

  const response = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: form.name,
      phone: form.phone,
      message,
      propertyInterest: form.propertyType || null,
    }),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error ?? "Something went wrong. Please try again.");
  return json;
}

export function ValuationCta({ localities }: { localities: string[] }) {
  const [step, setStep] = React.useState(0);
  const [form, setForm] = React.useState<ValuationForm>({
    propertyType: "",
    locality: "",
    areaSqFt: "",
    bhk: "",
    name: "",
    phone: "",
  });

  const mutation = useMutation({ mutationFn: () => submitValuationRequest(form) });
  const isLastStep = step === STEPS.length - 1;

  function update<K extends keyof ValuationForm>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleNext() {
    if (isLastStep) {
      mutation.mutate();
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  return (
    <section className="bg-alabaster-dark py-24">
      <div className="container grid gap-12 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <p className="font-serif text-lg italic text-gold-600">Sell With Us</p>
          <h2 className="mt-2 text-4xl font-bold text-slate-deep md:text-5xl">
            Get a Free Property Valuation
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            Our team benchmarks your property against live, RERA-registered inventory to give you
            a defensible asking price.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="rounded-2xl border border-border bg-white p-8 shadow-elevate-lg">
            {mutation.isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-10 text-center"
              >
                <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                <p className="mt-4 font-display text-xl font-semibold text-slate-deep">
                  Request Received
                </p>
                <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                  A Treeton Realty specialist will call {form.name || "you"} within 24 hours.
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
                            ? "bg-gold-gradient text-slate-deep"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {i + 1}
                      </div>
                      {i < STEPS.length - 1 && (
                        <div
                          className={`h-px flex-1 transition-colors ${
                            i < step ? "bg-gold-600" : "bg-border"
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
                    <p className="font-display text-sm font-semibold uppercase tracking-wider text-gold-600">
                      {STEPS[step]}
                    </p>

                    {step === 0 && (
                      <>
                        <div>
                          <Label>Property Type</Label>
                          <Select
                            value={form.propertyType}
                            onValueChange={(v) => update("propertyType", v)}
                          >
                            <SelectTrigger className="mt-1.5">
                              <SelectValue placeholder="Select property type" />
                            </SelectTrigger>
                            <SelectContent>
                              {PROPERTY_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Locality</Label>
                          <Select value={form.locality} onValueChange={(v) => update("locality", v)}>
                            <SelectTrigger className="mt-1.5">
                              <SelectValue placeholder="Select locality" />
                            </SelectTrigger>
                            <SelectContent>
                              {localities.map((l) => (
                                <SelectItem key={l} value={l}>
                                  {l}
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

                {mutation.isError && (
                  <p className="mt-4 flex items-start gap-1.5 text-sm text-red-600">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {mutation.error.message}
                  </p>
                )}

                <div className="mt-8 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={() => setStep((s) => Math.max(s - 1, 0))}
                    disabled={step === 0}
                  >
                    Back
                  </Button>
                  <Button variant="primary" onClick={handleNext} disabled={mutation.isPending}>
                    {mutation.isPending ? "Submitting…" : isLastStep ? "Get My Valuation" : "Continue"}
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
