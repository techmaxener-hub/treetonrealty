"use client";

import * as React from "react";
import Image, { type ImageProps } from "next/image";
import { ImageOff } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Wraps next/image with a graceful fallback -- demo/seed listings reference
 * storage paths that may not have a real file uploaded yet (see supabase/seed.sql),
 * and any listing can legitimately have a broken/missing image in production.
 */
export function ListingImage({ src, alt, className, ...props }: ImageProps) {
  const [failed, setFailed] = React.useState(false);

  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-alabaster-dark text-muted-foreground",
          props.fill && "absolute inset-0",
          className
        )}
      >
        <ImageOff className="h-6 w-6" aria-hidden="true" />
        <span className="sr-only">{alt || "Image unavailable"}</span>
      </div>
    );
  }

  return <Image src={src} alt={alt} className={className} onError={() => setFailed(true)} {...props} />;
}
