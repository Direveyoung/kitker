import "server-only";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { entities } from "@/lib/db/schema";
import type { Note } from "./types";

const noteSelect = {
  id: entities.id,
  title: entities.title,
  body: entities.body,
  tags: entities.tags,
  createdAt: entities.createdAt,
  updatedAt: entities.updatedAt,
} as const;

function normalize(rows: { body: string | null; [k: string]: unknown }[]): Note[] {
  return rows.map((r) => ({ ...(r as object), body: r.body ?? "" })) as Note[];
}

export async function getNotes(userId: string): Promise<Note[]> {
  const rows = await db
    .select(noteSelect)
    .from(entities)
    .where(
      and(
        eq(entities.userId, userId),
        eq(entities.type, "note"),
        isNull(entities.deletedAt),
      ),
    )
    .orderBy(desc(entities.updatedAt));
  return normalize(rows);
}

export async function getNote(userId: string, id: string): Promise<Note | null> {
  const rows = await db
    .select(noteSelect)
    .from(entities)
    .where(
      and(
        eq(entities.id, id),
        eq(entities.userId, userId),
        eq(entities.type, "note"),
        isNull(entities.deletedAt),
      ),
    )
    .limit(1);
  return normalize(rows)[0] ?? null;
}
