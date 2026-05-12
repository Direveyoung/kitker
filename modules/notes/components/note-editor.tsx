"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { ChevronLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LexicalEditor } from "@/components/editor/lexical-editor";
import { softDeleteEntity } from "@/modules/inbox/actions";
import { updateNote } from "../actions";
import type { Note } from "../types";

export function NoteEditor({ note }: { note: Note }) {
  const router = useRouter();
  const [title, setTitle] = useState(note.title ?? "");
  const [body, setBody] = useState(note.body ?? "");
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<Date | null>(note.updatedAt ?? null);
  const initialRef = useRef(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (initialRef.current) {
      initialRef.current = false;
      return;
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      startTransition(async () => {
        await updateNote(note.id, { title: title || null, body });
        setSavedAt(new Date());
      });
    }, 1000);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [title, body, note.id]);

  const status = pending
    ? "저장 중…"
    : savedAt
      ? `저장됨 ${savedAt.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}`
      : "";

  return (
    <div className="flex flex-1 flex-col">
      <div className="sticky top-0 z-10 flex items-center gap-1 border-b bg-background/80 px-3 py-2 backdrop-blur">
        <Link
          href="/notes"
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <ChevronLeft className="size-4" /> Notes
        </Link>
        <span className="ml-auto text-[11px] text-muted-foreground tabular-nums">
          {status}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={async () => {
            await softDeleteEntity(note.id);
            toast.success("노트를 삭제했어요");
            router.push("/notes");
          }}
          title="삭제"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col p-4 sm:p-6">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목 (비워두면 첫 줄 자동)"
          className="mb-3 border-none px-0 text-xl font-semibold shadow-none focus-visible:ring-0"
        />
        <LexicalEditor
          initialMarkdown={note.body ?? ""}
          onChange={(md) => setBody(md)}
          autoFocus
        />
      </div>
    </div>
  );
}
