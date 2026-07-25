"use client";

import { MessageCircle, X } from "lucide-react";
import { useAbandonedBrowse } from "@/lib/hooks/use-abandoned-browse";
import { createClient } from "@/lib/supabase/client";
import { getVisitorId } from "@/lib/visitor";

function buildWhatsAppUrl(number: string, message: string) {
  const digits = number.replace(/[^0-9]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

// Client-side half of the abandoned_browse trigger: a real-time WhatsApp
// nudge based on this browser's own view history, so it can reach
// someone who has never submitted a form at all. The server-side scan
// (scan_abandoned_browse, 0009_automation_engine.sql) covers the same
// behavior by email, but only once a contact_id exists to retarget --
// see ARCHITECTURE.md, Step 8.
export function AbandonedBrowsePrompt({ whatsappNumber, brokerName }: { whatsappNumber?: string; brokerName?: string }) {
  const { shouldPrompt, dismiss } = useAbandonedBrowse();

  if (!shouldPrompt || !whatsappNumber) return null;

  async function handleChat() {
    const supabase = createClient();
    await supabase.rpc("log_page_event", {
      p_visitor_id: getVisitorId(),
      p_event_type: "whatsapp_click",
    });
    window.open(
      buildWhatsAppUrl(whatsappNumber as string, "Hi, I've been browsing a few properties on your site and could use a hand narrowing things down."),
      "_blank",
      "noopener,noreferrer",
    );
    dismiss();
  }

  return (
    <div className="fixed bottom-24 right-5 z-40 w-72 rounded-lg border bg-background p-4 shadow-xl">
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
      <p className="pr-4 text-sm">Still deciding? {brokerName ?? "We"}&apos;re happy to help you narrow things down.</p>
      <button
        type="button"
        onClick={handleChat}
        className="mt-3 inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700"
      >
        <MessageCircle className="h-4 w-4" />
        Chat on WhatsApp
      </button>
    </div>
  );
}
