import { cn } from "@/lib/utils";
import type { CalEvent } from "../types";

const WEEKDAYS_KO = ["일", "월", "화", "수", "목", "금", "토"];

function startOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function MonthGrid({
  year,
  month,
  events,
}: {
  year: number;
  month: number; // 0-indexed
  events: CalEvent[];
}) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startSunday = new Date(firstDay);
  startSunday.setDate(firstDay.getDate() - firstDay.getDay());
  const endSaturday = new Date(lastDay);
  endSaturday.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

  const cells: Date[] = [];
  const cursor = new Date(startSunday);
  while (cursor <= endSaturday) {
    cells.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  const today = startOfDay(new Date());

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="grid grid-cols-7 border-b bg-muted/40">
        {WEEKDAYS_KO.map((w, i) => (
          <div
            key={w}
            className={cn(
              "px-2 py-2 text-center text-[11px] font-medium uppercase tracking-wide text-muted-foreground",
              i === 0 && "text-[var(--danger)]",
              i === 6 && "text-[var(--accent-warm)]",
            )}
          >
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 grid-rows-[repeat(6,minmax(96px,1fr))]">
        {cells.map((d, i) => {
          const inMonth = d.getMonth() === month;
          const isToday = isSameDay(d, today);
          const isSun = d.getDay() === 0;
          const isSat = d.getDay() === 6;
          const dayEvents = events.filter((e) => isSameDay(e.startsAt, d));
          return (
            <div
              key={i}
              className={cn(
                "border-r border-b p-1.5",
                i % 7 === 6 && "border-r-0",
                i >= 35 && "border-b-0",
                !inMonth && "bg-muted/20 text-muted-foreground",
              )}
            >
              <div
                className={cn(
                  "mb-1 inline-flex size-5 items-center justify-center rounded-full text-[11px] tabular-nums",
                  isToday && "bg-primary text-primary-foreground font-semibold",
                  !isToday && isSun && "text-[var(--danger)]",
                  !isToday && isSat && "text-[var(--accent-warm)]",
                )}
              >
                {d.getDate()}
              </div>
              <ul className="space-y-0.5">
                {dayEvents.slice(0, 3).map((e) => (
                  <li
                    key={e.id}
                    className="truncate rounded bg-sidebar-accent px-1.5 py-0.5 text-[10px] text-sidebar-accent-foreground"
                    title={e.title}
                  >
                    {!e.isAllDay && (
                      <span className="mr-1 text-[9px] opacity-70 tabular-nums">
                        {String(e.startsAt.getHours()).padStart(2, "0")}:
                        {String(e.startsAt.getMinutes()).padStart(2, "0")}
                      </span>
                    )}
                    {e.title}
                  </li>
                ))}
                {dayEvents.length > 3 && (
                  <li className="text-[10px] text-muted-foreground">
                    +{dayEvents.length - 3}
                  </li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
