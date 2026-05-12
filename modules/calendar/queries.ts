import "server-only";
import { and, asc, eq, gte, isNull, lte, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { entities, events } from "@/lib/db/schema";
import type { CalEvent } from "./types";

export async function getEventsInRange(
  userId: string,
  rangeStart: Date,
  rangeEnd: Date,
): Promise<CalEvent[]> {
  const rows = await db
    .select({
      id: entities.id,
      title: entities.title,
      body: entities.body,
      startsAt: events.startsAt,
      endsAt: events.endsAt,
      location: events.location,
      isAllDay: events.isAllDay,
    })
    .from(entities)
    .innerJoin(events, eq(events.entityId, entities.id))
    .where(
      and(
        eq(entities.userId, userId),
        eq(entities.type, "event"),
        isNull(entities.deletedAt),
        // 범위와 겹침: starts < rangeEnd AND ends > rangeStart
        lte(events.startsAt, rangeEnd),
        gte(events.endsAt, rangeStart),
      ),
    )
    .orderBy(asc(events.startsAt));
  return rows.map((r) => ({
    ...r,
    title: r.title ?? "(제목 없음)",
    body: r.body ?? "",
  }));
}
