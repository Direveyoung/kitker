import { CheckSquare, FileText, Plus, X } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { convertItem, createItem, deleteItem } from "@/lib/items/actions";
import { groupByRelativeTime } from "@/lib/items/grouping";
import { getInboxItems } from "@/lib/items/queries";

export default async function InboxPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const items = await getInboxItems(session.user.id);
  const groups = groupByRelativeTime(items);

  return (
    <section className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/80 px-4 py-4 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight">📥 Inbox</h1>
          <span className="text-xs text-muted-foreground">
            ({items.length})
          </span>
        </div>
        <form action={createItem} className="mx-auto mt-3 flex max-w-3xl gap-2">
          <input type="hidden" name="type" value="inbox" />
          <Input
            name="body"
            placeholder="떠오른 생각을 그냥 던지세요"
            autoComplete="off"
            autoFocus
            required
            className="h-11 text-base"
          />
          <Button type="submit" size="lg" className="gap-1">
            <Plus className="size-4" />
            담기
          </Button>
        </form>
      </header>

      <div className="mx-auto w-full max-w-3xl flex-1 overflow-auto p-4 sm:p-6">
        {items.length === 0 ? (
          <div className="mt-16 space-y-2 text-center">
            <p className="text-3xl">📥</p>
            <p className="text-sm font-medium">Inbox가 비어있어요</p>
            <p className="text-xs text-muted-foreground">
              떠오른 것은 일단 여기로. 정리는 나중에.
            </p>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.label} className="mb-6">
              <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {group.label}
              </h2>
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <InboxRow key={item.id} item={item} />
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function InboxRow({
  item,
}: {
  item: { id: string; body: string; createdAt: Date | null };
}) {
  const toTodo = convertItem.bind(null, item.id, "todo");
  const toNote = convertItem.bind(null, item.id, "note");
  const remove = deleteItem.bind(null, item.id);
  const exactTime = item.createdAt
    ? item.createdAt.toLocaleString("ko-KR", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "";
  return (
    <li
      className="group flex items-start gap-2 rounded-md border border-transparent px-3 py-2 transition-colors hover:border-border hover:bg-accent/40"
      title={exactTime}
    >
      <span className="flex-1 whitespace-pre-wrap break-words text-sm">
        {item.body}
      </span>
      <div className="flex shrink-0 gap-1 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100">
        <form action={toTodo}>
          <Button type="submit" variant="ghost" size="icon-xs" title="Todo로">
            <CheckSquare className="size-3.5" />
          </Button>
        </form>
        <form action={toNote}>
          <Button type="submit" variant="ghost" size="icon-xs" title="Notes로">
            <FileText className="size-3.5" />
          </Button>
        </form>
        <form action={remove}>
          <Button type="submit" variant="ghost" size="icon-xs" title="삭제">
            <X className="size-3.5" />
          </Button>
        </form>
      </div>
    </li>
  );
}
