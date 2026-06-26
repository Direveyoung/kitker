"use client";

import { useMemo, useOptimistic, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, LayoutGrid, List, Plus } from "lucide-react";
import { format, isToday, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import type { TodoDTO } from "@/lib/today/queries";
import { createTodo, toggleTodo } from "@/lib/today/actions";

type Bucket = "overdue" | "today" | "upcoming" | "none" | "done";

const BUCKETS: { key: Bucket; label: string; tone: string }[] = [
  { key: "overdue", label: "지난 마감", tone: "text-danger" },
  { key: "today", label: "오늘", tone: "text-accent-deep" },
  { key: "upcoming", label: "예정", tone: "text-text-primary" },
  { key: "none", label: "마감 없음", tone: "text-text-secondary" },
  { key: "done", label: "완료", tone: "text-success" },
];

export function TasksView({ todos }: { todos: TodoDTO[] }) {
  const [view, setView] = useState<"list" | "board">("list");

  const grouped = useMemo(() => {
    const g: Record<Bucket, TodoDTO[]> = {
      overdue: [], today: [], upcoming: [], none: [], done: [],
    };
    for (const t of todos) g[bucketOf(t)].push(t);
    for (const k of Object.keys(g) as Bucket[]) {
      g[k].sort((a, b) => dueValue(a) - dueValue(b));
    }
    return g;
  }, [todos]);

  const remaining = todos.filter((t) => !t.done).length;

  return (
    <div className="mx-auto flex max-w-4xl flex-1 flex-col gap-5 px-6 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-text-primary">할 일</h1>
          <p className="text-sm text-text-secondary">남은 할 일 {remaining}개</p>
        </div>
        <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
          <ViewBtn on={view === "list"} onClick={() => setView("list")} icon={<List className="size-4" />} label="목록" />
          <ViewBtn on={view === "board"} onClick={() => setView("board")} icon={<LayoutGrid className="size-4" />} label="보드" />
        </div>
      </header>

      <Capture />

      {todos.length === 0 ? (
        <Empty>할 일이 없어요. 위에서 추가하거나 메모에서 “할 일” 속성을 켜보세요.</Empty>
      ) : view === "list" ? (
        <div className="flex flex-col gap-5">
          {BUCKETS.map((b) =>
            grouped[b.key].length ? (
              <section key={b.key} className="flex flex-col gap-1">
                <h2 className={cn("text-xs font-semibold uppercase tracking-wide", b.tone)}>
                  {b.label} <span className="text-text-tertiary">{grouped[b.key].length}</span>
                </h2>
                <ul className="flex flex-col gap-0.5">
                  {grouped[b.key].map((t) => (
                    <TaskRow key={t.id} todo={t} />
                  ))}
                </ul>
              </section>
            ) : null,
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {BUCKETS.filter((b) => b.key !== "done").map((b) => (
            <div key={b.key} className="flex flex-col gap-2 rounded-lg border border-border bg-bg-surface p-3">
              <h2 className={cn("text-xs font-semibold uppercase tracking-wide", b.tone)}>
                {b.label} <span className="text-text-tertiary">{grouped[b.key].length}</span>
              </h2>
              <ul className="flex flex-col gap-1">
                {grouped[b.key].map((t) => (
                  <TaskCard key={t.id} todo={t} />
                ))}
                {grouped[b.key].length === 0 && (
                  <li className="rounded-md border border-dashed border-border px-2 py-3 text-center text-xs text-text-tertiary">
                    비어있음
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ViewBtn({ on, onClick, icon, label }: { on: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs",
        on ? "bg-accent-soft text-accent-deep" : "text-text-secondary hover:bg-bg-muted",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function Capture() {
  const [value, setValue] = useState("");
  const [pending, start] = useTransition();
  const ref = useRef<HTMLInputElement>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const title = value.trim();
    if (!title) return;
    setValue("");
    start(async () => {
      await createTodo({ title });
      ref.current?.focus();
    });
  }

  return (
    <form
      onSubmit={submit}
      className="flex items-center gap-2 rounded-lg border border-border bg-bg-surface px-3 py-2 focus-within:border-accent"
    >
      <Plus className="size-4 shrink-0 text-text-tertiary" />
      <input
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="할 일 추가… (Enter)"
        disabled={pending}
        className="flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-tertiary"
      />
    </form>
  );
}

function TaskRow({ todo }: { todo: TodoDTO }) {
  const [done, setDone] = useOptimistic(todo.done);
  const [, start] = useTransition();
  const overdue = !done && isOverdue(todo.dueAt);

  return (
    <li className="group flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-bg-muted">
      <button
        onClick={() => start(async () => { setDone(!done); await toggleTodo(todo.id, !done); })}
        className="shrink-0"
        aria-label="완료 토글"
      >
        {done ? (
          <CheckCircle2 className="size-4 text-success" />
        ) : (
          <Circle className="size-4 text-text-tertiary group-hover:text-accent" />
        )}
      </button>
      <Link
        href={`/pages/${todo.id}`}
        className={cn("min-w-0 flex-1 truncate text-sm", done ? "text-text-tertiary line-through" : "text-text-primary")}
      >
        {todo.title}
      </Link>
      {todo.dueAt && !done && (
        <span className={cn("shrink-0 text-xs", overdue ? "text-danger" : "text-text-tertiary")}>
          {formatDue(todo.dueAt)}
        </span>
      )}
    </li>
  );
}

function TaskCard({ todo }: { todo: TodoDTO }) {
  const [done, setDone] = useOptimistic(todo.done);
  const [, start] = useTransition();
  return (
    <li className="flex items-start gap-2 rounded-md border border-border bg-bg-page px-2 py-1.5">
      <button
        onClick={() => start(async () => { setDone(!done); await toggleTodo(todo.id, !done); })}
        className="mt-0.5 shrink-0"
        aria-label="완료 토글"
      >
        {done ? <CheckCircle2 className="size-4 text-success" /> : <Circle className="size-4 text-text-tertiary" />}
      </button>
      <Link
        href={`/pages/${todo.id}`}
        className={cn("min-w-0 flex-1 break-words text-sm", done ? "text-text-tertiary line-through" : "text-text-primary")}
      >
        {todo.title}
      </Link>
    </li>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-text-tertiary">
      {children}
    </p>
  );
}

/* ── helpers ── */
function parseDue(s: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(s);
}
function isOverdue(dueAt: string | null): boolean {
  if (!dueAt) return false;
  return startOfDay(parseDue(dueAt)).getTime() < startOfDay(new Date()).getTime();
}
function bucketOf(t: TodoDTO): Bucket {
  if (t.done) return "done";
  if (!t.dueAt) return "none";
  if (isOverdue(t.dueAt)) return "overdue";
  if (isToday(parseDue(t.dueAt))) return "today";
  return "upcoming";
}
function dueValue(t: TodoDTO): number {
  return t.dueAt ? parseDue(t.dueAt).getTime() : Infinity;
}
function formatDue(dueAt: string): string {
  const d = parseDue(dueAt);
  if (isToday(d)) return "오늘";
  return format(d, "M/d");
}
