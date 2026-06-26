"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileUp, Upload } from "lucide-react";
import { importMarkdown } from "@/lib/import/actions";

export function ImportDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onOpen() {
      setOpen(true);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("kitker:open-import", onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("kitker:open-import", onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (open) setText("");
  }, [open]);

  function importFiles(files: FileList) {
    start(async () => {
      try {
        let firstId: string | null = null;
        for (const file of Array.from(files)) {
          const md = await file.text();
          const fallbackTitle = file.name.replace(/\.(md|markdown|txt)$/i, "");
          const { id } = await importMarkdown({ markdown: md, fallbackTitle });
          firstId ??= id;
        }
        setOpen(false);
        if (firstId) router.push(`/pages/${firstId}`);
        router.refresh();
      } catch {
        alert("가져오기에 실패했어요. 파일을 확인해 주세요.");
      }
    });
  }

  function importText() {
    if (!text.trim()) return;
    start(async () => {
      try {
        const { id } = await importMarkdown({ markdown: text });
        setOpen(false);
        router.push(`/pages/${id}`);
        router.refresh();
      } catch {
        alert("가져오기에 실패했어요.");
      }
    });
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 pt-[12vh]"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-xl border border-border bg-bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <FileUp className="size-4 text-accent" />
          <span className="text-sm font-semibold text-text-primary">마크다운 가져오기</span>
          <span className="ml-auto text-xs text-text-tertiary">노션 · 애플메모 export</span>
        </div>

        <div className="flex flex-col gap-3 p-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={pending}
            className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border py-6 text-sm text-text-secondary hover:border-accent hover:text-text-primary disabled:opacity-60"
          >
            <Upload className="size-4" />
            .md 파일 선택 (여러 개 가능)
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".md,.markdown,.txt,text/markdown"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) importFiles(e.target.files);
              e.target.value = ""; // 같은 파일 재선택 허용
            }}
          />

          <div className="flex items-center gap-2 text-xs text-text-tertiary">
            <span className="h-px flex-1 bg-border" />
            또는 붙여넣기
            <span className="h-px flex-1 bg-border" />
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={"# 제목\n\n- [ ] 할 일\n> 인용\n\n본문…"}
            rows={6}
            className="resize-none rounded-lg border border-border bg-bg-page px-3 py-2 font-mono text-sm text-text-primary outline-none placeholder:text-text-tertiary focus:border-accent"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={importText}
              disabled={!text.trim() || pending}
              className="rounded-md bg-accent px-4 py-1.5 text-sm font-medium text-white hover:bg-accent-deep disabled:opacity-50"
            >
              가져오기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
