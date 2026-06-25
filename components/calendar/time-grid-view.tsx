"use client";

import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/lib/calendar/types";
import {
  type ViewMode, weekDays, eventsForDay, eventBounds, isSameDay, format, WEEKDAYS_KO,
} from "@/lib/calendar/date";
import { EVENT_CLASSES } from "./colors";

const HOUR = 48; // px

export function TimeGridView({
  view, cursor, events, onSlotClick, onEventClick,
}: {
  view: ViewMode;
  cursor: Date;
  events: CalendarEvent[];
  onSlotClick: (d: Date) => void;
  onEventClick: (e: CalendarEvent) => void;
}) {
  const days = view === "day" ? [cursor] : weekDays(cursor);

  return (
    <div className="flex h-full flex-col">
      {/* 헤더 + 종일 스트립 */}
      <div className="flex border-b pr-3">
        <div className="w-14 shrink-0" />
        <div className="grid flex-1" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
          {days.map((d, i) => {
            const today = isSameDay(d, new Date());
            const allDay = eventsForDay(events, d).filter((e) => e.allDay);
            return (
              <div key={i} className="border-l px-1 py-1.5">
                <div className="flex flex-col items-center">
                  <span className={cn("text-[11px]", today ? "text-accent" : "text-text-tertiary")}>
                    {WEEKDAYS_KO[d.getDay()]}
                  </span>
                  <span
                    className={cn(
                      "flex size-7 items-center justify-center rounded-full text-sm",
                      today && "bg-accent font-semibold text-white",
                    )}
                  >
                    {d.getDate()}
                  </span>
                </div>
                <div className="mt-1 space-y-0.5">
                  {allDay.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => onEventClick(e)}
                      className={cn("block w-full truncate rounded px-1 py-0.5 text-left text-[11px]", EVENT_CLASSES[e.color].chip)}
                    >
                      {e.title}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 시간 그리드 */}
      <div className="flex flex-1 overflow-y-auto">
        <div className="w-14 shrink-0">
          {Array.from({ length: 24 }, (_, h) => (
            <div key={h} className="relative border-b text-right" style={{ height: HOUR }}>
              <span className="absolute -top-2 right-1.5 text-[10px] text-text-tertiary tabular-nums">
                {h === 0 ? "" : `${String(h).padStart(2, "0")}:00`}
              </span>
            </div>
          ))}
        </div>
        <div className="grid flex-1" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
          {days.map((day, i) => (
            <DayColumn
              key={i}
              day={day}
              events={eventsForDay(events, day).filter((e) => !e.allDay)}
              onSlotClick={onSlotClick}
              onEventClick={onEventClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function DayColumn({
  day, events, onSlotClick, onEventClick,
}: {
  day: Date;
  events: CalendarEvent[];
  onSlotClick: (d: Date) => void;
  onEventClick: (e: CalendarEvent) => void;
}) {
  const now = new Date();
  const showNow = isSameDay(day, now);
  return (
    <div className="relative border-l">
      {Array.from({ length: 24 }, (_, h) => (
        <button
          key={h}
          onClick={() => onSlotClick(withHour(day, h))}
          className="block w-full border-b hover:bg-bg-muted/40"
          style={{ height: HOUR }}
        />
      ))}
      {showNow && (
        <div
          className="pointer-events-none absolute inset-x-0 z-10 border-t border-danger"
          style={{ top: (now.getHours() + now.getMinutes() / 60) * HOUR }}
        >
          <span className="absolute -left-0 -top-1 size-2 rounded-full bg-danger" />
        </div>
      )}
      {events.map((e) => {
        const { start, end } = eventBounds(e);
        const s = clampToDay(start, day, 0);
        const en = clampToDay(end, day, 1);
        const top = (s.getHours() + s.getMinutes() / 60) * HOUR;
        const dur = Math.max((en.getTime() - s.getTime()) / 3.6e6, 0.5);
        return (
          <button
            key={e.id}
            onClick={() => onEventClick(e)}
            className={cn(
              "absolute left-0.5 right-0.5 z-20 overflow-hidden rounded px-1.5 py-0.5 text-left text-[11px] leading-tight",
              EVENT_CLASSES[e.color].block,
            )}
            style={{ top, height: dur * HOUR - 2 }}
          >
            <div className="font-medium tabular-nums">{format(s, "HH:mm")}</div>
            <div className="truncate">{e.title}</div>
          </button>
        );
      })}
    </div>
  );
}

function withHour(d: Date, h: number): Date {
  const x = new Date(d);
  x.setHours(h, 0, 0, 0);
  return x;
}
function clampToDay(d: Date, day: Date, edge: 0 | 1): Date {
  const start = new Date(day); start.setHours(0, 0, 0, 0);
  const endDay = new Date(day); endDay.setHours(23, 59, 59, 999);
  if (d < start) return start;
  if (d > endDay) return edge ? endDay : start;
  return d;
}
