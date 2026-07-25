"use client";

import { useDroppable } from "@dnd-kit/core";
import type { DealListItem } from "@/lib/data/deals";
import { DealCard } from "@/components/crm/deal-card";
import { cn, formatCurrencyINR } from "@/lib/utils";
import type { DealStage } from "@/lib/types/database";

export function DealColumn({ stage, label, deals }: { stage: DealStage; label: string; deals: DealListItem[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const total = deals.reduce((sum, d) => sum + (d.deal_value ?? 0), 0);

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-lg bg-secondary/40">
      <div className="flex items-center justify-between px-3 py-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</h3>
        <span className="text-xs text-muted-foreground">
          {deals.length} · {formatCurrencyINR(total)}
        </span>
      </div>
      <div ref={setNodeRef} className={cn("flex min-h-24 flex-1 flex-col gap-2 rounded-md p-2 pt-0 transition-colors", isOver && "bg-accent")}>
        {deals.map((deal) => (
          <DealCard key={deal.id} deal={deal} />
        ))}
        {deals.length === 0 && <p className="px-1 py-4 text-center text-xs text-muted-foreground">No deals</p>}
      </div>
    </div>
  );
}
