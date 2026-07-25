"use client";

import { useState } from "react";
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { LeadBoardItem } from "@/lib/data/leads";
import type { TeamMember } from "@/lib/data/team";
import { LEAD_STAGES } from "@/lib/constants";
import type { LeadStage } from "@/lib/types/database";
import { KanbanColumn } from "@/components/crm/kanban-column";
import { NewLeadDialog } from "@/components/crm/new-lead-dialog";

export function KanbanBoard({
  initialLeads,
  team,
}: {
  initialLeads: LeadBoardItem[];
  team: TeamMember[];
}) {
  const [leads, setLeads] = useState(initialLeads);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const leadId = active.id as string;
    const newStage = over.id as LeadStage;
    const current = leads.find((l) => l.id === leadId);
    if (!current || current.stage === newStage) return;

    const previousStage = current.stage;
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, stage: newStage } : l)));

    const supabase = createClient();
    const { error } = await supabase.rpc("update_lead_stage", { p_lead_id: leadId, p_new_stage: newStage });

    if (error) {
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, stage: previousStage } : l)));
      toast.error(`Couldn't move lead: ${error.message}`);
    } else {
      toast.success(`Moved to ${LEAD_STAGES.find((s) => s.value === newStage)?.label}`);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold">Leads</h1>
          <p className="text-sm text-muted-foreground">Drag a card to move it through the pipeline.</p>
        </div>
        <NewLeadDialog team={team} onCreated={(lead) => setLeads((prev) => [lead, ...prev])} />
      </div>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex flex-1 gap-3 overflow-x-auto p-4">
          {LEAD_STAGES.map((stage) => (
            <KanbanColumn
              key={stage.value}
              stage={stage.value}
              label={stage.label}
              leads={leads.filter((l) => l.stage === stage.value)}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
