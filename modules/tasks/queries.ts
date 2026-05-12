import "server-only";
import { and, asc, desc, eq, gte, isNotNull, isNull, lt, lte, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { entities, tasks } from "@/lib/db/schema";
import type { TaskItem } from "./types";

const taskSelect = {
  id: entities.id,
  title: entities.title,
  body: entities.body,
  tags: entities.tags,
  createdAt: entities.createdAt,
  updatedAt: entities.updatedAt,
  completed: tasks.completed,
  completedAt: tasks.completedAt,
  dueAt: tasks.dueAt,
  priority: tasks.priority,
  recurrence: tasks.recurrence,
  carryOverCount: tasks.carryOverCount,
} as const;

function normalize(rows: { body: string | null; [k: string]: unknown }[]): TaskItem[] {
  return rows.map((r) => ({ ...(r as object), body: r.body ?? "" })) as TaskItem[];
}

export async function getAllTasks(userId: string): Promise<TaskItem[]> {
  const rows = await db
    .select(taskSelect)
    .from(entities)
    .innerJoin(tasks, eq(tasks.entityId, entities.id))
    .where(
      and(
        eq(entities.userId, userId),
        eq(entities.type, "task"),
        isNull(entities.deletedAt),
      ),
    )
    .orderBy(asc(tasks.completed), asc(tasks.dueAt), desc(entities.createdAt));
  return normalize(rows);
}

export async function getTodayTasks(userId: string): Promise<TaskItem[]> {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // 오늘: dueAt <= 오늘 23:59 (즉 내일 자정 이전) OR carry-over 있음
  const rows = await db
    .select(taskSelect)
    .from(entities)
    .innerJoin(tasks, eq(tasks.entityId, entities.id))
    .where(
      and(
        eq(entities.userId, userId),
        eq(entities.type, "task"),
        isNull(entities.deletedAt),
        or(
          and(isNotNull(tasks.dueAt), lt(tasks.dueAt, tomorrow)),
          gte(tasks.carryOverCount, 1),
        ),
      ),
    )
    .orderBy(asc(tasks.completed), asc(tasks.dueAt), desc(tasks.priority));
  return normalize(rows);
}

export async function getUpcomingTaskAlerts(
  userId: string,
  hoursAhead = 24,
): Promise<{ id: string; body: string; dueAt: Date }[]> {
  const now = new Date();
  const until = new Date(now.getTime() + hoursAhead * 3600 * 1000);
  const rows = await db
    .select({
      id: entities.id,
      body: entities.body,
      dueAt: tasks.dueAt,
    })
    .from(entities)
    .innerJoin(tasks, eq(tasks.entityId, entities.id))
    .where(
      and(
        eq(entities.userId, userId),
        eq(entities.type, "task"),
        isNull(entities.deletedAt),
        eq(tasks.completed, false),
        isNotNull(tasks.dueAt),
        gte(tasks.dueAt, now),
        lte(tasks.dueAt, until),
      ),
    )
    .orderBy(asc(tasks.dueAt))
    .limit(20);
  return rows
    .filter((r) => r.dueAt !== null)
    .map((r) => ({ id: r.id, body: r.body ?? "", dueAt: r.dueAt as Date }));
}
