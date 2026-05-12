"use server";

import { and, eq, isNull, lt, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { items } from "@/lib/db/schema";
import { parseNaturalDateTime } from "./parse-natural";

type ItemType = "inbox" | "todo" | "note";
type Recurrence = "daily" | "weekly" | "monthly";

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

function revalidateAll() {
  revalidatePath("/inbox");
  revalidatePath("/todo");
  revalidatePath("/notes");
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function addInterval(date: Date, rule: Recurrence): Date {
  const d = new Date(date);
  if (rule === "daily") d.setDate(d.getDate() + 1);
  else if (rule === "weekly") d.setDate(d.getDate() + 7);
  else if (rule === "monthly") d.setMonth(d.getMonth() + 1);
  return d;
}

export async function createItem(formData: FormData) {
  const userId = await requireUserId();
  const rawBody = String(formData.get("body") ?? "").trim();
  const rawType = String(formData.get("type") ?? "inbox");
  if (!rawBody) return;
  if (rawType !== "inbox" && rawType !== "todo" && rawType !== "note") return;

  // Todo만 자연어 시간/반복 파싱
  let body = rawBody;
  let dueAt: Date | null = null;
  let recurrence: Recurrence | null = null;
  if (rawType === "todo") {
    const parsed = parseNaturalDateTime(rawBody);
    body = parsed.cleanText || rawBody;
    dueAt = parsed.dueAt;
    recurrence = parsed.recurrence;
  }

  await db.insert(items).values({
    userId,
    type: rawType,
    body,
    dueAt,
    recurrence,
  });
  revalidateAll();
}

export async function createEmptyNote() {
  const userId = await requireUserId();
  const [created] = await db
    .insert(items)
    .values({ userId, type: "note", body: "" })
    .returning({ id: items.id });
  revalidatePath("/notes");
  if (created) redirect(`/notes/${created.id}`);
}

export async function toggleTodo(id: string) {
  const userId = await requireUserId();
  const rows = await db
    .select()
    .from(items)
    .where(and(eq(items.id, id), eq(items.userId, userId)))
    .limit(1);
  const current = rows[0];
  if (!current) return;
  const next = !current.completed;

  await db
    .update(items)
    .set({
      completed: next,
      completedAt: next ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(and(eq(items.id, id), eq(items.userId, userId)));

  // 반복 일정: 완료 시 다음 인스턴스 생성
  if (next && current.recurrence) {
    const baseDate = current.dueAt ?? new Date();
    const nextDueAt = addInterval(baseDate, current.recurrence);
    await db.insert(items).values({
      userId,
      type: "todo",
      body: current.body,
      dueAt: nextDueAt,
      recurrence: current.recurrence,
      priority: current.priority,
    });
  }

  revalidatePath("/todo");
}

export async function deleteItem(id: string) {
  const userId = await requireUserId();
  await db
    .delete(items)
    .where(and(eq(items.id, id), eq(items.userId, userId)));
  revalidateAll();
}

export async function convertItem(id: string, type: ItemType) {
  const userId = await requireUserId();
  await db
    .update(items)
    .set({ type, updatedAt: new Date() })
    .where(and(eq(items.id, id), eq(items.userId, userId)));
  revalidateAll();
}

export async function updateNote(
  id: string,
  data: { title?: string | null; body?: string },
) {
  const userId = await requireUserId();
  await db
    .update(items)
    .set({ ...data, updatedAt: new Date() })
    .where(
      and(
        eq(items.id, id),
        eq(items.userId, userId),
        eq(items.type, "note"),
      ),
    );
  revalidatePath("/notes");
  revalidatePath(`/notes/${id}`);
}

export async function setPriority(id: string, priority: number) {
  const userId = await requireUserId();
  if (![1, 2, 3, 4].includes(priority)) return;
  await db
    .update(items)
    .set({ priority, updatedAt: new Date() })
    .where(and(eq(items.id, id), eq(items.userId, userId)));
  revalidatePath("/todo");
}

export async function setDueAt(id: string, dueAt: string | null) {
  const userId = await requireUserId();
  const at = dueAt ? new Date(dueAt) : null;
  if (dueAt && Number.isNaN(at?.getTime())) return;
  await db
    .update(items)
    .set({ dueAt: at, updatedAt: new Date() })
    .where(and(eq(items.id, id), eq(items.userId, userId)));
  revalidatePath("/todo");
}

export async function setRecurrence(
  id: string,
  recurrence: Recurrence | null,
) {
  const userId = await requireUserId();
  if (recurrence && !["daily", "weekly", "monthly"].includes(recurrence)) return;
  await db
    .update(items)
    .set({ recurrence, updatedAt: new Date() })
    .where(and(eq(items.id, id), eq(items.userId, userId)));
  revalidatePath("/todo");
}

// 자정 자동 carry-over: Todo 페이지 진입 시 idempotent하게 호출.
// 마지막 carry-over가 오늘 자정 이전이면(또는 한 번도 없음) carry_over_count++.
export async function carryOverTodos() {
  const userId = await requireUserId();
  const todayStart = startOfToday();
  await db
    .update(items)
    .set({
      carryOverCount: sql`${items.carryOverCount} + 1`,
      lastCarryOverAt: new Date(),
    })
    .where(
      and(
        eq(items.userId, userId),
        eq(items.type, "todo"),
        eq(items.completed, false),
        lt(items.createdAt, todayStart),
        or(
          isNull(items.lastCarryOverAt),
          lt(items.lastCarryOverAt, todayStart),
        ),
      ),
    );
}
