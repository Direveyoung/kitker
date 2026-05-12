"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Phase 0: 우측 슬라이드인 패널 (선택된 항목 상세).
 * Phase 1에서 모듈별 detail 렌더링.
 */
export function DetailPanel({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
}) {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 right-0 z-30 w-full max-w-[400px] border-l bg-card shadow-lg transition-transform duration-200",
        open ? "translate-x-0" : "translate-x-full",
      )}
      aria-hidden={!open}
    >
      <div className="flex h-12 items-center justify-between border-b px-4">
        <h2 className="text-sm font-semibold">{title ?? "상세"}</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="닫기"
        >
          <X className="size-4" />
        </button>
      </div>
      <div className="overflow-y-auto p-4">{children}</div>
    </aside>
  );
}
