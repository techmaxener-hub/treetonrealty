"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getVisitorId, getRememberedContact, rememberContact } from "@/lib/visitor";
import { resolveLeadSource } from "@/lib/utm";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

function buildWhatsAppUrl(number: string, message?: string) {
  const digits = number.replace(/[^0-9]/g, "");
  const params = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${params}`;
}

// Turns a WhatsApp click into an attributed CRM lead (source:
// whatsapp_click) rather than just a page_event -- see ARCHITECTURE.md,
// Step 7. Capturing name + phone before handing off to WhatsApp is the
// only way to make "click-to-chat" mean something to the pipeline, since
// nothing about the click itself identifies who's asking. "Skip" stays
// one tap away for anyone who'd rather not -- this is a lead-capture
// prompt, not a gate on reaching the business.
export function WhatsAppButton({
  number,
  message,
  listingId,
  variant = "floating",
  label = "Enquire on WhatsApp",
}: {
  number: string;
  message?: string;
  listingId?: string;
  variant?: "floating" | "inline";
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function openDialog() {
    const remembered = getRememberedContact();
    if (remembered) {
      setName(remembered.name);
      setPhone(remembered.phone);
    }
    setOpen(true);
  }

  async function logClickEvent() {
    const supabase = createClient();
    await supabase.rpc("log_page_event", {
      p_visitor_id: getVisitorId(),
      p_event_type: "whatsapp_click",
      p_listing_id: listingId ?? null,
    });
  }

  function goToWhatsApp() {
    window.open(buildWhatsAppUrl(number, message), "_blank", "noopener,noreferrer");
  }

  async function handleSkip() {
    await logClickEvent();
    goToWhatsApp();
    setOpen(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    const supabase = createClient();
    const { source, sourceDetail, campaign } = resolveLeadSource("whatsapp_click");

    const { error } = await supabase.rpc("submit_lead", {
      p_full_name: name,
      p_phone: phone,
      p_listing_id: listingId ?? null,
      p_source: source,
      p_source_detail: sourceDetail,
      p_campaign: campaign,
      p_message: message ?? null,
    });

    if (error) {
      toast.error(`Couldn't send: ${error.message}`);
      setSubmitting(false);
      return;
    }

    rememberContact(name, phone);
    await logClickEvent();
    goToWhatsApp();
    setSubmitting(false);
    setOpen(false);
    toast.success("Thanks — opening WhatsApp now.");
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className={cn(
          "inline-flex items-center gap-2 rounded-full bg-emerald-600 font-medium text-white shadow-lg transition-transform hover:scale-105 hover:bg-emerald-700",
          variant === "floating" ? "fixed bottom-5 right-5 z-40 px-4 py-3 text-sm" : "px-5 py-2.5 text-sm",
        )}
      >
        <MessageCircle className="h-4 w-4" />
        {label}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Before you go to WhatsApp</DialogTitle>
            <DialogDescription>So we know who&apos;s asking, in case the chat gets lost.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="wa_name">Name</Label>
              <Input id="wa_name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="wa_phone">Phone</Label>
              <Input id="wa_phone" required value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <DialogFooter className="items-center sm:justify-between">
              <button type="button" onClick={handleSkip} className="text-xs text-muted-foreground underline hover:text-foreground">
                Skip, just open WhatsApp
              </button>
              <Button type="submit" disabled={submitting || !name.trim() || !phone.trim()} className="bg-emerald-600 hover:bg-emerald-700">
                {submitting ? "Sending…" : "Continue to WhatsApp"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
