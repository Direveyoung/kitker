import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import type { Block, PageDetail, PageNode } from "./types";

type Row = typeof schema.pages.$inferSelect;

export async function getPageTree(userId: string): Promise<PageNode[]> {
  const rows = await db
    .select()
    .from(schema.pages)
    .where(and(eq(schema.pages.userId, userId), isNull(schema.pages.deletedAt)));

  const byParent = new Map<string | null, Row[]>();
  for (const r of rows) {
    const key = r.parentId ?? null;
    const arr = byParent.get(key) ?? [];
    arr.push(r);
    byParent.set(key, arr);
  }

  const build = (parentId: string | null): PageNode[] =>
    (byParent.get(parentId) ?? [])
      .sort((a, b) =>
        a.orderIndex !== b.orderIndex
          ? a.orderIndex - b.orderIndex
          : a.createdAt.localeCompare(b.createdAt),
      )
      .map((r) => ({
        id: r.id,
        title: r.title,
        icon: r.icon,
        hasTodo: r.hasTodo,
        hasSchedule: r.hasSchedule,
        children: build(r.id),
      }));

  return build(null);
}

export async function getPage(
  userId: string,
  id: string,
): Promise<PageDetail | null> {
  const rows = await db
    .select()
    .from(schema.pages)
    .where(
      and(
        eq(schema.pages.id, id),
        eq(schema.pages.userId, userId),
        isNull(schema.pages.deletedAt),
      ),
    )
    .limit(1);

  const r = rows[0];
  if (!r) return null;

  const blocks = Array.isArray(r.blocks) ? (r.blocks as Block[]) : [];
  return {
    id: r.id,
    parentId: r.parentId,
    title: r.title,
    icon: r.icon,
    blocks,
    hasTodo: r.hasTodo,
    hasSchedule: r.hasSchedule,
    updatedAt: r.updatedAt,
  };
}
