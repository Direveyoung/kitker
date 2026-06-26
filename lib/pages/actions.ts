"use server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireUserId } from "@/lib/auth/dev-session";
import type { Block } from "./types";

export async function createPage(input: {
  parentId?: string | null;
  title?: string;
}): Promise<{ id: string }> {
  const userId = await requireUserId();
  const now = new Date().toISOString();
  const id = randomUUID();
  await db.insert(schema.pages).values({
    id,
    userId,
    parentId: input.parentId ?? null,
    title: input.title ?? "제목 없음",
    blocks: [],
    tags: [],
    orderIndex: Date.now(),
    createdAt: now,
    updatedAt: now,
  });
  revalidatePath("/pages");
  return { id };
}

export async function renamePage(id: string, title: string) {
  await requireUserId();
  await db
    .update(schema.pages)
    .set({ title: title.trim() || "제목 없음", updatedAt: new Date().toISOString() })
    .where(eq(schema.pages.id, id));
  revalidatePath("/pages");
  return { ok: true };
}

export async function setPageIcon(id: string, icon: string | null) {
  await requireUserId();
  await db
    .update(schema.pages)
    .set({ icon, updatedAt: new Date().toISOString() })
    .where(eq(schema.pages.id, id));
  revalidatePath("/pages");
  return { ok: true };
}

export async function updateBlocks(id: string, blocks: Block[]) {
  await requireUserId();
  await db
    .update(schema.pages)
    .set({ blocks, updatedAt: new Date().toISOString() })
    .where(eq(schema.pages.id, id));
  return { ok: true };
}

export async function togglePageProperty(
  id: string,
  patch: { hasTodo?: boolean; hasSchedule?: boolean },
) {
  await requireUserId();
  await db
    .update(schema.pages)
    .set({ ...patch, updatedAt: new Date().toISOString() })
    .where(eq(schema.pages.id, id));
  revalidatePath("/pages");
  revalidatePath("/today");
  revalidatePath("/tasks");
  return { ok: true };
}

/** 소프트 삭제 — 자손까지 함께 */
export async function deletePage(id: string) {
  const userId = await requireUserId();
  const all = await db
    .select({ id: schema.pages.id, parentId: schema.pages.parentId })
    .from(schema.pages)
    .where(and(eq(schema.pages.userId, userId), isNull(schema.pages.deletedAt)));

  const childrenOf = new Map<string | null, string[]>();
  for (const r of all) {
    const arr = childrenOf.get(r.parentId) ?? [];
    arr.push(r.id);
    childrenOf.set(r.parentId, arr);
  }
  const toDelete: string[] = [];
  const stack = [id];
  while (stack.length) {
    const cur = stack.pop()!;
    toDelete.push(cur);
    stack.push(...(childrenOf.get(cur) ?? []));
  }

  await db
    .update(schema.pages)
    .set({ deletedAt: new Date().toISOString() })
    .where(inArray(schema.pages.id, toDelete));

  revalidatePath("/pages");
  revalidatePath("/today");
  revalidatePath("/tasks");
  return { ok: true, count: toDelete.length };
}
