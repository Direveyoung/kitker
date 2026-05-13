import { Plus } from "lucide-react";
import { requireUserId } from "@/lib/auth/dev-session";
import { Button } from "@/components/ui/button";
import { QuickForm } from "@/components/shared/quick-form";
import { QuickInput } from "@/components/shared/quick-input";
import { createInboxItem } from "@/modules/inbox/actions";
import { carryOverTasks } from "@/modules/tasks/actions";
import { TaskRow } from "@/modules/tasks/components/task-row";
import { getTodayTasks } from "@/modules/tasks/queries";

export default async function TodayPage() {
  const userId = await requireUserId();
  await carryOverTasks();
  const tasks = await getTodayTasks(userId);
  const pending = tasks.filter((t) => !t.completed);
  const done = tasks.filter((t) => t.completed);
  const progress =
    tasks.length > 0 ? Math.round((done.length / tasks.length) * 100) : 0;

  const todayLabel = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <section className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/80 px-4 py-4 backdrop-blur sm:px-6">
        <div className="mx-auto max-w-3xl space-y-3">
          <div className="flex items-baseline gap-3">
            <h1 className="text-xl font-semibold tracking-tight">🌅 Today</h1>
            <span className="text-xs text-muted-foreground">{todayLabel}</span>
          </div>
          {tasks.length > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-muted-foreground tabular-nums">
                <span>진행률 {progress}%</span>
                <span>
                  {done.length} / {tasks.length}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl flex-1 space-y-8 overflow-auto p-4 sm:p-6">
        {/* Quick capture */}
        <section>
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            ⚡ Quick Capture
          </h2>
          <QuickForm action={createInboxItem} className="flex items-start gap-2">
            <QuickInput placeholder="떠오른 것 — Inbox에 담깁니다 · URL/이미지 paste 가능" />
            <Button type="submit" size="lg" className="shrink-0 gap-1">
              <Plus className="size-4" />
              담기
            </Button>
          </QuickForm>
        </section>

        {/* 일정 (Phase 2 Google Calendar 연동 후) */}
        <section>
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            📅 일정
          </h2>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs text-muted-foreground">
              Phase 2 Google Calendar 연동 후 표시됩니다.
            </p>
          </div>
        </section>

        {/* 오늘 할 일 */}
        <section>
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            ✅ 오늘 할 일 ({pending.length} 남음)
          </h2>
          {tasks.length === 0 ? (
            <div className="rounded-lg border bg-card p-8 text-center">
              <p className="mb-1 text-2xl">🌿</p>
              <p className="text-sm text-muted-foreground">
                오늘 할 일이 없어요. 평온한 날이네요.
              </p>
            </div>
          ) : (
            <ul className="space-y-0.5">
              {pending.map((t) => (
                <TaskRow key={t.id} item={t} />
              ))}
              {done.length > 0 && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground">
                    완료 ({done.length})
                  </summary>
                  <ul className="mt-1 space-y-0.5">
                    {done.map((t) => (
                      <TaskRow key={t.id} item={t} />
                    ))}
                  </ul>
                </details>
              )}
            </ul>
          )}
        </section>
      </div>
    </section>
  );
}
