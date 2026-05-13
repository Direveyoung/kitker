"use client";

import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function QuickInput({
  name = "body",
  placeholder,
  autoFocus,
  className,
}: {
  name?: string;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const items = Array.from(e.clipboardData?.items ?? []);
    const imageItem = items.find((it) => it.type.startsWith("image/"));
    if (!imageItem) return; // 텍스트(URL 포함)는 native paste로 그대로
    e.preventDefault();
    const file = imageItem.getAsFile();
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      const { url } = await res.json();
      insertAtCursor(ref.current, ` ${url} `);
      toast.success("이미지 업로드 완료");
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error && err.message.includes("BLOB")
          ? "Vercel Blob 셋업 필요"
          : "이미지 업로드 실패",
      );
    } finally {
      setUploading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enter → submit, Shift+Enter → 줄바꿈
    if (e.key === "Enter" && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
      const form = e.currentTarget.form;
      if (form) {
        e.preventDefault();
        form.requestSubmit();
      }
    }
  }

  function autoGrow(e: React.FormEvent<HTMLTextAreaElement>) {
    const el = e.currentTarget;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  return (
    <div className="relative w-full">
      <textarea
        ref={ref}
        name={name}
        placeholder={placeholder}
        rows={1}
        onPaste={handlePaste}
        onKeyDown={handleKey}
        onInput={autoGrow}
        autoFocus={autoFocus}
        autoComplete="off"
        required
        className={cn(
          "w-full resize-none rounded-md border bg-background px-3 py-2.5 text-base leading-snug outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
          className,
        )}
      />
      {uploading && (
        <span className="pointer-events-none absolute right-2 top-2 inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
          <Loader2 className="size-3 animate-spin" />
          업로드 중…
        </span>
      )}
    </div>
  );
}

function insertAtCursor(el: HTMLTextAreaElement | null, text: string) {
  if (!el) return;
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const before = el.value.slice(0, start);
  const after = el.value.slice(end);
  el.value = before + text + after;
  const pos = start + text.length;
  el.setSelectionRange(pos, pos);
  el.focus();
  // autoGrow 트리거
  el.dispatchEvent(new Event("input", { bubbles: true }));
}
