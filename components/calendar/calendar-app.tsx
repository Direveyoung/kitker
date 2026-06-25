"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalendarDTO, CalendarEvent } from "@/lib/calendar/types";
import {
  type ViewMode, rangeTitle, shift, monthMatrix, WEEKDAYS_KO, isSameDay, format,
} from "@/lib/calendar/date";
import { DOT_CLASSES } from "./colors";
import { MonthView } from "./month-view";
import { TimeGridView } from "./time-grid-view";
import { EventDialog } from "./event-dialog";

type DialogState =
  | { open: false }
  | { open: true; event: CalendarEvent | null; date: Date };

export function CalendarApp({
  calendars,
  events,
}: {
  calendars: CalendarDTO[];
  events: CalendarEvent[];
}) {
  const router = useRouter();
  const [view, setView] = useState<ViewMode>("month");
  const [cursor, setCursor] = useState<Date>(new Date());
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [dialog, setDialog] = useState<DialogState>({ open: false });

  const visible = useMemo(
    () => events.filter((e) => !e.calendarId || !hidden.has(e.calendarId)),
    [events, hidden],
  );

  function toggleCal(id: string) {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function openCreate(date: Date) {
    setDialog({ open: true, event: null, date });
  }
  function openEdit(event: CalendarEvent) {
    setDialog({ open: true, event, date: new Date(event.startsAt) });
  }
  function close() {
    setDialog({ open: false });
    router.refresh();
  }

  const views: { key: ViewMode; label: string }[] = [
    { key: "month", label: "월" },
    { key: "week", label: "주" },
    { key: "day", label: "일" },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* 툴바 */}
      <div className="flex items-center gap-2 border-b px-4 py-2.5">
        <button
          onClick={() => setCursor(new Date())}
          className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-bg-muted"
        >
          오늘
        </button>
        <div className="flex items-center">
          <button
            aria-label="이전"
            onClick={() => setCursor((d) => shift(view, d, -1))}
            className="rounded-md p-1.5 text-text-secondary hover:bg-bg-muted"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            aria-label="다음"
            onClick={() => setCursor((d) => shift(view, d, 1))}
            className="rounded-md p-1.5 text-text-secondary hover:bg-bg-muted"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
        <h2 className="ml-1 text-lg font-semibold tracking-tight">
          {rangeTitle(view, cursor)}
        </h2>

        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-0.5 rounded-md border p-0.5">
            {views.map((v) => (
              <button
                key={v.key}
                onClick={() => setView(v.key)}
                className={cn(
                  "rounded-[6px] px-3 py-1 text-sm transition-colors",
                  view === v.key
                    ? "bg-accent-soft text-accent-deep"
                    : "text-text-secondary hover:bg-bg-muted",
                )}
              >
                {v.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => openCreate(cursor)}
            className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-deep"
          >
            <Plus className="size-4" /> 만들기
          </button>
        </div>
      </div>

      {/* 본문: 좌측 패널 + 뷰 */}
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-60 shrink-0 flex-col gap-4 border-r p-3 lg:flex">
          <MiniMonth cursor={cursor} onPick={(d) => setCursor(d)} />
          <CalendarList
            calendars={calendars}
            hidden={hidden}
            onToggle={toggleCal}
          />
        </aside>

        <div className="min-h-0 min-w-0 flex-1">
          {view === "month" ? (
            <MonthView
              cursor={cursor}
              events={visible}
              onDayClick={openCreate}
              onEventClick={openEdit}
            />
          ) : (
            <TimeGridView
              view={view}
              cursor={cursor}
              events={visible}
              onSlotClick={openCreate}
              onEventClick={openEdit}
            />
          )}
        </div>
      </div>

      {dialog.open && (
        <EventDialog
          calendars={calendars}
          event={dialog.event}
          defaultDate={dialog.date}
          onClose={close}
        />
      )}
    </div>
  );
}

function MiniMonth({ cursor, onPick }: { cursor: Date; onPick: (d: Date) => void }) {
  const [base, setBase] = useState(cursor);
  const weeks = monthMatrix(base);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between px-1">
        <span className="text-sm font-medium">{format(base, "yyyy년 M월")}</span>
        <div className="flex">
          <button onClick={() => setBase((d) => shift("month", d, -1))} className="rounded p-1 text-text-tertiary hover:bg-bg-muted"><ChevronLeft className="size-4" /></button>
          <button onClick={() => setBase((d) => shift("month", d, 1))} className="rounded p-1 text-text-tertiary hover:bg-bg-muted"><ChevronRight className="size-4" /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 text-center text-[10px] text-text-tertiary">
        {WEEKDAYS_KO.map((w) => <div key={w} className="py-1">{w}</div>)}
      </div>
      <div className="grid grid-cols-7 text-center text-xs">
        {weeks.flat().map((d, i) => {
          const today = isSameDay(d, new Date());
          const sel = isSameDay(d, cursor);
          const dim = d.getMonth() !== base.getMonth();
          return (
            <button
              key={i}
              onClick={() => onPick(d)}
              className={cn(
                "mx-auto my-0.5 flex size-6 items-center justify-center rounded-full",
                dim && "text-text-tertiary",
                today && "bg-accent text-white",
                !today && sel && "bg-accent-soft text-accent-deep",
                !today && !sel && "hover:bg-bg-muted",
              )}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CalendarList({
  calendars, hidden, onToggle,
}: {
  calendars: CalendarDTO[];
  hidden: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 px-1 text-xs font-semibold text-text-secondary">내 캘린더</div>
      <ul className="space-y-0.5">
        {calendars.map((c) => {
          const on = !hidden.has(c.id);
          return (
            <li key={c.id}>
              <button
                onClick={() => onToggle(c.id)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-bg-muted"
              >
                <span
                  className={cn(
                    "size-3.5 rounded-[4px] border",
                    on ? DOT_CLASSES[c.color] : "bg-transparent",
                    on ? "border-transparent" : "border-border-strong",
                  )}
                />
                <span className={cn(!on && "text-text-tertiary line-through")}>{c.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
