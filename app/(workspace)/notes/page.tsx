import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUserId } from "@/lib/auth/dev-session";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/items/grouping";
import { createEmptyNote } from "@/modules/notes/actions";
import { getNotes } from "@/modules/notes/queries";

export default async function NotesPage() {
  const userId = await requireUserId();
  const notes = await getNotes(userId);

  return (
    <section className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/80 px-4 py-4 backdrop-blur sm:px-6">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between">
          <div className="flex items-baseline gap-3">
            <h1 className="text-xl font-semibold tracking-tight">💭 Notes</h1>
            <span className="text-xs text-muted-foreground">
              ({notes.length})
            </span>
          </div>
          <form action={createEmptyNote}>
            <Button type="submit" size="lg" className="gap-1">
              <Plus className="size-4" />새 노트
            </Button>
          </form>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl flex-1 overflow-auto p-4 sm:p-6">
        {notes.length === 0 ? (
          <div className="mt-16 space-y-2 text-center">
            <p className="text-3xl">💭</p>
            <p className="text-sm font-medium">노트가 없어요</p>
            <p className="text-xs text-muted-foreground">
              우측 상단 <b>+ 새 노트</b>로 시작하세요.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {notes.map((note) => {
              const title =
                note.title ||
                note.body?.split("\n")[0]?.slice(0, 40) ||
                "(제목 없음)";
              const preview = note.body?.replace(/[#*>_`-]/g, "").slice(0, 120) ?? "";
              return (
                <li key={note.id}>
                  <Link
                    href={`/notes/${note.id}`}
                    className="block h-full rounded-lg border bg-card p-4 transition-colors hover:bg-accent/40"
                  >
                    <h3 className="truncate text-sm font-semibold">{title}</h3>
                    {preview && (
                      <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">
                        {preview}
                      </p>
                    )}
                    <time className="mt-3 block text-[10px] text-muted-foreground">
                      {formatDateTime(note.updatedAt)}
                    </time>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
