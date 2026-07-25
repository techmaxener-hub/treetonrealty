"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// The only public-facing page in this app -- everything else is
// authenticated admin tooling. Writes through request_broker_signup(),
// never a direct table INSERT, same reasoning as the tenant template's
// public lead-capture RPCs: a public writer proposes a handful of
// fields but can't set status/reviewed_by/broker_instance_id itself.
export default function SignupPage() {
  const [businessName, setBusinessName] = useState("");
  const [proposedSlug, setProposedSlug] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("request_broker_signup", {
      p_business_name: businessName,
      p_proposed_slug: proposedSlug,
      p_owner_name: ownerName,
      p_owner_email: ownerEmail,
      p_owner_phone: ownerPhone || null,
      p_message: message || null,
    });
    if (error) {
      toast.error(error.message);
      setSubmitting(false);
      return;
    }
    setSubmitted(true);
    setSubmitting(false);
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Request received</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Thanks — we&apos;ll review your request and be in touch shortly to get your brokerage set up.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Set up your brokerage</CardTitle>
          <CardDescription>Tell us about your business and we&apos;ll provision your own site + CRM.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="business_name">Business name</Label>
              <Input id="business_name" required value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="proposed_slug">Preferred subdomain</Label>
              <Input
                id="proposed_slug"
                required
                placeholder="e.g. sunrise-realty"
                value={proposedSlug}
                onChange={(e) => setProposedSlug(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Your site will be at {proposedSlug || "your-slug"}.yourplatform.example</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="owner_name">Your name</Label>
                <Input id="owner_name" required value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="owner_phone">Phone</Label>
                <Input id="owner_phone" value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="owner_email">Email</Label>
              <Input id="owner_email" type="email" required value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="message">Anything else we should know?</Label>
              <Textarea id="message" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
            <Button type="submit" disabled={submitting || !businessName.trim() || !proposedSlug.trim() || !ownerName.trim() || !ownerEmail.trim()}>
              {submitting ? "Sending…" : "Request access"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
