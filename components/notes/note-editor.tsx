"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteItem, updateNote } from "@/lib/items/actions";

type Note = {
  id: string;
  title: string | null;
  body: string;
  updatedAt: Date | null;
};

export function NoteEditor({ note }: { note: Note }) {
  const router = useRouter();
  const [title, setTitle] = useState(note.title ?? "");
  const [body, setBody] = useState(note.body ?? "");
  const [, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<Date | null>(note.updatedAt ?? null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
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

  return (
    <div className="flex flex-1 flex-col p-4 sm:p-6 max-w-3xl mx-auto w-full">
      <div className="mb-2 flex items-center gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목 (비워두면 첫 줄 자동)"
          className="border-none px-0 text-xl font-bold shadow-none focus-visible:ring-0"
        />
        <span className="text-[11px] text-muted-foreground">
          {savedAt ? `저장됨 ${savedAt.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}` : ""}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={async () => {
            await deleteItem(note.id);
            router.push("/notes");
          }}
          title="삭제"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="자유롭게 적기..."
        className="min-h-[60vh] flex-1 w-full resize-none border-none bg-transparent text-sm leading-relaxed outline-none placeholder:text-muted-foreground"
        autoFocus
      />
    </div>
  );
}
