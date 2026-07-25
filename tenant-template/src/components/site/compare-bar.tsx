"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useCompareList } from "@/lib/hooks/use-compare-list";
import { Button } from "@/components/ui/button";

export function CompareBar() {
  const { ids, clear } = useCompareList();

  if (ids.length === 0) return null;

  return (
    <div className="fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full border bg-background px-4 py-2 shadow-lg">
      <span className="text-sm font-medium">{ids.length} selected to compare</span>
      <Button size="sm" variant="ghost" onClick={clear}>
        Clear
      </Button>
      <Button asChild size="sm" disabled={ids.length < 2}>
        <Link href={`/compare?ids=${ids.join(",")}`}>Compare</Link>
      </Button>
      <button type="button" onClick={clear} aria-label="Dismiss" className="text-muted-foreground hover:text-foreground">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
