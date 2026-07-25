"use client";

import { useEffect } from "react";
import { captureAttributionOnce } from "@/lib/utm";

// Mounted once in the marketing layout -- has no UI, just runs the
// first-touch capture on every page load so it's in place before any
// form or WhatsApp click could need it.
export function AttributionCapture() {
  useEffect(() => {
    captureAttributionOnce();
  }, []);
  return null;
}
