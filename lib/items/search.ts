"use server";

import { and, desc, eq, or, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { items } from "@/lib/db/schema";

export type SearchResult = {
  id: string;
  type: "inbox" | "todo" | "note";
  title: string | null;
  body: string;
  completed: boolean;
  updatedAt: Date | null;
};

export async function searchItems(query: string): Promise<SearchResult[]> {
  const session = await auth();
  if (!session?.user?.id) return [];
  const q = query.trim();
  if (!q) return [];

  const pattern = `%${q}%`;
  const rows = await db
    .select({
      id: items.id,
      type: items.type,
      title: items.title,
      body: items.body,
      completed: items.completed,
      updatedAt: items.updatedAt,
    })
    .from(items)
    .where(
      and(
        eq(items.userId, session.user.id),
        or(
          sql`${items.body} ILIKE ${pattern}`,
          sql`${items.title} ILIKE ${pattern}`,
        ),
      ),
    )
    .orderBy(desc(items.updatedAt))
    .limit(30);

  return rows as SearchResult[];
}
