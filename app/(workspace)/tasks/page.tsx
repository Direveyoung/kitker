import { Plus } from "lucide-react";
import { requireUserId } from "@/lib/auth/dev-session";
import { Button } from "@/components/ui/button";
import { QuickForm } from "@/components/shared/quick-form";
import { QuickInput } from "@/components/shared/quick-input";
import { carryOverTasks, createTask } from "@/modules/tasks/actions";
import { TaskRow } from "@/modules/tasks/components/task-row";
import { getAllTasks } from "@/modules/tasks/queries";

export default async function TasksPage() {
  const userId = await requireUserId();
  await carryOverTasks();
  const all = await getAllTasks(userId);
  const pending = all.filter((t) => !t.completed);
  const done = all.filter((t) => t.completed);

  return (
    <section className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/80 px-4 py-4 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">✅ Tasks</h1>
          <span className="text-xs text-muted-foreground">
            {pending.length}개 남음
          </span>
        </div>
        <QuickForm
          action={createTask}
          className="mx-auto mt-3 flex max-w-3xl items-start gap-2"
        >
          <QuickInput placeholder='+ 할 일 — "내일 오후 3시 회의", "매주 월요일 보고", URL·이미지 paste' />
          <Button type="submit" size="lg" className="shrink-0 gap-1">
            <Plus className="size-4" />
            추가
          </Button>
        </QuickForm>
      </header>

      <div className="mx-auto w-full max-w-3xl flex-1 overflow-auto p-4 sm:p-6">
        {all.length === 0 && (
          <div className="mt-16 space-y-2 text-center">
            <p className="text-3xl">🌿</p>
            <p className="text-sm font-medium">할 일이 없어요</p>
            <p className="text-xs text-muted-foreground">깔끔!</p>
          </div>
        )}

        {pending.length > 0 && (
          <ul className="mb-6 space-y-0.5">
            {pending.map((t) => (
              <TaskRow key={t.id} item={t} />
            ))}
          </ul>
        )}

        {done.length > 0 && (
          <details className="group" open={pending.length === 0}>
            <summary className="mb-2 cursor-pointer text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground">
              완료 ({done.length})
            </summary>
            <ul className="space-y-0.5">
              {done.map((t) => (
                <TaskRow key={t.id} item={t} />
              ))}
            </ul>
          </details>
        )}
      </div>
    </section>
  );
}
