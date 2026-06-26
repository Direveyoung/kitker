"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  CheckSquare,
  FilePlus,
  FileText,
  FileUp,
  Search,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createPage } from "@/lib/pages/actions";
import { searchPages, type SearchResult } from "@/lib/search/actions";

type Item = {
  key: string;
  icon: React.ReactNode;
  label: string;
  hint?: string;
  run: () => void;
};

export function CommandBar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // 열기/닫기: ⌘K + 사이드바 이벤트
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("kitker:open-search", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("kitker:open-search", onOpen);
    };
  }, []);

  // 열릴 때 초기화 + 포커스
  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // 검색 (debounce 200ms)
  useEffect(() => {
    const term = query.trim();
    if (!term) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      searchPages(term).then(setResults);
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  const navItems: Item[] = [
    { key: "today", icon: <Sun className="size-4" />, label: "Today", hint: "⌘1", run: () => go("/today") },
    { key: "calendar", icon: <Calendar className="size-4" />, label: "Calendar", hint: "⌘2", run: () => go("/calendar") },
    { key: "tasks", icon: <CheckSquare className="size-4" />, label: "Tasks", hint: "⌘3", run: () => go("/tasks") },
    { key: "pages", icon: <FileText className="size-4" />, label: "Pages", hint: "⌘4", run: () => go("/pages") },
    {
      key: "new",
      icon: <FilePlus className="size-4" />,
      label: "새 메모 만들기",
      hint: "⌘N",
      run: () => {
        setOpen(false);
        createPage({}).then(({ id }) => {
          router.push(`/pages/${id}`);
          router.refresh();
        });
      },
    },
    {
      key: "import",
      icon: <FileUp className="size-4" />,
      label: "마크다운 가져오기",
      hint: "노션·애플메모",
      run: () => {
        setOpen(false);
        window.dispatchEvent(new CustomEvent("kitker:open-import"));
      },
    },
  ];

  const searching = query.trim().length > 0;
  const items: Item[] = searching
    ? results.map((r) => ({
        key: r.id,
        icon: <span className="text-base">{r.icon ?? "📄"}</span>,
        label: r.title,
        hint: r.snippet ?? undefined,
        run: () => go(`/pages/${r.id}`),
      }))
    : navItems;

  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      items[active]?.run();
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 pt-[15vh]"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-xl border border-border bg-bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search className="size-4 text-text-tertiary" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKey}
            placeholder="메모 검색 또는 이동…"
            className="flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-tertiary"
          />
          <kbd className="rounded bg-bg-muted px-1.5 py-0.5 text-[10px] text-text-tertiary">
            esc
          </kbd>
        </div>

        <ul className="max-h-80 overflow-y-auto p-2">
          {!searching && (
            <li className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
              이동
            </li>
          )}
          {searching && items.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-text-tertiary">
              결과 없음
            </li>
          )}
          {items.map((item, i) => (
            <li key={item.key}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={item.run}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm",
                  i === active ? "bg-accent-soft text-accent-deep" : "hover:bg-bg-muted",
                )}
              >
                <span className="shrink-0 text-text-secondary">{item.icon}</span>
                <span className="min-w-0 flex-1 truncate text-text-primary">
                  {item.label}
                </span>
                {item.hint && (
                  <span className="shrink-0 truncate text-xs text-text-tertiary">
                    {item.hint}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
