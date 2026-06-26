"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Calendar, CheckSquare, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Block, PageDetail } from "@/lib/pages/types";
import {
  deletePage,
  renamePage,
  setPageIcon,
  togglePageProperty,
  updateBlocks,
} from "@/lib/pages/actions";
import { LexicalEditor } from "./lexical-editor";

const ICONS = ["📝", "📌", "💡", "✅", "📅", "📖", "✈️", "🌿", "💰", "🎯"];

export function PageEditor({ page }: { page: PageDetail }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [title, setTitle] = useState(page.title);
  const [icon, setIcon] = useState(page.icon);
  const [iconOpen, setIconOpen] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>(page.blocks);
  const [saved, setSaved] = useState(true);

  /* ── blocks autosave (1초 debounce, 초기 렌더 1회 스킵) ── */
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setSaved(false);
    const t = setTimeout(() => {
      updateBlocks(page.id, blocks).then(() => setSaved(true));
    }, 1000);
    return () => clearTimeout(t);
  }, [blocks, page.id]);

  /* ── title autosave ── */
  const titleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function onTitle(v: string) {
    setTitle(v);
    if (titleTimer.current) clearTimeout(titleTimer.current);
    titleTimer.current = setTimeout(() => {
      renamePage(page.id, v).then(() => router.refresh());
    }, 600);
  }

  /* ── 언마운트(페이지 이동) 시 마지막 변경 flush + 타이머 정리 ── */
  const latest = useRef({ blocks, title });
  latest.current = { blocks, title };
  useEffect(() => {
    return () => {
      if (titleTimer.current) clearTimeout(titleTimer.current);
      updateBlocks(page.id, latest.current.blocks);
      renamePage(page.id, latest.current.title);
    };
  }, [page.id]);

  function onDelete() {
    if (!confirm(`"${title}" 메모를 삭제할까요? (하위 포함)`)) return;
    startTransition(async () => {
      await deletePage(page.id);
      router.push("/pages");
      router.refresh();
    });
  }

  function toggleProp(patch: { hasTodo?: boolean; hasSchedule?: boolean }) {
    startTransition(async () => {
      await togglePageProperty(page.id, patch);
      router.refresh();
    });
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-1 flex-col px-8 py-10">
      {/* 아이콘 + 제목 */}
      <div className="relative flex items-start gap-3">
        <button
          type="button"
          onClick={() => setIconOpen((v) => !v)}
          className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-md text-2xl hover:bg-bg-muted"
          title="아이콘"
        >
          {icon ?? "📄"}
        </button>
        {iconOpen && (
          <div className="absolute left-0 top-12 z-10 flex flex-wrap gap-1 rounded-lg border border-border bg-bg-surface p-2 shadow-lg">
            {ICONS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => {
                  setIcon(e);
                  setIconOpen(false);
                  setPageIcon(page.id, e).then(() => router.refresh());
                }}
                className="rounded p-1 text-xl hover:bg-bg-muted"
              >
                {e}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setIcon(null);
                setIconOpen(false);
                setPageIcon(page.id, null).then(() => router.refresh());
              }}
              className="rounded px-2 text-xs text-text-tertiary hover:bg-bg-muted"
            >
              지우기
            </button>
          </div>
        )}
        <textarea
          value={title}
          onChange={(e) => onTitle(e.target.value)}
          rows={1}
          placeholder="제목 없음"
          className="flex-1 resize-none bg-transparent pt-1 text-3xl font-bold tracking-tight text-text-primary outline-none placeholder:text-text-tertiary"
        />
      </div>

      {/* 속성 토글 + 저장 상태 */}
      <div className="mt-3 flex items-center gap-2 pl-13">
        <PropChip
          on={page.hasTodo}
          onClick={() => toggleProp({ hasTodo: !page.hasTodo })}
          icon={<CheckSquare className="size-3.5" />}
          label="할 일"
        />
        <PropChip
          on={page.hasSchedule}
          onClick={() => toggleProp({ hasSchedule: !page.hasSchedule })}
          icon={<Calendar className="size-3.5" />}
          label="일정"
        />
        <span className="ml-auto text-xs text-text-tertiary">
          {saved ? "저장됨" : "저장 중…"}
        </span>
        <button
          type="button"
          onClick={onDelete}
          title="메모 삭제"
          className="rounded p-1 text-text-tertiary hover:bg-bg-muted hover:text-danger"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      {/* 본문 — Lexical 블록 에디터 */}
      <LexicalEditor initial={page.blocks} onBlocks={setBlocks} />
    </div>
  );
}

function PropChip({
  on,
  onClick,
  icon,
  label,
}: {
  on: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
        on
          ? "border-accent bg-accent-soft text-accent-deep"
          : "border-border text-text-secondary hover:bg-bg-muted",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
