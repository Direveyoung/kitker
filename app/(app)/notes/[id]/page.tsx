import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { NoteEditor } from "@/components/notes/note-editor";
import { getNote } from "@/lib/items/queries";

export default async function NotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const note = await getNote(session.user.id, id);
  if (!note) notFound();

  return (
    <NoteEditor
      note={{
        id: note.id,
        title: note.title,
        body: note.body,
        updatedAt: note.updatedAt,
      }}
    />
  );
}
