import { and, asc, desc, eq, gte, isNotNull, lte } from "drizzle-orm";
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

export async function getUpcomingTodos(
  userId: string,
  hoursAhead: number = 24,
) {
  const now = new Date();
  const until = new Date(now.getTime() + hoursAhead * 3600 * 1000);
  return db
    .select({
      id: items.id,
      body: items.body,
      dueAt: items.dueAt,
    })
    .from(items)
    .where(
      and(
        eq(items.userId, userId),
        eq(items.type, "todo"),
        eq(items.completed, false),
        isNotNull(items.dueAt),
        gte(items.dueAt, now),
        lte(items.dueAt, until),
      ),
    )
    .orderBy(asc(items.dueAt))
    .limit(20);
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
