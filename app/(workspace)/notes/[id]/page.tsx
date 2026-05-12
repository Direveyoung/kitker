import { notFound } from "next/navigation";
import { requireUserId } from "@/lib/auth/dev-session";
import { NoteEditor } from "@/modules/notes/components/note-editor";
import { getNote } from "@/modules/notes/queries";

export default async function NotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = await requireUserId();
  const { id } = await params;
  const note = await getNote(userId, id);
  if (!note) notFound();
  return <NoteEditor note={note} />;
}
