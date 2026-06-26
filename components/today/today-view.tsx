"use client";

import { useEffect, useMemo, useOptimistic, useRef, useState, useTransition } from "react";
import { CalendarDays, CheckCircle2, Circle, MapPin, Plus, Sun } from "lucide-react";
import { format, isToday, startOfDay } from "date-fns";
import type { CalendarEvent } from "@/lib/calendar/types";
import { eventBounds, eventsForDay } from "@/lib/calendar/date";
import { EVENT_CLASSES } from "@/components/calendar/colors";
import type { TodoDTO } from "@/lib/today/queries";
import { createTodo, toggleTodo } from "@/lib/today/actions";

const VERSE =
  "오늘 하루도, 멀리 있어도 마음은 같은 시간 위에.";

export function TodayView({
  events,
  todos,
}: {
  events: CalendarEvent[];
  todos: TodoDTO[];
}) {
  const today = useMemo(() => new Date(), []);
  const dayEvents = useMemo(() => eventsForDay(events, today), [events, today]);

  // 오늘 관련 할 일: 미완료(마감 오늘/지남/없음) + 오늘 완료분
  const { active, doneToday } = useMemo(() => splitTodos(todos), [todos]);
  const list = [...active, ...doneToday];

  const total = active.length + doneToday.length;
  const pct = total === 0 ? 0 : Math.round((doneToday.length / total) * 100);

  return (
    <div className="mx-auto flex max-w-3xl flex-1 flex-col gap-6 px-6 py-8">
      <Header today={today} />

      <ProgressBar done={doneToday.length} total={total} pct={pct} />

      <Capture />

      <Section icon={<CalendarDays className="size-4" />} title="오늘 일정" count={dayEvents.length}>
        {dayEvents.length === 0 ? (
          <Empty>오늘 일정이 없어요.</Empty>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {dayEvents.map((e) => (
              <EventRow key={e.id} event={e} />
            ))}
          </ul>
        )}
      </Section>

      <Section icon={<CheckCircle2 className="size-4" />} title="할 일" count={active.length}>
        {list.length === 0 ? (
          <Empty>할 일이 비었어요. 위에서 바로 추가해보세요.</Empty>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {list.map((t) => (
              <TodoRow key={t.id} todo={t} />
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

/* ── 헤더: 날짜 + 발리/서울 듀얼 시계 ──────────────── */
function Header({ today }: { today: Date }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Sun className="size-4 text-amber" />
          {format(today, "yyyy년 M월 d일 EEEE")}
        </div>
        <h1 className="mt-1 font-serif text-2xl text-text-primary">
          Today
        </h1>
        <p className="mt-1 font-serif text-sm italic text-text-tertiary">“{VERSE}”</p>
      </div>
      <DualClock />
    </header>
  );
}

function DualClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex gap-4">
      <Clock label="발리" tz="Asia/Makassar" now={now} />
      <Clock label="서울" tz="Asia/Seoul" now={now} />
    </div>
  );
}

function Clock({ label, tz, now }: { label: string; tz: string; now: Date | null }) {
  const time = now
    ? new Intl.DateTimeFormat("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: tz,
      }).format(now)
    : "--:--";
  return (
    <div className="rounded-md border border-border bg-bg-surface px-3 py-1.5 text-right">
      <div className="text-[11px] text-text-tertiary">{label}</div>
      <div className="font-mono text-base tabular-nums text-text-primary">{time}</div>
    </div>
  );
}

/* ── 진행률 ───────────────────────────────────────── */
function ProgressBar({ done, total, pct }: { done: number; total: number; pct: number }) {
  return (
    <div className="rounded-lg border border-border bg-bg-surface p-4">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-sm font-medium text-text-primary">오늘 진행률</span>
        <span className="text-sm text-text-secondary">
          {total === 0 ? "할 일 없음" : `${done} / ${total} · ${pct}%`}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-bg-muted">
        <div
          className="h-full rounded-full bg-success transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ── universal capture ────────────────────────────── */
function Capture() {
  const [value, setValue] = useState("");
  const [pending, start] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const title = value.trim();
    if (!title) return;
    setValue("");
    start(async () => {
      await createTodo({ title });
      inputRef.current?.focus();
    });
  }

  return (
    <form
      onSubmit={submit}
      className="flex items-center gap-2 rounded-lg border border-border bg-bg-surface px-3 py-2 focus-within:border-accent"
    >
      <Plus className="size-4 shrink-0 text-text-tertiary" />
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="할 일을 빠르게 추가… (Enter)"
        className="flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-tertiary"
        disabled={pending}
      />
    </form>
  );
}

/* ── 섹션 래퍼 ───────────────────────────────────── */
function Section({
  icon,
  title,
  count,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-text-secondary">
        {icon}
        <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
        <span className="text-xs text-text-tertiary">{count}</span>
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-text-tertiary">
      {children}
    </p>
  );
}

/* ── 일정 행 ─────────────────────────────────────── */
function EventRow({ event }: { event: CalendarEvent }) {
  const cls = EVENT_CLASSES[event.color];
  const time = event.allDay ? "종일" : format(eventBounds(event).start, "HH:mm");
  return (
    <li className={`flex items-center gap-3 rounded-md px-3 py-2 ${cls.block}`}>
      <span className="w-12 shrink-0 font-mono text-xs tabular-nums opacity-80">{time}</span>
      <span className="flex-1 truncate text-sm font-medium">{event.title}</span>
      {event.location ? (
        <span className="flex items-center gap-1 text-xs opacity-70">
          <MapPin className="size-3" />
          {event.location}
        </span>
      ) : null}
    </li>
  );
}

/* ── 할 일 행 (낙관적 토글) ───────────────────────── */
function TodoRow({ todo }: { todo: TodoDTO }) {
  const [optimisticDone, setOptimisticDone] = useOptimistic(todo.done);
  const [, start] = useTransition();

  const overdue = !optimisticDone && isOverdue(todo.dueAt);

  function toggle() {
    start(async () => {
      setOptimisticDone(!optimisticDone);
      await toggleTodo(todo.id, !optimisticDone);
    });
  }

  return (
    <li>
      <button
        onClick={toggle}
        className="group flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-bg-muted"
      >
        {optimisticDone ? (
          <CheckCircle2 className="size-4 shrink-0 text-success" />
        ) : (
          <Circle className="size-4 shrink-0 text-text-tertiary group-hover:text-accent" />
        )}
        <span
          className={`flex-1 truncate text-sm ${
            optimisticDone ? "text-text-tertiary line-through" : "text-text-primary"
          }`}
        >
          {todo.title}
        </span>
        {todo.dueAt && !optimisticDone ? (
          <span className={`text-xs ${overdue ? "text-danger" : "text-text-tertiary"}`}>
            {formatDue(todo.dueAt)}
          </span>
        ) : null}
      </button>
    </li>
  );
}

/* ── 헬퍼 ────────────────────────────────────────── */
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

function isDueToday(dueAt: string | null): boolean {
  if (!dueAt) return false;
  return isToday(parseDue(dueAt));
}

function formatDue(dueAt: string): string {
  const d = parseDue(dueAt);
  if (isToday(d)) return "오늘";
  return format(d, "M/d");
}

function splitTodos(todos: TodoDTO[]): { active: TodoDTO[]; doneToday: TodoDTO[] } {
  const active = todos
    .filter((t) => !t.done) // 미완료 전부 (마감 오늘/지남/없음)
    .sort((a, b) => rank(a) - rank(b));
  const doneToday = todos.filter((t) => t.done && isDueToday(t.dueAt));
  return { active, doneToday };
}

// 정렬 우선순위: 지난 마감 → 오늘 마감 → 마감 없음
function rank(t: TodoDTO): number {
  if (isOverdue(t.dueAt)) return 0;
  if (isDueToday(t.dueAt)) return 1;
  if (t.dueAt) return 2;
  return 3;
}
