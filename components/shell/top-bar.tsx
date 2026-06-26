"use client";

import { Sparkles } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function TopBar() {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b bg-bg-page/80 px-4 backdrop-blur sm:px-6">
      <div className="text-sm text-text-tertiary">
        {/* 페이지 자체 헤더가 우선. top-bar는 글로벌 정보만 */}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("kitker:open-chloe"))}
          title="클로이 (Chloé)"
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs text-text-secondary transition-colors hover:bg-bg-muted hover:text-text-primary"
        >
          <Sparkles className="size-3.5 text-accent" />
          클로이
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}
