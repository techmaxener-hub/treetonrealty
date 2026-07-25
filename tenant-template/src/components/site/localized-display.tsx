"use client";

import { useLocalizedText } from "@/lib/hooks/use-language";
import type { LocalizedText } from "@/lib/types/database";

// Thin client wrapper so server-rendered pages can drop a reactive
// localized string in place without becoming client components
// themselves -- fetching happens server-side (all languages come back in
// the same jsonb column), only the *display* choice is client-side.
export function LocalizedDisplay({
  value,
  as: Tag = "span",
  className,
}: {
  value: LocalizedText | null | undefined;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
}) {
  const text = useLocalizedText(value);
  return <Tag className={className}>{text}</Tag>;
}
