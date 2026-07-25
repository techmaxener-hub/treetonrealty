"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, isPast } from "date-fns";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { TaskListItem } from "@/lib/data/tasks";
import { cn } from "@/lib/utils";

export function TasksTable({ tasks }: { tasks: TaskListItem[] }) {
  const router = useRouter();
  const [hideDone, setHideDone] = useState(true);

  async function toggleDone(task: TaskListItem) {
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

  const visible = hideDone ? tasks.filter((t) => t.status !== "done") : tasks;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold">Tasks</h1>
          <p className="text-sm text-muted-foreground">Follow-ups across your leads and your team&apos;s.</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" checked={hideDone} onChange={(e) => setHideDone(e.target.checked)} />
          Hide done
        </label>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {visible.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">Nothing here.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {visible.map((task) => {
              const overdue = task.status === "pending" && isPast(new Date(task.due_at));
              const row = (
                <div className="flex items-start gap-3 rounded-md border p-3 hover:bg-secondary/40">
                  <input
                    type="checkbox"
                    checked={task.status === "done"}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleDone(task);
                    }}
                    className="mt-1 h-4 w-4"
                  />
                  <div className="flex-1">
                    <p className={cn("text-sm font-medium", task.status === "done" && "text-muted-foreground line-through")}>
                      {task.title}
                    </p>
                    <p className={cn("text-xs text-muted-foreground", overdue && "font-medium text-destructive")}>
                      {overdue ? "Overdue — " : ""}
                      {format(new Date(task.due_at), "d MMM, h:mm a")}
                      {task.contactName ? ` · ${task.contactName}` : ""}
                      {task.assignee ? ` · ${task.assignee.fullName}` : ""}
                    </p>
                  </div>
                </div>
              );
              return (
                <li key={task.id}>
                  {task.lead_id ? <Link href={`/crm/leads/${task.lead_id}`}>{row}</Link> : row}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
