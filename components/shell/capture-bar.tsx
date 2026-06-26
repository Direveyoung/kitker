"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, CheckSquare, FileText, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { parseCapture, toPayload, type CaptureType } from "@/lib/capture/parse";
import { createPage } from "@/lib/pages/actions";
import { createTodo } from "@/lib/today/actions";
import { createEvent } from "@/lib/calendar/actions";

const TYPES: { key: CaptureType; label: string; icon: React.ReactNode }[] = [
  { key: "memo", label: "메모", icon: <FileText className="size-3.5" /> },
  { key: "todo", label: "할 일", icon: <CheckSquare className="size-3.5" /> },
  { key: "event", label: "일정", icon: <CalendarClock className="size-3.5" /> },
];

export function CaptureBar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [override, setOverride] = useState<CaptureType | null>(null);
  const [pending, start] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("kitker:open-capture", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("kitker:open-capture", onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setValue("");
      setOverride(null);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const parsed = useMemo(() => parseCapture(value), [value]);
  const type = override ?? parsed.type;

  function submit() {
    const title = parsed.title;
    if (!value.trim()) return;
    setOpen(false);
    const p = toPayload({ ...parsed, type });
    start(async () => {
      if (p.kind === "memo") {
        const { id } = await createPage({ title });
        router.push(`/pages/${id}`);
      } else if (p.kind === "todo") {
        await createTodo({ title, dueAt: p.dueAt });
      } else {
        await createEvent({
          calendarId: null,
          title,
          startsAt: p.startsAt,
          endsAt: p.endsAt,
          allDay: p.allDay,
        });
      }
      router.refresh();
    });
  }

  if (!open) return null;

  const preview = describe(type, parsed);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 pt-[18vh]"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-xl border border-border bg-bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Sparkles className="size-4 text-accent" />
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="빠른 캡처… 예) 내일 오후 3시 클라이언트 미팅"
            disabled={pending}
            className="flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-tertiary"
          />
        </div>

        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-1">
            {TYPES.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setOverride(t.key)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
                  type === t.key
                    ? "border-accent bg-accent-soft text-accent-deep"
                    : "border-border text-text-secondary hover:bg-bg-muted",
                )}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
          <span className="truncate text-xs text-text-tertiary">{preview}</span>
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-2">
          <span className="text-xs text-text-tertiary">
            {value.trim() ? `“${parsed.title}”` : "내용을 입력하세요"}
          </span>
          <button
            type="button"
            onClick={submit}
            disabled={!value.trim() || pending}
            className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-deep disabled:opacity-50"
          >
            추가 ↵
          </button>
        </div>
      </div>
    </div>
  );
}

function describe(type: CaptureType, p: ReturnType<typeof parseCapture>): string {
  if (type === "memo") return "메모로 저장";
  const when = p.date
    ? p.time
      ? `${format(p.date, "M/d")} ${String(p.time.h).padStart(2, "0")}:${String(p.time.m).padStart(2, "0")}`
      : format(p.date, "M/d")
    : null;
  if (type === "event") return when ? `일정 · ${when}` : "일정 · 시간 미지정";
  return when ? `할 일 · 마감 ${when}` : "할 일 · 마감 없음";
}
