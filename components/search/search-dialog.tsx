"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { CheckSquare, FileText, Inbox, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { searchItems, type SearchResult } from "@/lib/items/search";
import { cn } from "@/lib/utils";

const TYPE_META = {
  inbox: { label: "Inbox", icon: Inbox, href: "/inbox" },
  todo: { label: "Todo", icon: CheckSquare, href: "/todo" },
  note: { label: "Notes", icon: FileText, href: "/notes" },
} as const;

function hrefFor(item: SearchResult) {
  if (item.type === "note") return `/notes/${item.id}`;
  return TYPE_META[item.type].href;
}

export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [pending, startTransition] = useTransition();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setSelectedIdx(0);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedIdx(0);
      return;
    }
    const timer = setTimeout(() => {
      startTransition(async () => {
        const rows = await searchItems(query);
        setResults(rows);
        setSelectedIdx(0);
      });
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  const grouped = useMemo(() => {
    const map: Record<SearchResult["type"], SearchResult[]> = {
      inbox: [],
      todo: [],
      note: [],
    };
    for (const item of results) map[item.type].push(item);
    return (["inbox", "todo", "note"] as const)
      .filter((t) => map[t].length > 0)
      .map((t) => ({ type: t, items: map[t] }));
  }, [results]);

  const flat = useMemo(() => grouped.flatMap((g) => g.items), [grouped]);

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(flat.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = flat[selectedIdx];
      if (item) {
        router.push(hrefFor(item));
        onOpenChange(false);
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl gap-0 p-0">
        <DialogTitle className="sr-only">검색</DialogTitle>
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Inbox · Todo · Notes 통합 검색"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {pending && (
            <span className="text-[11px] text-muted-foreground">검색 중…</span>
          )}
        </div>

        <div ref={listRef} className="max-h-[60vh] overflow-auto p-2">
          {query.trim() && flat.length === 0 && !pending && (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              결과가 없어요
            </p>
          )}
          {!query.trim() && (
            <p className="px-3 py-8 text-center text-xs text-muted-foreground">
              검색어를 입력하세요. ↑↓ Enter Esc
            </p>
          )}
          {grouped.map((group) => {
            const Icon = TYPE_META[group.type].icon;
            return (
              <div key={group.type} className="mb-2">
                <h3 className="mb-1 flex items-center gap-1.5 px-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  <Icon className="size-3" />
                  {TYPE_META[group.type].label}
                </h3>
                <ul>
                  {group.items.map((item) => {
                    const idx = flat.indexOf(item);
                    const selected = idx === selectedIdx;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => {
                            router.push(hrefFor(item));
                            onOpenChange(false);
                          }}
                          onMouseEnter={() => setSelectedIdx(idx)}
                          className={cn(
                            "w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
                            selected
                              ? "bg-accent text-accent-foreground"
                              : "hover:bg-accent/50",
                          )}
                        >
                          <div
                            className={cn(
                              "truncate",
                              item.type === "todo" &&
                                item.completed &&
                                "text-muted-foreground line-through",
                            )}
                          >
                            {item.title || item.body.split("\n")[0] || "(빈 항목)"}
                          </div>
                          {item.title && item.body && (
                            <div className="truncate text-xs text-muted-foreground">
                              {item.body.slice(0, 80)}
                            </div>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
