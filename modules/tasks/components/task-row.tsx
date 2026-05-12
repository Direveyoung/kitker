"use client";

import { Calendar, Flag, Repeat, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { softDeleteEntity } from "@/modules/inbox/actions";
import {
  setDueAt,
  setPriority,
  setRecurrence,
  toggleTask,
} from "../actions";
import type { Priority, Recurrence, TaskItem } from "../types";
import { cn } from "@/lib/utils";

const PRIORITY_META: Record<Priority, { label: string; color: string; border: string }> = {
  1: { label: "P1 — 가장 높음", color: "text-[var(--danger)]", border: "border-[var(--danger)]" },
  2: { label: "P2 — 높음", color: "text-[var(--accent-warm)]", border: "border-[var(--accent-warm)]" },
  3: { label: "P3 — 보통", color: "text-[var(--accent-amber)]", border: "border-[var(--accent-amber)]" },
  4: { label: "P4 — 없음", color: "text-muted-foreground", border: "border-input" },
};

const RECUR_META: Record<NonNullable<Recurrence>, string> = {
  daily: "매일",
  weekly: "매주",
  monthly: "매월",
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toLocalDateTimeInput(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDue(dueAt: Date | string | null): {
  label: string;
  tone: string;
  imminent: boolean;
} | null {
  if (!dueAt) return null;
  const due = typeof dueAt === "string" ? new Date(dueAt) : dueAt;
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  const diffMin = Math.round(diffMs / 60000);
  const diffHr = Math.round(diffMs / 3600000);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const dueStart = new Date(due);
  dueStart.setHours(0, 0, 0, 0);
  const dayDiff = Math.round((dueStart.getTime() - todayStart.getTime()) / 86400000);
  const timeStr = `${pad(due.getHours())}:${pad(due.getMinutes())}`;

  if (diffMs < 0) {
    if (diffMin > -60) return { label: `${-diffMin}분 지남`, tone: "text-[var(--danger)] font-medium", imminent: true };
    if (diffHr > -24) return { label: `${-diffHr}시간 지남`, tone: "text-[var(--danger)]", imminent: false };
    return { label: `${-dayDiff}일 지남`, tone: "text-[var(--danger)]", imminent: false };
  }
  if (diffMin < 60) return { label: `${diffMin}분 후`, tone: "text-[var(--accent-warm)] font-medium", imminent: true };
  if (dayDiff === 0) return { label: `오늘 ${timeStr}`, tone: "text-[var(--accent-sage-deep)] font-medium", imminent: diffHr < 2 };
  if (dayDiff === 1) return { label: `내일 ${timeStr}`, tone: "text-[var(--accent-warm)]", imminent: false };
  if (dayDiff <= 7) return { label: `${dayDiff}일 후 ${timeStr}`, tone: "text-muted-foreground", imminent: false };
  return {
    label: `${due.toLocaleDateString("ko-KR", { month: "short", day: "numeric" })} ${timeStr}`,
    tone: "text-muted-foreground",
    imminent: false,
  };
}

export function TaskRow({ item }: { item: TaskItem }) {
  const pri = PRIORITY_META[(item.priority as Priority) ?? 4] ?? PRIORITY_META[4];
  const due = formatDue(item.dueAt);

  return (
    <li
      className={cn(
        "group flex items-center gap-3 rounded-md border border-transparent px-3 py-1.5 transition-colors",
        due?.imminent && !item.completed
          ? "border-[var(--danger)]/30 bg-[var(--danger)]/5"
          : "hover:border-border hover:bg-accent/40",
      )}
    >
      <Checkbox
        checked={item.completed}
        onCheckedChange={() => void toggleTask(item.id)}
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

      {item.recurrence && (
        <span
          className="flex shrink-0 items-center gap-0.5 text-[11px] text-muted-foreground"
          title="반복"
        >
          <Repeat className="size-3" />
          {RECUR_META[item.recurrence]}
        </span>
      )}
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
        <DateInput id={item.id} value={item.dueAt} />
        <PriorityMenu id={item.id} current={item.priority as Priority} />
        <RecurrenceMenu id={item.id} current={item.recurrence} />
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => void softDeleteEntity(item.id)}
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
          <Button type="button" variant="ghost" size="icon-xs" title="우선순위">
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
          <DropdownMenuItem key={p} onClick={() => void setPriority(id, p)}>
            <Flag className={cn("mr-2 size-3.5", PRIORITY_META[p].color)} />
            {PRIORITY_META[p].label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function RecurrenceMenu({
  id,
  current,
}: {
  id: string;
  current: Recurrence;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button type="button" variant="ghost" size="icon-xs" title="반복">
            <Repeat
              className={cn(
                "size-3.5",
                current ? "text-primary" : "text-muted-foreground",
              )}
            />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => void setRecurrence(id, "daily")}>
          매일
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => void setRecurrence(id, "weekly")}>
          매주
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => void setRecurrence(id, "monthly")}>
          매월
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void setRecurrence(id, null)}>
          반복 없음
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DateInput({
  id,
  value,
}: {
  id: string;
  value: Date | string | null;
}) {
  const inputValue = value
    ? toLocalDateTimeInput(typeof value === "string" ? new Date(value) : value)
    : "";

  return (
    <label
      className="relative inline-flex size-6 cursor-pointer items-center justify-center rounded-md hover:bg-accent"
      title="마감일/시간"
    >
      <Calendar
        className={cn(
          "pointer-events-none size-3.5",
          value ? "text-primary" : "text-muted-foreground",
        )}
      />
      <input
        type="datetime-local"
        value={inputValue}
        onChange={(e) => void setDueAt(id, e.target.value || null)}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
    </label>
  );
}
