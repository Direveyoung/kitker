import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { createEmptyNote } from "@/lib/items/actions";
import { formatDateTime } from "@/lib/items/grouping";
import { getNotes } from "@/lib/items/queries";

export default async function NotesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const notes = await getNotes(session.user.id);

  return (
    <section className="flex flex-1 flex-col">
      <header className="border-b bg-background/60 px-4 py-4 backdrop-blur sm:px-6">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight">💭 Notes</h1>
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

      <div className="mx-auto w-full max-w-3xl flex-1 overflow-auto p-4">
        {notes.length === 0 ? (
          <p className="mt-12 text-center text-sm text-muted-foreground">
            노트가 없어요. 위 + 새 노트로 시작하세요.
          </p>
        ) : (
          <ul className="space-y-2">
            {notes.map((note) => {
              const title =
                note.title ||
                note.body?.split("\n")[0]?.slice(0, 40) ||
                "(제목 없음)";
              const preview = note.body?.slice(0, 80) ?? "";
              return (
                <li key={note.id}>
                  <Link
                    href={`/notes/${note.id}`}
                    className="block rounded-md border bg-card p-4 transition-colors hover:bg-accent"
                  >
                    <h3 className="truncate text-sm font-medium">{title}</h3>
                    {preview && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {preview}
                      </p>
                    )}
                    <time className="mt-2 block text-[10px] text-muted-foreground">
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
