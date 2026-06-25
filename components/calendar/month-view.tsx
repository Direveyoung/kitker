"use client";

import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/lib/calendar/types";
import {
  monthMatrix, eventsForDay, isSameDay, format, WEEKDAYS_KO,
} from "@/lib/calendar/date";
import { EVENT_CLASSES, DOT_CLASSES } from "./colors";

export function MonthView({
  cursor, events, onDayClick, onEventClick,
}: {
  cursor: Date;
  events: CalendarEvent[];
  onDayClick: (d: Date) => void;
  onEventClick: (e: CalendarEvent) => void;
}) {
  const weeks = monthMatrix(cursor);
  return (
    <div className="flex h-full flex-col">
      <div className="grid grid-cols-7 border-b text-center text-xs font-medium text-text-secondary">
        {WEEKDAYS_KO.map((w, i) => (
          <div
            key={w}
            className={cn("py-1.5", i === 0 && "text-danger", i === 6 && "text-petal-blue-accent")}
          >
            {w}
          </div>
        ))}
      </div>
      <div className="grid flex-1 grid-cols-7 grid-rows-6">
        {weeks.flat().map((day, i) => {
          const dayEvents = eventsForDay(events, day);
          const today = isSameDay(day, new Date());
          const dim = day.getMonth() !== cursor.getMonth();
          return (
            <div
              key={i}
              onClick={() => onDayClick(withHour(day, 9))}
              className={cn(
                "min-h-0 cursor-pointer border-b border-r p-1 transition-colors hover:bg-bg-muted/40",
                (i + 1) % 7 === 0 && "border-r-0",
              )}
            >
              <div className="mb-0.5 flex justify-center">
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full text-xs",
                    dim && "text-text-tertiary",
                    today && "bg-accent font-semibold text-white",
                  )}
                >
                  {day.getDate()}
                </span>
              </div>
              <div className="space-y-0.5 overflow-hidden">
                {dayEvents.slice(0, 3).map((e) => (
                  <button
                    key={e.id}
                    onClick={(ev) => { ev.stopPropagation(); onEventClick(e); }}
                    className={cn(
                      "flex w-full items-center gap-1 truncate rounded px-1 py-0.5 text-left text-[11px]",
                      e.allDay ? EVENT_CLASSES[e.color].chip : "hover:bg-bg-muted",
                    )}
                  >
                    {!e.allDay && (
                      <>
                        <span className={cn("size-1.5 shrink-0 rounded-full", DOT_CLASSES[e.color])} />
                        <span className="shrink-0 text-text-tertiary tabular-nums">
                          {format(new Date(e.startsAt), "HH:mm")}
                        </span>
                      </>
                    )}
                    <span className="truncate">{e.title}</span>
                  </button>
                ))}
                {dayEvents.length > 3 && (
                  <div className="px-1 text-[10px] text-text-tertiary">
                    +{dayEvents.length - 3}개 더
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function withHour(d: Date, h: number): Date {
  const x = new Date(d);
  x.setHours(h, 0, 0, 0);
  return x;
}
