"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { format, isPast } from "date-fns";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useCurrentProfile } from "@/lib/hooks/use-current-profile";
import type { Tables } from "@/lib/types/database";
import type { TeamMember } from "@/lib/data/team";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function TaskList({
  leadId,
  tasks,
  team,
}: {
  leadId: string;
  tasks: Tables<"tasks">[];
  team: TeamMember[];
}) {
  const router = useRouter();
  const profile = useCurrentProfile();
  const [title, setTitle] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !dueAt) return;
    setSubmitting(true);

    const supabase = createClient();
    const { error } = await supabase.from("tasks").insert({
      lead_id: leadId,
      assigned_to: profile.id,
      title,
      due_at: new Date(dueAt).toISOString(),
    });

    if (error) {
      toast.error(`Couldn't add task: ${error.message}`);
    } else {
      setTitle("");
      setDueAt("");
      router.refresh();
    }
    setSubmitting(false);
  }

  async function toggleDone(task: Tables<"tasks">) {
    const supabase = createClient();
    const nextStatus = task.status === "done" ? "pending" : "done";
    const { error } = await supabase
      .from("tasks")
      .update({ status: nextStatus, completed_at: nextStatus === "done" ? new Date().toISOString() : null })
      .eq("id", task.id);
    if (error) {
      toast.error(`Couldn't update task: ${error.message}`);
    } else {
      router.refresh();
    }
  }

  const memberByProfileId = new Map(team.map((m) => [m.profileId, m]));

  return (
    <div className="flex flex-col gap-2">
      {tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tasks yet.</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {tasks.map((task) => {
            const overdue = task.status === "pending" && isPast(new Date(task.due_at));
            return (
              <li key={task.id} className="flex items-start gap-2 rounded-md border p-2">
                <input
                  type="checkbox"
                  checked={task.status === "done"}
                  onChange={() => toggleDone(task)}
                  className="mt-0.5 h-4 w-4"
                  aria-label={`Mark "${task.title}" ${task.status === "done" ? "pending" : "done"}`}
                />
                <div className="flex-1">
                  <p className={cn("text-sm", task.status === "done" && "text-muted-foreground line-through")}>{task.title}</p>
                  <p className={cn("text-xs text-muted-foreground", overdue && "font-medium text-destructive")}>
                    {overdue ? "Overdue — " : "Due "}
                    {format(new Date(task.due_at), "d MMM, h:mm a")}
                    {" · "}
                    {memberByProfileId.get(task.assigned_to)?.fullName ?? "Unknown"}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <form onSubmit={handleAdd} className="mt-2 flex flex-col gap-2 border-t pt-2">
        <Input placeholder="Follow up about…" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="flex gap-2">
          <Input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} className="flex-1" />
          <Button type="submit" size="sm" disabled={submitting || !title.trim() || !dueAt}>
            Add task
          </Button>
        </div>
      </form>
    </div>
  );
}
