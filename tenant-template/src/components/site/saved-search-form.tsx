"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AlertChannel } from "@/lib/types/database";

export function SavedSearchForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [bhk, setBhk] = useState("");
  const [alertChannel, setAlertChannel] = useState<AlertChannel>("whatsapp");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("create_saved_search", {
      p_full_name: name,
      p_phone: phone || null,
      p_email: email || null,
      p_criteria: {
        ...(budgetMax ? { budget_max: Number(budgetMax) } : {}),
        ...(bhk ? { bhk: [Number(bhk)] } : {}),
      },
      p_alert_channel: alertChannel,
    });
    if (error) {
      toast.error(`Couldn't save: ${error.message}`);
    } else {
      setSubmitted(true);
    }
    setSubmitting(false);
  }

  if (submitted) {
    return (
      <p className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
        You&apos;re set — we&apos;ll reach out when a matching property comes up.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Input placeholder="Name" required value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <Input type="email" placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <Input type="number" placeholder="Max budget (₹)" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} />
        <Select value={bhk} onValueChange={setBhk}>
          <SelectTrigger>
            <SelectValue placeholder="BHK" />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5].map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n} BHK
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Label className="text-xs text-muted-foreground">Alert me via</Label>
        <Select value={alertChannel} onValueChange={(v) => setAlertChannel(v as AlertChannel)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="both">Both</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={submitting || !name.trim() || (!phone.trim() && !email.trim())}>
        {submitting ? "Saving…" : "Notify me of new matches"}
      </Button>
    </form>
  );
}
