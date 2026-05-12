"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth/dev-session";
import { db } from "@/lib/db";
import { entities, tasks } from "@/lib/db/schema";

function revalidateAll() {
  revalidatePath("/inbox");
  revalidatePath("/tasks");
  revalidatePath("/notes");
  revalidatePath("/today");
}

export async function createInboxItem(formData: FormData) {
  const userId = await requireUserId();
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;
  await db.insert(entities).values({ userId, type: "inbox", body });
  revalidatePath("/inbox");
  revalidatePath("/today");
}

export async function softDeleteEntity(id: string) {
  const userId = await requireUserId();
  const now = new Date();
  await db
    .update(entities)
    .set({ deletedAt: now, updatedAt: now })
    .where(and(eq(entities.id, id), eq(entities.userId, userId)));
  revalidateAll();
}

export async function convertInboxToTask(id: string) {
  const userId = await requireUserId();
  const updated = await db
    .update(entities)
    .set({ type: "task", updatedAt: new Date() })
    .where(and(eq(entities.id, id), eq(entities.userId, userId)))
    .returning({ id: entities.id });
  if (updated[0]) {
    await db.insert(tasks).values({ entityId: updated[0].id }).onConflictDoNothing();
  }
  revalidateAll();
}

export async function convertInboxToNote(id: string) {
  const userId = await requireUserId();
  await db
    .update(entities)
    .set({ type: "note", updatedAt: new Date() })
    .where(and(eq(entities.id, id), eq(entities.userId, userId)));
  revalidateAll();
}
