"use client";

import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { TeamMember } from "@/lib/data/team";
import type { LeadBoardItem } from "@/lib/data/leads";
import type { LeadSource } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { LEAD_SOURCE_LABELS } from "@/lib/constants";

const SOURCE_OPTIONS = Object.entries(LEAD_SOURCE_LABELS) as [LeadSource, string][];

export function NewLeadDialog({ team, onCreated }: { team: TeamMember[]; onCreated: (lead: LeadBoardItem) => void }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [source, setSource] = useState<LeadSource>("walk_in");
  const [assignTo, setAssignTo] = useState<string>("");
  const [message, setMessage] = useState("");

  function reset() {
    setFullName("");
    setPhone("");
    setEmail("");
    setSource("walk_in");
    setAssignTo("");
    setMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    const supabase = createClient();

    // submit_lead handles find-or-create-contact dedup and is
    // security definer, so it works regardless of the creating
    // user's own contact/lead visibility -- see ARCHITECTURE.md.
    const { data: leadId, error } = await supabase.rpc("submit_lead", {
      p_full_name: fullName,
      p_phone: phone,
      p_email: email || null,
      p_source: source,
      p_message: message || null,
    });

    if (error || !leadId) {
      toast.error(`Couldn't create lead: ${error?.message ?? "unknown error"}`);
      setSubmitting(false);
      return;
    }

    if (assignTo) {
      await supabase.from("leads").update({ assigned_advisor_id: assignTo }).eq("id", leadId);
    }

    const { data: lead } = await supabase.from("leads").select("*").eq("id", leadId).single();
    const { data: contact } = lead
      ? await supabase
          .from("contacts")
          .select("id, full_name, phone, whatsapp_number, potential_duplicate_of")
          .eq("id", lead.contact_id)
          .single()
      : { data: null };

    if (lead) {
      const assignedMember = assignTo ? (team.find((m) => m.profileId === assignTo) ?? null) : null;
      onCreated({ ...lead, contact: contact ?? null, assignedMember });
      toast.success("Lead created");
      reset();
      setOpen(false);
    }
    setSubmitting(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" /> New Lead
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New lead</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="full_name">Name</Label>
            <Input id="full_name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 …" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Source</Label>
              <Select value={source} onValueChange={(v) => setSource(v as LeadSource)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOURCE_OPTIONS.map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Assign to</Label>
              <Select value={assignTo} onValueChange={setAssignTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  {team.map((member) => (
                    <SelectItem key={member.profileId} value={member.profileId}>
                      {member.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="message">Note (optional)</Label>
            <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={3} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
