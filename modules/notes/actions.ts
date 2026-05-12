"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUserId } from "@/lib/auth/dev-session";
import { db } from "@/lib/db";
import { entities } from "@/lib/db/schema";

export async function createEmptyNote() {
  const userId = await requireUserId();
  const [created] = await db
    .insert(entities)
    .values({ userId, type: "note", body: "" })
    .returning({ id: entities.id });
  revalidatePath("/notes");
  if (created) redirect(`/notes/${created.id}`);
}

export async function updateNote(
  id: string,
  data: { title?: string | null; body?: string },
) {
  const userId = await requireUserId();
  await db
    .update(entities)
    .set({ ...data, updatedAt: new Date() })
    .where(
      and(
        eq(entities.id, id),
        eq(entities.userId, userId),
        eq(entities.type, "note"),
      ),
    );
  revalidatePath("/notes");
  revalidatePath(`/notes/${id}`);
}
