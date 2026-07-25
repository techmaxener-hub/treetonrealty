import { createClient } from "@/lib/supabase/server";
import { getTasksList } from "@/lib/data/tasks";
import { TasksTable } from "@/components/crm/tasks-table";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const supabase = await createClient();
  const tasks = await getTasksList(supabase);

  return <TasksTable tasks={tasks} />;
}
