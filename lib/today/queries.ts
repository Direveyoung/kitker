import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export type TodoDTO = {
  id: string;
  title: string;
  done: boolean;
  dueAt: string | null; // ISO(UTC) 또는 'YYYY-MM-DD'
  priority: string | null;
};

export async function getTodos(userId: string): Promise<TodoDTO[]> {
  const rows = await db
    .select()
    .from(schema.pages)
    .where(
      and(
        eq(schema.pages.userId, userId),
        eq(schema.pages.hasTodo, true),
        isNull(schema.pages.deletedAt),
      ),
    );

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    done: r.todoDone,
    dueAt: r.dueAt,
    priority: r.priority,
  }));
}
