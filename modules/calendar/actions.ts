"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth/dev-session";
import { db } from "@/lib/db";
import { entities, events } from "@/lib/db/schema";

export async function createEvent(formData: FormData) {
  const userId = await requireUserId();
  const title = String(formData.get("title") ?? "").trim();
  const startsRaw = String(formData.get("startsAt") ?? "");
  const endsRaw = String(formData.get("endsAt") ?? "");
  const location = String(formData.get("location") ?? "").trim() || null;
  const isAllDay = formData.get("isAllDay") === "on";

  if (!title || !startsRaw) return;
  const startsAt = new Date(startsRaw);
  const endsAt = endsRaw
    ? new Date(endsRaw)
    : new Date(startsAt.getTime() + 60 * 60 * 1000);
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) return;

  await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(entities)
      .values({ userId, type: "event", title })
      .returning({ id: entities.id });
    if (created) {
      await tx.insert(events).values({
        entityId: created.id,
        startsAt,
        endsAt,
        location,
        isAllDay,
      });
    }
  });
  revalidatePath("/calendar");
  revalidatePath("/today");
}
