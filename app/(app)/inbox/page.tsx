import { CheckSquare, FileText, X } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
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
      <div className="border-b p-4">
        <form action={createItem} className="mx-auto flex max-w-3xl gap-2">
          <input type="hidden" name="type" value="inbox" />
          <Input
            name="body"
            placeholder="떠오른 생각을 그냥 던지세요"
            autoComplete="off"
            autoFocus
            required
          />
          <Button type="submit">담기</Button>
        </form>
      </div>

      <div className="mx-auto w-full max-w-3xl flex-1 overflow-auto p-4">
        {items.length === 0 ? (
          <p className="mt-12 text-center text-sm text-muted-foreground">
            비어있어요. 위에 떠오른 걸 던지세요.
          </p>
        ) : (
          groups.map((group) => (
            <div key={group.label} className="mb-6">
              <h2 className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                {group.label}
              </h2>
              <ul className="space-y-1">
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

function InboxRow({ item }: { item: { id: string; body: string } }) {
  const toTodo = convertItem.bind(null, item.id, "todo");
  const toNote = convertItem.bind(null, item.id, "note");
  const remove = deleteItem.bind(null, item.id);
  return (
    <li className="group flex items-start gap-2 rounded-md px-3 py-2 hover:bg-accent">
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
