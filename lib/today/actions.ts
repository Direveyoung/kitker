"use server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireUserId } from "@/lib/auth/dev-session";

/** universal capture — 빠른 할 일 추가 */
export async function createTodo(input: { title: string; dueAt?: string | null }) {
  const userId = await requireUserId();
  const now = new Date().toISOString();
  const id = randomUUID();
  await db.insert(schema.pages).values({
    id,
    userId,
    title: input.title.trim() || "제목 없음",
    hasTodo: true,
    todoDone: false,
    dueAt: input.dueAt ?? null,
    blocks: [],
    tags: [],
    createdAt: now,
    updatedAt: now,
  });
  revalidatePath("/today");
  revalidatePath("/tasks");
  return { id };
}

export async function toggleTodo(id: string, done: boolean) {
  await requireUserId();
  await db
    .update(schema.pages)
    .set({ todoDone: done, updatedAt: new Date().toISOString() })
    .where(eq(schema.pages.id, id));
  revalidatePath("/today");
  revalidatePath("/tasks");
  return { ok: true };
}
