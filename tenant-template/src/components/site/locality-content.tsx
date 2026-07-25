"use client";

import { useLanguage } from "@/lib/hooks/use-language";

type LocalityContentBlock = {
  description?: string;
  connectivity?: string;
  price_trends?: string;
  amenities_nearby?: string;
};

export function LocalityContent({ content }: { content: Record<string, unknown> }) {
  const { language } = useLanguage();
  const typed = content as Partial<Record<"en" | "hi" | "gu", LocalityContentBlock>>;
  const block = typed[language] ?? typed.en ?? (Object.values(typed)[0] as LocalityContentBlock | undefined);

  if (!block) return <p className="text-muted-foreground">Guide content coming soon.</p>;

  return (
    <div className="flex flex-col gap-6">
      {block.description && (
        <div>
          <p className="whitespace-pre-line text-muted-foreground">{block.description}</p>
        </div>
      )}
      {block.connectivity && (
        <div>
          <h2 className="mb-1 text-lg font-medium">Connectivity</h2>
          <p className="whitespace-pre-line text-muted-foreground">{block.connectivity}</p>
        </div>
      )}
      {block.price_trends && (
        <div>
          <h2 className="mb-1 text-lg font-medium">Price trends</h2>
          <p className="whitespace-pre-line text-muted-foreground">{block.price_trends}</p>
        </div>
      )}
      {block.amenities_nearby && (
        <div>
          <h2 className="mb-1 text-lg font-medium">Nearby amenities</h2>
          <p className="whitespace-pre-line text-muted-foreground">{block.amenities_nearby}</p>
        </div>
      )}
    </div>
  );
}
