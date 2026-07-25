"use client";

import { useDraggable } from "@dnd-kit/core";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, Phone } from "lucide-react";
import type { LeadBoardItem } from "@/lib/data/leads";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LEAD_SCORE_CLASSES, LEAD_SOURCE_LABELS } from "@/lib/constants";
import { cn, formatCurrencyINR, initials } from "@/lib/utils";

export function LeadCard({ lead }: { lead: LeadBoardItem }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: lead.id });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 10 }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "cursor-grab touch-none rounded-md border bg-card p-3 shadow-sm active:cursor-grabbing",
        isDragging && "opacity-50",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/crm/leads/${lead.id}`}
          onPointerDown={(e) => e.stopPropagation()}
          className="text-sm font-medium hover:underline"
        >
          {lead.contact?.full_name ?? "Unknown contact"}
        </Link>
        {lead.score ? (
          <span className={cn("shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium", LEAD_SCORE_CLASSES[lead.score])}>
            {lead.score}
          </span>
        ) : null}
      </div>

      {lead.contact?.potential_duplicate_of ? (
        <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
          <AlertTriangle className="h-3 w-3" /> Possible duplicate contact
        </div>
      ) : null}

      <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
        <Phone className="h-3 w-3" />
        {lead.contact?.phone ?? "—"}
      </div>

      <div className="mt-2 flex items-center justify-between">
        <Badge variant="outline" className="text-[10px]">
          {LEAD_SOURCE_LABELS[lead.source]}
        </Badge>
        {lead.assignedMember ? (
          <Avatar className="h-5 w-5" title={lead.assignedMember.fullName}>
            <AvatarFallback className="text-[9px]">{initials(lead.assignedMember.fullName)}</AvatarFallback>
          </Avatar>
        ) : (
          <span className="text-[10px] text-muted-foreground">Unassigned</span>
        )}
      </div>

      {(lead.budget_min || lead.budget_max) && (
        <div className="mt-1.5 text-xs text-muted-foreground">
          {formatCurrencyINR(lead.budget_min)} – {formatCurrencyINR(lead.budget_max)}
        </div>
      )}

      <div className="mt-1.5 text-[10px] text-muted-foreground">
        {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
      </div>
    </div>
  );
}
