"use client";

import { usePathname } from "next/navigation";
import { Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";

interface StickyContactBarProps {
  whatsappNumber: string | null;
}

export function StickyContactBar({ whatsappNumber }: StickyContactBarProps) {
  const pathname = usePathname();
  // The PDP already renders its own listing-specific WhatsApp/Call bar (a sticky
  // sidebar on desktop, a fixed bottom bar on mobile) -- showing this generic one
  // there too would visually collide with it on mobile.
  const isPropertyDetailPage = /^\/properties\/[^/]+$/.test(pathname);

  if (!whatsappNumber || isPropertyDetailPage) return null;

  const digitsOnly = whatsappNumber.replace(/[^0-9]/g, "");
  const whatsappLink = `https://wa.me/${digitsOnly}?text=${encodeURIComponent(
    "Hi, I'm interested in Treeton Realty properties in Western Ahmedabad."
  )}`;

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-3">
      <a
        href={`tel:${whatsappNumber}`}
        aria-label="Call Treeton Realty"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-deep text-alabaster shadow-elevate-lg transition-transform hover:scale-105"
      >
        <Phone className="h-5 w-5" />
      </a>
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Treeton Realty on WhatsApp"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-elevate-lg transition-transform hover:scale-105"
      >
        <FaWhatsapp className="h-5 w-5" />
      </a>
    </div>
  );
}
