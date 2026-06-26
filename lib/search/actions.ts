"use server";
import { and, desc, eq, isNull, like, or, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireUserId } from "@/lib/auth/dev-session";
import type { Block } from "@/lib/pages/types";

export type SearchResult = {
  id: string;
  title: string;
  icon: string | null;
  snippet: string | null;
  hasTodo: boolean;
  hasSchedule: boolean;
};

export async function searchPages(q: string): Promise<SearchResult[]> {
  const userId = await requireUserId();
  const term = q.trim();
  if (!term) return [];

  const pattern = `%${term}%`;
  const rows = await db
    .select()
    .from(schema.pages)
    .where(
      and(
        eq(schema.pages.userId, userId),
        isNull(schema.pages.deletedAt),
        or(
          like(schema.pages.title, pattern),
          sql`${schema.pages.blocks} like ${pattern}`,
        ),
      ),
    )
    .orderBy(desc(schema.pages.updatedAt))
    .limit(20);

  const lower = term.toLowerCase();
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    icon: r.icon,
    snippet: snippet(Array.isArray(r.blocks) ? (r.blocks as Block[]) : [], lower),
    hasTodo: r.hasTodo,
    hasSchedule: r.hasSchedule,
  }));
}

function snippet(blocks: Block[], lower: string): string | null {
  for (const b of blocks) {
    if ("text" in b && b.text) {
      const idx = b.text.toLowerCase().indexOf(lower);
      if (idx >= 0) {
        const start = Math.max(0, idx - 20);
        return (start > 0 ? "…" : "") + b.text.slice(start, start + 80).trim();
      }
    }
  }
  return null;
}
