"use client";

import { useEffect, useState, useTransition } from "react";
import {
  DndContext,
  PointerSensor,
  useDroppable,
  useDraggable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { updateLeadStatus } from "./actions";
import { LeadDetailSheet } from "./lead-detail-sheet";
import { PIPELINE_STAGES, type LeadRow, type LeadStatus } from "./types";

const STAGE_COLORS: Record<LeadStatus, string> = {
  New: "border-t-slate-deep",
  Contacted: "border-t-amber-500",
  "Site Visit Scheduled": "border-t-amber-600",
  "Site Visit Done": "border-t-emerald-500",
  "Token Paid": "border-t-emerald-600",
  "Closed Won": "border-t-emerald-700",
  "Closed Lost": "border-t-destructive",
};

function LeadCard({ lead, onOpen }: { lead: LeadRow; onOpen: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={
        transform
          ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
          : undefined
      }
      className={cn(
        "space-y-2 rounded-md border border-border-subtle bg-white p-3 shadow-sm transition-shadow hover:shadow-md",
        isDragging && "z-10 opacity-70"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={onOpen}
          className="min-w-0 flex-1 text-left text-sm font-semibold text-slate-deep hover:underline"
        >
          {lead.name}
        </button>
        <span
          {...listeners}
          {...attributes}
          className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </span>
      </div>
      <p className="text-xs text-muted-foreground">{lead.phone}</p>
      {lead.property_interest ? (
        <p className="truncate text-xs text-muted-foreground">{lead.property_interest}</p>
      ) : null}
      <div className="flex items-center justify-between pt-1">
        <Badge variant="muted" className="text-[10px]">
          {lead.source.replace(/_/g, " ")}
        </Badge>
        {lead.assigned_profile ? (
          <span className="truncate text-[11px] text-muted-foreground">
            {lead.assigned_profile.full_name}
          </span>
        ) : (
          <span className="text-[11px] text-muted-foreground">Unassigned</span>
        )}
      </div>
    </div>
  );
}

function StageColumn({
  stage,
  leads,
  onOpenLead,
}: {
  stage: LeadStatus;
  leads: LeadRow[];
  onOpenLead: (lead: LeadRow) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-lg border-t-4 bg-alabaster-dark/60 p-3",
        STAGE_COLORS[stage],
        isOver && "ring-2 ring-emerald-500/60"
      )}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold text-slate-deep">{stage}</h2>
        <span className="text-xs text-muted-foreground">{leads.length}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} onOpen={() => onOpenLead(lead)} />
        ))}
      </div>
    </div>
  );
}

export function LeadsBoard({ leads: initialLeads }: { leads: LeadRow[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [selectedLead, setSelectedLead] = useState<LeadRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => setLeads(initialLeads), [initialLeads]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const leadId = String(active.id);
    const newStage = over.id as LeadStatus;
    const currentLead = leads.find((lead) => lead.id === leadId);
    if (!currentLead || currentLead.status === newStage) return;

    setLeads((prev) =>
      prev.map((lead) => (lead.id === leadId ? { ...lead, status: newStage } : lead))
    );

    startTransition(() => {
      updateLeadStatus(leadId, newStage).then((result) => {
        if (result.error) {
          setLeads((prev) =>
            prev.map((lead) =>
              lead.id === leadId ? { ...lead, status: currentLead.status } : lead
            )
          );
        }
      });
    });
  }

  function openLead(lead: LeadRow) {
    setSelectedLead(lead);
    setDetailOpen(true);
  }

  return (
    <>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
          {PIPELINE_STAGES.map((stage) => (
            <StageColumn
              key={stage}
              stage={stage}
              leads={leads.filter((lead) => lead.status === stage)}
              onOpenLead={openLead}
            />
          ))}
        </div>
      </DndContext>

      <LeadDetailSheet lead={selectedLead} open={detailOpen} onOpenChange={setDetailOpen} />
    </>
  );
}
