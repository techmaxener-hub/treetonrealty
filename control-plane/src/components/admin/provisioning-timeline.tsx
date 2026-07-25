"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Loader2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PROVISIONING_STEP_LABELS, PROVISIONING_JOB_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Tables } from "@/lib/types/database";

const STATUS_ICON = {
  pending: Circle,
  running: Loader2,
  done: CheckCircle2,
  failed: XCircle,
} as const;

const STATUS_COLOR = {
  pending: "text-muted-foreground",
  running: "text-amber-500",
  done: "text-emerald-600",
  failed: "text-red-600",
} as const;

export function ProvisioningTimeline({ brokerInstanceId, jobs }: { brokerInstanceId: string; jobs: Tables<"provisioning_jobs">[] }) {
  const router = useRouter();
  const [advancing, setAdvancing] = useState(false);

  const allDone = jobs.every((j) => j.status === "done");
  const nextJob = jobs.find((j) => j.status !== "done");

  async function handleAdvance() {
    setAdvancing(true);
    const res = await fetch("/api/admin/provisioning/advance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ broker_instance_id: brokerInstanceId }),
    });
    const json = await res.json();
    setAdvancing(false);
    if (!res.ok) {
      toast.error(json.error ?? "Failed to advance provisioning");
      return;
    }
    if (json.success === false) {
      toast.error(`Step "${json.step}" failed: ${json.log}`);
    } else if (!json.finished) {
      toast.success(`Step "${json.step}" complete.`);
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {jobs.map((job) => {
          const Icon = STATUS_ICON[job.status];
          return (
            <div key={job.id} className="flex items-start gap-3 rounded-md border p-3">
              <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", STATUS_COLOR[job.status], job.status === "running" && "animate-spin")} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{PROVISIONING_STEP_LABELS[job.step]}</p>
                  <span className="text-xs text-muted-foreground">{PROVISIONING_JOB_STATUS_LABELS[job.status]}</span>
                </div>
                {job.log && <p className="mt-1 text-xs text-muted-foreground">{job.log}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {!allDone && (
        <Button onClick={handleAdvance} disabled={advancing} className="self-start">
          {advancing ? "Running…" : nextJob?.status === "failed" ? `Retry "${PROVISIONING_STEP_LABELS[nextJob.step]}"` : "Run next step"}
        </Button>
      )}
    </div>
  );
}
