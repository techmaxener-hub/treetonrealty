"use client";

import { useDraggable } from "@dnd-kit/core";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import type { DealListItem } from "@/lib/data/deals";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, formatCurrencyINR, initials } from "@/lib/utils";

export function DealCard({ deal }: { deal: DealListItem }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: deal.id });

  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 10 } : undefined;

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
      <Link href={`/crm/deals/${deal.id}`} onPointerDown={(e) => e.stopPropagation()} className="text-sm font-medium hover:underline">
        {deal.listingTitle ?? "Untitled listing"}
      </Link>
      <p className="mt-1 text-xs text-muted-foreground">{deal.buyerName ?? "Unknown buyer"}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm font-semibold">{formatCurrencyINR(deal.deal_value)}</span>
        {deal.primaryAdvisor ? (
          <Avatar className="h-5 w-5" title={deal.primaryAdvisor.fullName}>
            <AvatarFallback className="text-[9px]">{initials(deal.primaryAdvisor.fullName)}</AvatarFallback>
          </Avatar>
        ) : null}
      </div>
      {deal.commission_percent ? (
        <p className="mt-1 text-[10px] text-muted-foreground">{deal.commission_percent}% commission</p>
      ) : null}
      <p className="mt-1 text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(deal.created_at), { addSuffix: true })}</p>
    </div>
  );
}
