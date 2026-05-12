import "server-only";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { entities } from "@/lib/db/schema";
import type { InboxItem } from "./types";

export async function getInboxItems(userId: string): Promise<InboxItem[]> {
  const rows = await db
    .select({
      id: entities.id,
      body: entities.body,
      tags: entities.tags,
      createdAt: entities.createdAt,
      updatedAt: entities.updatedAt,
    })
    .from(entities)
    .where(
      and(
        eq(entities.userId, userId),
        eq(entities.type, "inbox"),
        isNull(entities.deletedAt),
      ),
    )
    .orderBy(desc(entities.createdAt));
  return rows.map((r) => ({ ...r, body: r.body ?? "" }));
}
