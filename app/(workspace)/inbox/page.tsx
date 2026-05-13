import { Plus } from "lucide-react";
import { requireUserId } from "@/lib/auth/dev-session";
import { Button } from "@/components/ui/button";
import { QuickForm } from "@/components/shared/quick-form";
import { QuickInput } from "@/components/shared/quick-input";
import { groupByRelativeTime } from "@/lib/items/grouping";
import { createInboxItem } from "@/modules/inbox/actions";
import { InboxRow } from "@/modules/inbox/components/inbox-row";
import { getInboxItems } from "@/modules/inbox/queries";

export default async function InboxPage() {
  const userId = await requireUserId();
  const items = await getInboxItems(userId);
  const groups = groupByRelativeTime(items);

  return (
    <section className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/80 px-4 py-4 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">📥 Inbox</h1>
          <span className="text-xs text-muted-foreground">({items.length})</span>
        </div>
        <QuickForm
          action={createInboxItem}
          className="mx-auto mt-3 flex max-w-3xl items-start gap-2"
        >
          <QuickInput
            placeholder="떠오른 생각을 그냥 던지세요 · URL/이미지 paste 가능"
            autoFocus
          />
          <Button type="submit" size="lg" className="shrink-0 gap-1">
            <Plus className="size-4" />
            담기
          </Button>
        </QuickForm>
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
