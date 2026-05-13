import { CheckSquare, FileText, X } from "lucide-react";
import { AutoLink } from "@/components/shared/auto-link";
import { Button } from "@/components/ui/button";
import {
  convertInboxToNote,
  convertInboxToTask,
  softDeleteEntity,
} from "../actions";
import type { InboxItem } from "../types";

export function InboxRow({ item }: { item: InboxItem }) {
  const toTask = convertInboxToTask.bind(null, item.id);
  const toNote = convertInboxToNote.bind(null, item.id);
  const remove = softDeleteEntity.bind(null, item.id);
  const exactTime = item.createdAt.toLocaleString("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <li
      className="group flex items-start gap-2 rounded-md border border-transparent px-3 py-2 transition-colors hover:border-border hover:bg-accent/40"
      title={exactTime}
    >
      <div className="flex-1 break-words text-sm">
        <AutoLink text={item.body} />
      </div>
      <div className="flex shrink-0 gap-1 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100">
        <form action={toTask}>
          <Button type="submit" variant="ghost" size="icon-xs" title="Task로">
            <CheckSquare className="size-3.5" />
          </Button>
        </form>
        <form action={toNote}>
          <Button type="submit" variant="ghost" size="icon-xs" title="Note로">
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
