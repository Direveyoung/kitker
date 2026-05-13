"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  Calendar,
  CheckSquare,
  FileText,
  Inbox,
  Search,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { searchEntities, type SearchHit } from "@/lib/search/search-entities";
import { cn } from "@/lib/utils";

type EntityType = "inbox" | "task" | "note" | "event";

const TYPE_META: Record<EntityType, { label: string; icon: LucideIcon }> = {
  inbox: { label: "Inbox", icon: Inbox },
  task: { label: "Task", icon: CheckSquare },
  note: { label: "Note", icon: FileText },
  event: { label: "Event", icon: Calendar },
};

function hrefFor(hit: SearchHit): string {
  switch (hit.type) {
    case "note":
      return `/notes/${hit.id}`;
    case "task":
      return "/tasks";
    case "event":
      return "/calendar";
    case "inbox":
    default:
      return "/inbox";
  }
}

export function CommandBar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchHit[]>([]);
  const [pending, startTransition] = useTransition();
  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((p) => !p);
      }
    }
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("eveworks:open-search", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("eveworks:open-search", onOpen);
    };
  }, []);

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
        const rows = await searchEntities(query);
        setResults(rows);
        setSelectedIdx(0);
      });
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  const grouped = useMemo(() => {
    const map = new Map<string, SearchHit[]>();
    for (const hit of results) {
      const list = map.get(hit.type) ?? [];
      list.push(hit);
      map.set(hit.type, list);
    }
    return (["inbox", "task", "note", "event"] as const)
      .filter((t) => map.has(t))
      .map((t) => ({ type: t, items: map.get(t)! }));
  }, [results]);

  const flat = useMemo(
    () => grouped.flatMap((g) => g.items),
    [grouped],
  );

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(flat.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = flat[selectedIdx];
      if (hit) {
        router.push(hrefFor(hit));
        setOpen(false);
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl gap-0 p-0">
        <DialogTitle className="sr-only">검색</DialogTitle>
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Inbox · Tasks · Notes · Events 통합 검색"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {pending && (
            <span className="text-[11px] text-muted-foreground">검색 중…</span>
          )}
        </div>

        <div className="max-h-[60vh] overflow-auto p-2">
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
            const meta = TYPE_META[group.type as EntityType];
            const Icon = meta.icon;
            return (
              <div key={group.type} className="mb-2">
                <h3 className="mb-1 flex items-center gap-1.5 px-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  <Icon className="size-3" />
                  {meta.label}
                </h3>
                <ul>
                  {group.items.map((hit) => {
                    const idx = flat.indexOf(hit);
                    const selected = idx === selectedIdx;
                    const display =
                      hit.title || hit.body.split("\n")[0] || "(빈 항목)";
                    return (
                      <li key={hit.id}>
                        <button
                          type="button"
                          onClick={() => {
                            router.push(hrefFor(hit));
                            setOpen(false);
                          }}
                          onMouseEnter={() => setSelectedIdx(idx)}
                          className={cn(
                            "w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
                            selected
                              ? "bg-accent text-accent-foreground"
                              : "hover:bg-accent/50",
                          )}
                        >
                          <div className="truncate">{display}</div>
                          {hit.title && hit.body && (
                            <div className="truncate text-xs text-muted-foreground">
                              {hit.body.slice(0, 80)}
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
