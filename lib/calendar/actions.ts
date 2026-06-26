"use server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireUserId } from "@/lib/auth/dev-session";
import type { EventInput } from "./types";

export async function createEvent(input: EventInput) {
  const userId = await requireUserId();
  const now = new Date().toISOString();
  const id = randomUUID();
  await db.insert(schema.pages).values({
    id,
    userId,
    calendarId: input.calendarId,
    title: input.title || "제목 없음",
    hasSchedule: true,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    allDay: input.allDay,
    location: input.location ?? null,
    description: input.description ?? null,
    blocks: [],
    tags: [],
    createdAt: now,
    updatedAt: now,
  });
  revalidatePath("/calendar");
  revalidatePath("/today");
  return { id };
}

export async function updateEvent(input: EventInput) {
  const userId = await requireUserId();
  if (!input.id) throw new Error("id 필요");
  await db
    .update(schema.pages)
    .set({
      calendarId: input.calendarId,
      title: input.title || "제목 없음",
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      allDay: input.allDay,
      location: input.location ?? null,
      description: input.description ?? null,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(schema.pages.id, input.id));
  void userId;
  revalidatePath("/calendar");
  revalidatePath("/today");
  return { id: input.id };
}

export async function deleteEvent(id: string) {
  await requireUserId();
  await db
    .update(schema.pages)
    .set({ deletedAt: new Date().toISOString() })
    .where(eq(schema.pages.id, id));
  revalidatePath("/calendar");
  revalidatePath("/today");
  return { ok: true };
}
