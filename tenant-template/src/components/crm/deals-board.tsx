"use client";

import { useState } from "react";
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { DealListItem } from "@/lib/data/deals";
import type { TeamMember } from "@/lib/data/team";
import { DEAL_STAGES } from "@/lib/constants";
import type { DealStage } from "@/lib/types/database";
import { DealColumn } from "@/components/crm/deal-column";
import { NewDealDialog } from "@/components/crm/new-deal-dialog";

export function DealsBoard({ initialDeals, team }: { initialDeals: DealListItem[]; team: TeamMember[] }) {
  const [deals, setDeals] = useState(initialDeals);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const dealId = active.id as string;
    const newStage = over.id as DealStage;
    const current = deals.find((d) => d.id === dealId);
    if (!current || current.stage === newStage) return;

    const previousStage = current.stage;
    setDeals((prev) => prev.map((d) => (d.id === dealId ? { ...d, stage: newStage } : d)));

    const supabase = createClient();
    const { error } = await supabase.rpc("update_deal_stage", { p_deal_id: dealId, p_new_stage: newStage });

    if (error) {
      setDeals((prev) => prev.map((d) => (d.id === dealId ? { ...d, stage: previousStage } : d)));
      toast.error(`Couldn't move deal: ${error.message}`);
    } else {
      toast.success(`Moved to ${DEAL_STAGES.find((s) => s.value === newStage)?.label}`);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold">Deals</h1>
          <p className="text-sm text-muted-foreground">Post-negotiation to closing, separate from the lead pipeline.</p>
        </div>
        <NewDealDialog team={team} />
      </div>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex flex-1 gap-3 overflow-x-auto p-4">
          {DEAL_STAGES.map((stage) => (
            <DealColumn key={stage.value} stage={stage.value} label={stage.label} deals={deals.filter((d) => d.stage === stage.value)} />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
