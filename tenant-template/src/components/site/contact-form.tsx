"use client";

import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { getRememberedContact, rememberContact, getVisitorId } from "@/lib/visitor";
import { resolveLeadSource } from "@/lib/utm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const remembered = getRememberedContact();
    if (remembered) {
      setName(remembered.name);
      setPhone(remembered.phone);
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    const supabase = createClient();
    const { source, sourceDetail, campaign } = resolveLeadSource("website_form");
    const { error } = await supabase.rpc("submit_lead", {
      p_full_name: name,
      p_phone: phone,
      p_email: email || null,
      p_source: source,
      p_source_detail: sourceDetail,
      p_campaign: campaign,
      p_message: message || null,
      p_visitor_id: getVisitorId(),
    });
    if (error) {
      toast.error(`Couldn't send: ${error.message}`);
    } else {
      rememberContact(name, phone);
      setSubmitted(true);
    }
    setSubmitting(false);
  }

  if (submitted) {
    return (
      <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
        Thanks — we&apos;ll be in touch shortly.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact_name">Name</Label>
        <Input id="contact_name" required value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact_phone">Phone</Label>
          <Input id="contact_phone" required value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact_email">Email</Label>
          <Input id="contact_email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact_message">What are you looking for?</Label>
        <Textarea id="contact_message" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
      </div>
      <Button type="submit" disabled={submitting || !name.trim() || !phone.trim()}>
        {submitting ? "Sending…" : "Send"}
      </Button>
    </form>
  );
}
