import {
  addDays, addMonths, addWeeks, eachDayOfInterval, endOfMonth, endOfWeek,
  format, isSameDay, isToday, startOfDay, startOfMonth, startOfWeek,
} from "date-fns";
import type { CalendarEvent } from "./types";

export type ViewMode = "month" | "week" | "day";
export const WEEKDAYS_KO = ["일", "월", "화", "수", "목", "금", "토"];

export function monthMatrix(d: Date): Date[][] {
  const start = startOfWeek(startOfMonth(d), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(d), { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start, end });
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return weeks;
}

export function weekDays(d: Date): Date[] {
  const start = startOfWeek(d, { weekStartsOn: 0 });
  return eachDayOfInterval({ start, end: endOfWeek(d, { weekStartsOn: 0 }) });
}

export function shift(view: ViewMode, d: Date, dir: number): Date {
  if (view === "month") return addMonths(d, dir);
  if (view === "week") return addWeeks(d, dir);
  return addDays(d, dir);
}

export function rangeTitle(view: ViewMode, d: Date): string {
  if (view === "month") return format(d, "yyyy년 M월");
  if (view === "day") return format(d, "yyyy년 M월 d일 (EEEEEE)");
  const w = weekDays(d);
  return `${format(w[0], "M월 d일")} – ${format(w[6], "M월 d일")}`;
}

/** 이벤트의 로컬 시작/끝 Date */
export function eventBounds(e: CalendarEvent): { start: Date; end: Date } {
  if (e.allDay) {
    const start = parseDateKey(e.startsAt);
    const end = e.endsAt ? parseDateKey(e.endsAt) : start;
    return { start: startOfDay(start), end: startOfDay(end) };
  }
  const start = new Date(e.startsAt);
  const end = e.endsAt ? new Date(e.endsAt) : start;
  return { start, end };
}

export function parseDateKey(s: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(s);
}

/* ── 할 일 마감(dueAt) 공용 헬퍼 — Today/Tasks 단일 소스 ── */
export function isOverdue(dueAt: string | null): boolean {
  if (!dueAt) return false;
  return startOfDay(parseDateKey(dueAt)).getTime() < startOfDay(new Date()).getTime();
}
export function isDueToday(dueAt: string | null): boolean {
  if (!dueAt) return false;
  return isToday(parseDateKey(dueAt));
}
export function formatDue(dueAt: string): string {
  const d = parseDateKey(dueAt);
  if (isToday(d)) return "오늘";
  return format(d, "M/d");
}

export function coversDay(e: CalendarEvent, day: Date): boolean {
  const { start, end } = eventBounds(e);
  const d0 = startOfDay(day).getTime();
  return d0 >= startOfDay(start).getTime() && d0 <= startOfDay(end).getTime();
}

export function eventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  return events
    .filter((e) => coversDay(e, day))
    .sort((a, b) => {
      if (a.allDay !== b.allDay) return a.allDay ? -1 : 1;
      return eventBounds(a).start.getTime() - eventBounds(b).start.getTime();
    });
}

export { isSameDay, format, startOfDay };
