"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalendarDTO, CalendarEvent } from "@/lib/calendar/types";
import { createEvent, updateEvent, deleteEvent } from "@/lib/calendar/actions";
import { DOT_CLASSES } from "./colors";

function toLocalInput(iso: string): string {
  return format(new Date(iso), "yyyy-MM-dd'T'HH:mm");
}
function toDateInput(s: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : format(new Date(s), "yyyy-MM-dd");
}

export function EventDialog({
  calendars, event, defaultDate, onClose,
}: {
  calendars: CalendarDTO[];
  event: CalendarEvent | null;
  defaultDate: Date;
  onClose: () => void;
}) {
  const editing = !!event;
  const start0 = event ? new Date(event.startsAt) : defaultDate;
  const end0 = event?.endsAt
    ? new Date(event.endsAt)
    : new Date(start0.getTime() + 60 * 60 * 1000);

  const [title, setTitle] = useState(event?.title ?? "");
  const [calendarId, setCalendarId] = useState(event?.calendarId ?? calendars[0]?.id ?? "");
  const [allDay, setAllDay] = useState(event?.allDay ?? false);
  const [start, setStart] = useState(
    event?.allDay ? toDateInput(event.startsAt) : toLocalInput(start0.toISOString()),
  );
  const [end, setEnd] = useState(
    event?.allDay
      ? toDateInput(event.endsAt ?? event.startsAt)
      : toLocalInput(end0.toISOString()),
  );
  const [location, setLocation] = useState(event?.location ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [busy, setBusy] = useState(false);

  function onToggleAllDay(next: boolean) {
    setAllDay(next);
    if (next) {
      setStart(toDateInput(start));
      setEnd(toDateInput(end));
    } else {
      const base = /^\d{4}-\d{2}-\d{2}$/.test(start) ? `${start}T09:00` : start;
      setStart(base);
      setEnd(toLocalInput(new Date(new Date(base).getTime() + 3.6e6).toISOString()));
    }
  }

  async function save() {
    setBusy(true);
    const payload = {
      id: event?.id,
      calendarId: calendarId || null,
      title: title.trim() || "제목 없음",
      allDay,
      startsAt: allDay ? start : new Date(start).toISOString(),
      endsAt: allDay ? end || start : new Date(end).toISOString(),
      location: location.trim() || null,
      description: description.trim() || null,
    };
    try {
      if (editing) await updateEvent(payload);
      else await createEvent(payload);
      onClose();
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!event) return;
    setBusy(true);
    try { await deleteEvent(event.id); onClose(); } finally { setBusy(false); }
  }

  const field = "w-full rounded-md border bg-bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border bg-bg-surface shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-semibold">{editing ? "일정 편집" : "새 일정"}</h3>
          <button onClick={onClose} className="rounded p-1 text-text-tertiary hover:bg-bg-muted">
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-3 p-4">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목 추가"
            className="w-full border-b bg-transparent pb-1.5 text-base font-medium outline-none placeholder:text-text-tertiary"
          />

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={allDay} onChange={(e) => onToggleAllDay(e.target.checked)} />
            종일
          </label>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="mb-1 text-xs text-text-secondary">시작</div>
              <input
                type={allDay ? "date" : "datetime-local"}
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className={field}
              />
            </div>
            <div>
              <div className="mb-1 text-xs text-text-secondary">종료</div>
              <input
                type={allDay ? "date" : "datetime-local"}
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className={field}
              />
            </div>
          </div>

          <div>
            <div className="mb-1 text-xs text-text-secondary">캘린더</div>
            <div className="flex flex-wrap gap-1.5">
              {calendars.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCalendarId(c.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm",
                    calendarId === c.id ? "border-accent bg-accent-soft" : "hover:bg-bg-muted",
                  )}
                >
                  <span className={cn("size-2.5 rounded-full", DOT_CLASSES[c.color])} />
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="위치"
            className={field}
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="설명"
            rows={2}
            className={cn(field, "resize-none")}
          />
        </div>

        <div className="flex items-center justify-between border-t px-4 py-3">
          {editing ? (
            <button
              onClick={remove}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-danger hover:bg-danger/10"
            >
              <Trash2 className="size-4" /> 삭제
            </button>
          ) : <span />}
          <div className="flex gap-2">
            <button onClick={onClose} className="rounded-md border px-3 py-1.5 text-sm hover:bg-bg-muted">
              취소
            </button>
            <button
              onClick={save}
              disabled={busy}
              className="rounded-md bg-accent px-4 py-1.5 text-sm font-medium text-white hover:bg-accent-deep disabled:opacity-50"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
