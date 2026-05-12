"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { items } from "@/lib/db/schema";

type ItemType = "inbox" | "todo" | "note";

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

export async function createItem(formData: FormData) {
  const userId = await requireUserId();
  const body = String(formData.get("body") ?? "").trim();
  const rawType = String(formData.get("type") ?? "inbox");
  if (!body) return;
  if (rawType !== "inbox" && rawType !== "todo" && rawType !== "note") return;
  await db.insert(items).values({ userId, type: rawType, body });
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
    .select({ completed: items.completed })
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

export async function setPriority(id: string, priority: number) {
  const userId = await requireUserId();
  if (![1, 2, 3, 4].includes(priority)) return;
  await db
    .update(items)
    .set({ priority, updatedAt: new Date() })
    .where(and(eq(items.id, id), eq(items.userId, userId)));
  revalidatePath("/todo");
}

export async function setDueDate(id: string, due: string | null) {
  const userId = await requireUserId();
  const dueDate = due && /^\d{4}-\d{2}-\d{2}$/.test(due) ? due : null;
  await db
    .update(items)
    .set({ dueDate, updatedAt: new Date() })
    .where(and(eq(items.id, id), eq(items.userId, userId)));
  revalidatePath("/todo");
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
