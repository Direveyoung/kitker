"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useTransition,
} from "react";
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

const ICONS = ["📝", "📌", "💡", "✅", "📅", "📖", "✈️", "🌿", "💰", "🎯"];

type SlashItem = {
  key: string;
  label: string;
  hint: string;
  make: (id: string) => Block;
};

const SLASH: SlashItem[] = [
  { key: "text", label: "텍스트", hint: "본문", make: (id) => ({ id, type: "paragraph", text: "" }) },
  { key: "h1", label: "제목 1", hint: "큰 제목", make: (id) => ({ id, type: "heading", level: 1, text: "" }) },
  { key: "h2", label: "제목 2", hint: "중간 제목", make: (id) => ({ id, type: "heading", level: 2, text: "" }) },
  { key: "h3", label: "제목 3", hint: "작은 제목", make: (id) => ({ id, type: "heading", level: 3, text: "" }) },
  { key: "todo", label: "할 일", hint: "체크박스", make: (id) => ({ id, type: "todo", text: "", checked: false }) },
  { key: "quote", label: "인용", hint: "인용구", make: (id) => ({ id, type: "quote", text: "" }) },
  { key: "code", label: "코드", hint: "코드 블록", make: (id) => ({ id, type: "code", text: "" }) },
  { key: "divider", label: "구분선", hint: "———", make: (id) => ({ id, type: "divider" }) },
];

const uid = () => crypto.randomUUID();

export function PageEditor({ page }: { page: PageDetail }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [title, setTitle] = useState(page.title);
  const [icon, setIcon] = useState(page.icon);
  const [iconOpen, setIconOpen] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>(
    page.blocks.length ? page.blocks : [{ id: uid(), type: "paragraph", text: "" }],
  );
  const [saved, setSaved] = useState(true);

  // 포커스 요청: 다음 렌더 후 해당 블록 caret 이동
  const focusRef = useRef<{ id: string; pos: number } | null>(null);
  const elRef = useRef<Map<string, HTMLTextAreaElement>>(new Map());

  useLayoutEffect(() => {
    const req = focusRef.current;
    if (!req) return;
    focusRef.current = null;
    const el = elRef.current.get(req.id);
    if (el) {
      el.focus();
      const pos = Math.min(req.pos, el.value.length);
      el.setSelectionRange(pos, pos);
    }
  });

  /* ── autosave (blocks 1초 debounce) ── */
  useEffect(() => {
    setSaved(false);
    const t = setTimeout(() => {
      updateBlocks(page.id, blocks).then(() => setSaved(true));
    }, 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks]);

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

  const update = useCallback((id: string, patch: Partial<Block>) => {
    setBlocks((bs) => bs.map((b) => (b.id === id ? ({ ...b, ...patch } as Block) : b)));
  }, []);

  const setType = useCallback(
    (id: string, item: SlashItem) => {
      setBlocks((bs) => {
        const idx = bs.findIndex((b) => b.id === id);
        if (idx < 0) return bs;
        const next = [...bs];
        next[idx] = item.make(id);
        if (item.key === "divider") {
          const p: Block = { id: uid(), type: "paragraph", text: "" };
          next.splice(idx + 1, 0, p);
          focusRef.current = { id: p.id, pos: 0 };
        } else {
          focusRef.current = { id, pos: 0 };
        }
        return next;
      });
    },
    [],
  );

  function insertAfter(id: string, carry: string) {
    setBlocks((bs) => {
      const idx = bs.findIndex((b) => b.id === id);
      if (idx < 0) return bs;
      const cur = bs[idx];
      const nb: Block =
        cur.type === "todo"
          ? { id: uid(), type: "todo", text: carry, checked: false }
          : { id: uid(), type: "paragraph", text: carry };
      const next = [...bs];
      next.splice(idx + 1, 0, nb);
      focusRef.current = { id: nb.id, pos: 0 };
      return next;
    });
  }

  function removeMerge(id: string) {
    setBlocks((bs) => {
      const idx = bs.findIndex((b) => b.id === id);
      if (idx <= 0) return bs; // 첫 블록은 삭제 안 함
      const prev = bs[idx - 1];
      const cur = bs[idx];
      const next = [...bs];
      if (prev.type === "divider") {
        next.splice(idx - 1, 1); // 위 구분선 제거
        focusRef.current = { id: cur.id, pos: 0 };
        return next;
      }
      const prevText = "text" in prev ? prev.text : "";
      const curText = "text" in cur ? cur.text : "";
      next[idx - 1] = { ...prev, text: prevText + curText } as Block;
      next.splice(idx, 1);
      focusRef.current = { id: prev.id, pos: prevText.length };
      return next;
    });
  }

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

      {/* 블록들 */}
      <div className="mt-6 flex flex-col gap-1">
        {blocks.map((b) => (
          <BlockRow
            key={b.id}
            block={b}
            registerEl={(el) => {
              if (el) elRef.current.set(b.id, el);
              else elRef.current.delete(b.id);
            }}
            onChange={(patch) => update(b.id, patch)}
            onEnter={(carry) => insertAfter(b.id, carry)}
            onBackspaceEmpty={() => removeMerge(b.id)}
            onSlash={(item) => setType(b.id, item)}
          />
        ))}
      </div>
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

/* ── 블록 한 줄 ─────────────────────────────────── */
function BlockRow({
  block,
  registerEl,
  onChange,
  onEnter,
  onBackspaceEmpty,
  onSlash,
}: {
  block: Block;
  registerEl: (el: HTMLTextAreaElement | null) => void;
  onChange: (patch: Partial<Block>) => void;
  onEnter: (carry: string) => void;
  onBackspaceEmpty: () => void;
  onSlash: (item: SlashItem) => void;
}) {
  const [menu, setMenu] = useState<{ query: string } | null>(null);
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  const autosize = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useLayoutEffect(() => {
    autosize(taRef.current);
  });

  if (block.type === "divider") {
    return <hr className="my-2 border-border-strong" />;
  }

  const text = block.text;

  function handleChange(v: string) {
    if (v.startsWith("/") && !v.includes("\n")) {
      setMenu({ query: v.slice(1).toLowerCase() });
    } else {
      setMenu(null);
    }
    onChange({ text: v } as Partial<Block>);
  }

  const filtered = menu
    ? SLASH.filter(
        (s) => s.label.includes(menu.query) || s.key.includes(menu.query),
      )
    : [];

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (menu && filtered.length) {
      if (e.key === "Enter") {
        e.preventDefault();
        onSlash(filtered[0]);
        setMenu(null);
        return;
      }
      if (e.key === "Escape") {
        setMenu(null);
        return;
      }
    }
    const el = e.currentTarget;
    if (e.key === "Enter" && !e.shiftKey && block.type !== "code") {
      e.preventDefault();
      const pos = el.selectionStart;
      const before = text.slice(0, pos);
      const after = text.slice(pos);
      onChange({ text: before } as Partial<Block>);
      onEnter(after);
      return;
    }
    if (e.key === "Backspace" && el.selectionStart === 0 && el.selectionEnd === 0) {
      e.preventDefault();
      onBackspaceEmpty();
    }
  }

  const base =
    "w-full resize-none bg-transparent outline-none placeholder:text-text-tertiary";
  const cls =
    block.type === "heading"
      ? block.level === 1
        ? "text-2xl font-bold"
        : block.level === 2
          ? "text-xl font-semibold"
          : "text-lg font-semibold"
      : block.type === "quote"
        ? "border-l-2 border-accent pl-3 italic text-text-secondary"
        : block.type === "code"
          ? "rounded-md bg-bg-muted px-3 py-2 font-mono text-sm"
          : "text-text-primary";

  const placeholder =
    block.type === "heading"
      ? "제목"
      : block.type === "todo"
        ? "할 일"
        : block.type === "code"
          ? "코드"
          : "'/' 입력해 블록 추가, 텍스트 작성…";

  return (
    <div className="relative flex items-start gap-2">
      {block.type === "todo" && (
        <input
          type="checkbox"
          checked={block.checked}
          onChange={(e) => onChange({ checked: e.target.checked } as Partial<Block>)}
          className="mt-1.5 size-4 shrink-0 accent-[var(--accent)]"
        />
      )}
      <textarea
        ref={(el) => {
          taRef.current = el;
          registerEl(el);
        }}
        value={text}
        rows={1}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKey}
        placeholder={placeholder}
        className={cn(
          base,
          cls,
          block.type === "todo" && block.checked && "text-text-tertiary line-through",
        )}
      />

      {menu && filtered.length > 0 && (
        <div className="absolute left-6 top-7 z-20 w-48 overflow-hidden rounded-lg border border-border bg-bg-surface py-1 shadow-lg">
          {filtered.map((s, i) => (
            <button
              key={s.key}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onSlash(s);
                setMenu(null);
              }}
              className={cn(
                "flex w-full items-center justify-between px-3 py-1.5 text-left text-sm hover:bg-bg-muted",
                i === 0 && "bg-bg-muted/50",
              )}
            >
              <span className="text-text-primary">{s.label}</span>
              <span className="text-xs text-text-tertiary">{s.hint}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
