"use client";

import { Calendar, Flag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  deleteItem,
  setDueDate,
  setPriority,
  toggleTodo,
} from "@/lib/items/actions";
import { cn } from "@/lib/utils";

type Priority = 1 | 2 | 3 | 4;

const PRIORITY_META: Record<Priority, { label: string; color: string; border: string }> = {
  1: { label: "P1 — 가장 높음", color: "text-red-500", border: "border-red-500" },
  2: { label: "P2 — 높음", color: "text-orange-500", border: "border-orange-500" },
  3: { label: "P3 — 보통", color: "text-blue-500", border: "border-blue-500" },
  4: { label: "P4 — 없음", color: "text-muted-foreground", border: "border-input" },
};

function todayString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDue(due: string | null): { label: string; tone: string } | null {
  if (!due) return null;
  const today = todayString();
  if (due === today) return { label: "오늘", tone: "text-emerald-600 font-medium" };
  const diff = Math.floor(
    (new Date(due).getTime() - new Date(today).getTime()) / 86400000,
  );
  if (diff < 0) return { label: `${-diff}일 지남`, tone: "text-red-600" };
  if (diff === 1) return { label: "내일", tone: "text-orange-600" };
  if (diff <= 7) return { label: `${diff}일 후`, tone: "text-muted-foreground" };
  return {
    label: new Date(due).toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    }),
    tone: "text-muted-foreground",
  };
}

type Item = {
  id: string;
  body: string;
  completed: boolean;
  carryOverCount: number;
  priority: number;
  dueDate: string | null;
};

export function TodoRow({ item }: { item: Item }) {
  const pri = PRIORITY_META[(item.priority as Priority) ?? 4] ?? PRIORITY_META[4];
  const due = formatDue(item.dueDate);

  return (
    <li className="group flex items-center gap-3 rounded-md border border-transparent px-3 py-2 transition-colors hover:border-border hover:bg-accent/40">
      <Checkbox
        checked={item.completed}
        onCheckedChange={() => void toggleTodo(item.id)}
        className={cn(
          "size-[18px] shrink-0 rounded-full border-2",
          item.priority < 4 && pri.border,
        )}
      />
      <span
        className={cn(
          "flex-1 whitespace-pre-wrap break-words text-sm",
          item.completed && "text-muted-foreground line-through",
        )}
      >
        {item.body}
      </span>

      {due && (
        <span className={cn("shrink-0 text-xs whitespace-nowrap", due.tone)}>
          {due.label}
        </span>
      )}
      {item.carryOverCount > 0 && (
        <span
          className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
          title={`${item.carryOverCount}일 이월됨`}
        >
          ↩{item.carryOverCount}
        </span>
      )}

      <div className="flex shrink-0 items-center gap-0.5 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100">
        <DateInput id={item.id} value={item.dueDate} />
        <PriorityMenu id={item.id} current={item.priority as Priority} />
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => void deleteItem(item.id)}
          title="삭제"
        >
          <X className="size-3.5" />
        </Button>
      </div>
    </li>
  );
}

function PriorityMenu({ id, current }: { id: string; current: Priority }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            title="우선순위"
          >
            <Flag
              className={cn(
                "size-3.5",
                PRIORITY_META[current]?.color ?? "text-muted-foreground",
              )}
            />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {([1, 2, 3, 4] as Priority[]).map((p) => (
          <DropdownMenuItem
            key={p}
            onClick={() => void setPriority(id, p)}
          >
            <Flag className={cn("mr-2 size-3.5", PRIORITY_META[p].color)} />
            {PRIORITY_META[p].label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DateInput({ id, value }: { id: string; value: string | null }) {
  return (
    <label
      className="relative inline-flex size-6 cursor-pointer items-center justify-center rounded-md hover:bg-accent"
      title="마감일"
    >
      <Calendar
        className={cn(
          "size-3.5 pointer-events-none",
          value ? "text-primary" : "text-muted-foreground",
        )}
      />
      <input
        type="date"
        value={value ?? ""}
        onChange={(e) => void setDueDate(id, e.target.value || null)}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
    </label>
  );
}
