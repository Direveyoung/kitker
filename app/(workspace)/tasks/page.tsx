import { requireUserId } from "@/lib/auth/dev-session";
import { getTodos } from "@/lib/today/queries";
import { TasksView } from "@/components/tasks/tasks-view";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const userId = await requireUserId();
  const todos = await getTodos(userId);
  return <TasksView todos={todos} />;
}
