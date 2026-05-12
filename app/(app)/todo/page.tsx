import { Plus } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { TodoRow } from "@/components/items/todo-row";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { carryOverTodos, createItem } from "@/lib/items/actions";
import { getTodoItems } from "@/lib/items/queries";

export default async function TodoPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // 자정 자동 carry-over (idempotent — 하루 1회만 카운트 증가)
  await carryOverTodos();

  const todos = await getTodoItems(session.user.id);
  const pending = todos.filter((t) => !t.completed);
  const done = todos.filter((t) => t.completed);

  return (
    <section className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/80 px-4 py-4 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight">✅ Todo</h1>
          <span className="text-xs text-muted-foreground">
            {pending.length}개 남음
          </span>
        </div>
        <form action={createItem} className="mx-auto mt-3 flex max-w-3xl gap-2">
          <input type="hidden" name="type" value="todo" />
          <Input
            name="body"
            placeholder='+ 할일 — "내일 오후 3시 회의", "매주 월요일 보고" 같이 입력하면 자동 인식'
            autoComplete="off"
            required
            className="h-11 text-base"
          />
          <Button type="submit" size="lg" className="gap-1">
            <Plus className="size-4" />
            추가
          </Button>
        </form>
      </header>

      <div className="mx-auto w-full max-w-3xl flex-1 overflow-auto p-4 sm:p-6">
        {todos.length === 0 && (
          <div className="mt-16 space-y-2 text-center">
            <p className="text-3xl">🎉</p>
            <p className="text-sm font-medium">할 일이 없어요</p>
            <p className="text-xs text-muted-foreground">깔끔!</p>
          </div>
        )}

        {pending.length > 0 && (
          <ul className="mb-6 space-y-0.5">
            {pending.map((item) => (
              <TodoRow
                key={item.id}
                item={{
                  id: item.id,
                  body: item.body,
                  completed: item.completed,
                  carryOverCount: item.carryOverCount,
                  priority: item.priority,
                  dueAt: item.dueAt,
                  recurrence: item.recurrence,
                }}
              />
            ))}
          </ul>
        )}

        {done.length > 0 && (
          <details className="group" open={pending.length === 0}>
            <summary className="mb-2 cursor-pointer text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground">
              완료 ({done.length})
            </summary>
            <ul className="space-y-0.5">
              {done.map((item) => (
                <TodoRow
                  key={item.id}
                  item={{
                    id: item.id,
                    body: item.body,
                    completed: item.completed,
                    carryOverCount: item.carryOverCount,
                    priority: item.priority,
                    dueAt: item.dueAt,
                    recurrence: item.recurrence,
                  }}
                />
              ))}
            </ul>
          </details>
        )}
      </div>
    </section>
  );
}
