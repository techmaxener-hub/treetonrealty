"use client";

import { useDroppable } from "@dnd-kit/core";
import type { LeadBoardItem } from "@/lib/data/leads";
import { LeadCard } from "@/components/crm/lead-card";
import { cn } from "@/lib/utils";
import type { LeadStage } from "@/lib/types/database";

export function KanbanColumn({ stage, label, leads }: { stage: LeadStage; label: string; leads: LeadBoardItem[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  return (
    <div className="flex w-64 shrink-0 flex-col rounded-lg bg-secondary/40">
      <div className="flex items-center justify-between px-3 py-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</h3>
        <span className="text-xs text-muted-foreground">{leads.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-24 flex-1 flex-col gap-2 rounded-md p-2 pt-0 transition-colors",
          isOver && "bg-accent",
        )}
      >
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
        {leads.length === 0 && <p className="px-1 py-4 text-center text-xs text-muted-foreground">No leads</p>}
      </div>
    </div>
  );
}
