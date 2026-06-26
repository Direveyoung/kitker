"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string; actions?: string[] };

const GREETING: Msg = {
  role: "assistant",
  content:
    "안녕하세요 영아 이사님, 클로이예요 🌿 일정·할일·메모 뭐든 말씀하세요. 예: “내일 오후 3시 클라이언트 미팅 잡아줘”, “이번 주 할 일 보여줘”.",
};

export function ChloePanel() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    function onOpen() {
      setOpen(true);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("kitker:open-chloe", onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("kitker:open-chloe", onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: next.filter((m) => m !== GREETING).map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages((m) => [...m, { role: "assistant", content: `⚠️ ${data.error ?? "오류"}` }]);
      } else {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: data.text, actions: data.actions },
        ]);
        if (data.actions?.length) router.refresh(); // 워크스페이스 반영
      }
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "⚠️ 네트워크 오류" }]);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end" onClick={() => setOpen(false)}>
      <div className="absolute inset-0 bg-black/20" />
      <aside
        onClick={(e) => e.stopPropagation()}
        className="relative flex h-full w-full max-w-md flex-col border-l border-border bg-bg-surface shadow-2xl"
      >
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-4">
          <Sparkles className="size-4 text-accent" />
          <span className="text-sm font-semibold text-text-primary">클로이</span>
          <span className="text-xs text-text-tertiary">Chloé</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="ml-auto rounded p-1 text-text-tertiary hover:bg-bg-muted hover:text-text-primary"
          >
            <X className="size-4" />
          </button>
        </header>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm",
                  m.role === "user"
                    ? "bg-accent text-white"
                    : "bg-bg-muted text-text-primary",
                )}
              >
                {m.content}
                {m.actions && m.actions.length > 0 && (
                  <ul className="mt-2 space-y-0.5 border-t border-border/50 pt-2 text-xs text-text-secondary">
                    {m.actions.map((a, j) => (
                      <li key={j}>✓ {a}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-lg bg-bg-muted px-3 py-2 text-sm text-text-tertiary">
                생각 중…
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex items-end gap-2 border-t border-border p-3"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder="클로이에게 말하기… (Enter)"
            className="max-h-32 flex-1 resize-none rounded-md border border-border bg-bg-page px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="rounded-md bg-accent p-2 text-white hover:bg-accent-deep disabled:opacity-50"
          >
            <Send className="size-4" />
          </button>
        </form>
      </aside>
    </div>
  );
}
