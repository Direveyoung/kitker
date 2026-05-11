import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { TodoRow } from "@/components/items/todo-row";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createItem } from "@/lib/items/actions";
import { getTodoItems } from "@/lib/items/queries";

export default async function TodoPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const todos = await getTodoItems(session.user.id);
  const pending = todos.filter((t) => !t.completed);
  const done = todos.filter((t) => t.completed);

  return (
    <section className="flex flex-1 flex-col">
      <div className="border-b p-4">
        <form action={createItem} className="mx-auto flex max-w-3xl gap-2">
          <input type="hidden" name="type" value="todo" />
          <Input
            name="body"
            placeholder="+ 할일 추가"
            autoComplete="off"
            required
          />
          <Button type="submit">추가</Button>
        </form>
      </div>

      <div className="mx-auto w-full max-w-3xl flex-1 overflow-auto p-4">
        {todos.length === 0 && (
          <p className="mt-12 text-center text-sm text-muted-foreground">
            할 일이 없어요. 깔끔!
          </p>
        )}

        {pending.length > 0 && (
          <ul className="mb-6 space-y-1">
            {pending.map((item) => (
              <TodoRow
                key={item.id}
                item={{
                  id: item.id,
                  body: item.body,
                  completed: item.completed,
                  carryOverCount: item.carryOverCount,
                }}
              />
            ))}
          </ul>
        )}

        {done.length > 0 && (
          <>
            <h2 className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
              완료 ({done.length})
            </h2>
            <ul className="space-y-1">
              {done.map((item) => (
                <TodoRow
                  key={item.id}
                  item={{
                    id: item.id,
                    body: item.body,
                    completed: item.completed,
                    carryOverCount: item.carryOverCount,
                  }}
                />
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
