"use client";

import { MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getVisitorId } from "@/lib/visitor";
import { cn } from "@/lib/utils";

function buildWhatsAppUrl(number: string, message?: string) {
  const digits = number.replace(/[^0-9]/g, "");
  const params = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${params}`;
}

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
  async function handleClick() {
    const supabase = createClient();
    await supabase.rpc("log_page_event", {
      p_visitor_id: getVisitorId(),
      p_event_type: "whatsapp_click",
      p_listing_id: listingId ?? null,
    });
  }

  return (
    <a
      href={buildWhatsAppUrl(number, message)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-emerald-600 font-medium text-white shadow-lg transition-transform hover:scale-105 hover:bg-emerald-700",
        variant === "floating" ? "fixed bottom-5 right-5 z-40 px-4 py-3 text-sm" : "px-5 py-2.5 text-sm",
      )}
    >
      <MessageCircle className="h-4 w-4" />
      {label}
    </a>
  );
}
