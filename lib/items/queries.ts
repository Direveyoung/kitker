import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { items } from "@/lib/db/schema";

export async function getInboxItems(userId: string) {
  return db
    .select()
    .from(items)
    .where(and(eq(items.userId, userId), eq(items.type, "inbox")))
    .orderBy(desc(items.createdAt));
}

export async function getTodoItems(userId: string) {
  return db
    .select()
    .from(items)
    .where(and(eq(items.userId, userId), eq(items.type, "todo")))
    .orderBy(asc(items.completed), desc(items.createdAt));
}

export async function getNotes(userId: string) {
  return db
    .select()
    .from(items)
    .where(and(eq(items.userId, userId), eq(items.type, "note")))
    .orderBy(desc(items.updatedAt));
}

export async function getNote(userId: string, id: string) {
  const rows = await db
    .select()
    .from(items)
    .where(
      and(
        eq(items.id, id),
        eq(items.userId, userId),
        eq(items.type, "note"),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}
