"use client";

import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PROPERTY_INTEREST_OPTIONS = [
  "Apartment",
  "Villa",
  "Plot",
  "Commercial",
  "Office",
  "Shop",
  "Not Sure / General Inquiry",
];

async function postJson(body: unknown) {
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error ?? "Something went wrong. Please try again.");
  return json;
}

export function ContactForm() {
  const [form, setForm] = React.useState({
    name: "",
    phone: "",
    email: "",
    message: "",
    propertyInterest: "",
  });

  const mutation = useMutation({ mutationFn: () => postJson(form) });

  if (mutation.isSuccess) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-border bg-white p-10 text-center shadow-elevate">
        <CheckCircle2 className="h-12 w-12 text-emerald-600" />
        <p className="mt-4 font-display text-xl font-semibold text-slate-deep">Message Sent</p>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          Thank you for reaching out -- our team will get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
      className="space-y-5 rounded-2xl border border-border bg-white p-6 shadow-elevate sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="contact-name">Full Name</Label>
          <Input
            id="contact-name"
            required
            className="mt-1.5"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="contact-phone">Phone Number</Label>
          <Input
            id="contact-phone"
            type="tel"
            required
            className="mt-1.5"
            placeholder="+91 98765 43210"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="contact-email">Email (Optional)</Label>
        <Input
          id="contact-email"
          type="email"
          className="mt-1.5"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />
      </div>

      <div>
        <Label htmlFor="contact-interest">Property Interest</Label>
        <Select
          value={form.propertyInterest}
          onValueChange={(v) => setForm((f) => ({ ...f, propertyInterest: v }))}
        >
          <SelectTrigger id="contact-interest" className="mt-1.5">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {PROPERTY_INTEREST_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="contact-message">Message</Label>
        <textarea
          id="contact-message"
          rows={4}
          className="mt-1.5 w-full rounded-sm border border-border bg-white/80 px-4 py-2 text-sm text-slate-deep placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
        />
      </div>

      {mutation.isError && (
        <p className="flex items-start gap-1.5 text-sm text-red-600">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {mutation.error.message}
        </p>
      )}

      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? "Sending…" : "Send Message"}
      </Button>
    </form>
  );
}
