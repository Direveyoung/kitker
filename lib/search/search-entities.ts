"use server";

import { and, desc, eq, isNull, or, sql } from "drizzle-orm";
import { requireUserId } from "@/lib/auth/dev-session";
import { db } from "@/lib/db";
import { entities } from "@/lib/db/schema";

export type SearchHit = {
  id: string;
  type: string;
  title: string | null;
  body: string;
  updatedAt: Date;
};

export async function searchEntities(query: string): Promise<SearchHit[]> {
  const userId = await requireUserId();
  const q = query.trim();
  if (!q) return [];
  const pattern = `%${q}%`;

  const rows = await db
    .select({
      id: entities.id,
      type: entities.type,
      title: entities.title,
      body: entities.body,
      updatedAt: entities.updatedAt,
    })
    .from(entities)
    .where(
      and(
        eq(entities.userId, userId),
        isNull(entities.deletedAt),
        or(
          sql`${entities.body} ILIKE ${pattern}`,
          sql`${entities.title} ILIKE ${pattern}`,
        ),
      ),
    )
    .orderBy(desc(entities.updatedAt))
    .limit(30);

  return rows.map((r) => ({ ...r, body: r.body ?? "" }));
}
