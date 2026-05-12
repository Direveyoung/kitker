"use server";

import { and, eq, isNull, lt, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth/dev-session";
import { db } from "@/lib/db";
import { entities, tasks } from "@/lib/db/schema";
import { parseNaturalDateTime } from "@/lib/items/parse-natural";
import type { Priority, Recurrence } from "./types";

function revalidateTaskPages() {
  revalidatePath("/tasks");
  revalidatePath("/today");
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function addInterval(date: Date, rule: NonNullable<Recurrence>): Date {
  const d = new Date(date);
  if (rule === "daily") d.setDate(d.getDate() + 1);
  else if (rule === "weekly") d.setDate(d.getDate() + 7);
  else if (rule === "monthly") d.setMonth(d.getMonth() + 1);
  return d;
}

export async function createTask(formData: FormData) {
  const userId = await requireUserId();
  const raw = String(formData.get("body") ?? "").trim();
  if (!raw) return;

  const parsed = parseNaturalDateTime(raw);
  const body = parsed.cleanText || raw;

  await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(entities)
      .values({ userId, type: "task", body })
      .returning({ id: entities.id });
    if (created) {
      await tx.insert(tasks).values({
        entityId: created.id,
        dueAt: parsed.dueAt,
        recurrence: parsed.recurrence,
      });
    }
  });
  revalidateTaskPages();
}

export async function toggleTask(id: string) {
  const userId = await requireUserId();
  const rows = await db
    .select({
      completed: tasks.completed,
      dueAt: tasks.dueAt,
      recurrence: tasks.recurrence,
      priority: tasks.priority,
      body: entities.body,
    })
    .from(tasks)
    .innerJoin(entities, eq(entities.id, tasks.entityId))
    .where(and(eq(tasks.entityId, id), eq(entities.userId, userId)))
    .limit(1);
  const current = rows[0];
  if (!current) return;
  const next = !current.completed;

  await db
    .update(tasks)
    .set({
      completed: next,
      completedAt: next ? new Date() : null,
    })
    .where(eq(tasks.entityId, id));
  await db
    .update(entities)
    .set({ updatedAt: new Date() })
    .where(eq(entities.id, id));

  // 반복 일정: 완료 시 다음 인스턴스 생성
  if (next && current.recurrence) {
    const baseDate = current.dueAt ?? new Date();
    const nextDueAt = addInterval(baseDate, current.recurrence);
    await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(entities)
        .values({
          userId,
          type: "task",
          body: current.body ?? "",
        })
        .returning({ id: entities.id });
      if (created) {
        await tx.insert(tasks).values({
          entityId: created.id,
          dueAt: nextDueAt,
          recurrence: current.recurrence,
          priority: current.priority,
        });
      }
    });
  }

  revalidateTaskPages();
}

export async function setPriority(id: string, priority: Priority) {
  const userId = await requireUserId();
  if (![1, 2, 3, 4].includes(priority)) return;
  const rows = await db
    .select({ userId: entities.userId })
    .from(entities)
    .where(eq(entities.id, id))
    .limit(1);
  if (rows[0]?.userId !== userId) return;
  await db.update(tasks).set({ priority }).where(eq(tasks.entityId, id));
  await db
    .update(entities)
    .set({ updatedAt: new Date() })
    .where(eq(entities.id, id));
  revalidateTaskPages();
}

export async function setDueAt(id: string, dueAt: string | null) {
  const userId = await requireUserId();
  const at = dueAt ? new Date(dueAt) : null;
  if (dueAt && Number.isNaN(at?.getTime())) return;
  const rows = await db
    .select({ userId: entities.userId })
    .from(entities)
    .where(eq(entities.id, id))
    .limit(1);
  if (rows[0]?.userId !== userId) return;
  await db.update(tasks).set({ dueAt: at }).where(eq(tasks.entityId, id));
  await db
    .update(entities)
    .set({ updatedAt: new Date() })
    .where(eq(entities.id, id));
  revalidateTaskPages();
}

export async function setRecurrence(
  id: string,
  recurrence: NonNullable<Recurrence> | null,
) {
  const userId = await requireUserId();
  if (recurrence && !["daily", "weekly", "monthly"].includes(recurrence)) return;
  const rows = await db
    .select({ userId: entities.userId })
    .from(entities)
    .where(eq(entities.id, id))
    .limit(1);
  if (rows[0]?.userId !== userId) return;
  await db.update(tasks).set({ recurrence }).where(eq(tasks.entityId, id));
  await db
    .update(entities)
    .set({ updatedAt: new Date() })
    .where(eq(entities.id, id));
  revalidateTaskPages();
}

export async function carryOverTasks() {
  const userId = await requireUserId();
  const todayStart = startOfToday();
  await db
    .update(tasks)
    .set({
      carryOverCount: sql`${tasks.carryOverCount} + 1`,
      lastCarryOverAt: new Date(),
    })
    .where(
      and(
        sql`EXISTS (
          SELECT 1 FROM entities
          WHERE entities.id = ${tasks.entityId}
            AND entities.user_id = ${userId}
            AND entities.type = 'task'
            AND entities.deleted_at IS NULL
        )`,
        eq(tasks.completed, false),
        or(isNull(tasks.lastCarryOverAt), lt(tasks.lastCarryOverAt, todayStart)),
        sql`EXISTS (
          SELECT 1 FROM entities
          WHERE entities.id = ${tasks.entityId}
            AND entities.created_at < ${todayStart}
        )`,
      ),
    );
}
