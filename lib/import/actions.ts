"use server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/lib/db";
import { requireUserId } from "@/lib/auth/dev-session";
import { parseMarkdown } from "./markdown";

export async function importMarkdown(input: {
  markdown: string;
  fallbackTitle?: string;
  parentId?: string | null;
}): Promise<{ id: string }> {
  const userId = await requireUserId();
  const { title, blocks } = parseMarkdown(input.markdown);
  const now = new Date().toISOString();
  const id = randomUUID();
  await db.insert(schema.pages).values({
    id,
    userId,
    parentId: input.parentId ?? null,
    title: title || input.fallbackTitle?.trim() || "가져온 메모",
    blocks,
    tags: [],
    orderIndex: Date.now(),
    createdAt: now,
    updatedAt: now,
  });
  revalidatePath("/pages");
  return { id };
}
