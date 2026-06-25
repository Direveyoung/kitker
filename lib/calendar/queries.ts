import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import type { CalendarDTO, CalendarEvent, PetalColor } from "./types";

const COLORS: PetalColor[] = ["yellow", "pink", "purple", "blue"];
function color(c: string | null | undefined): PetalColor {
  return (COLORS as string[]).includes(c ?? "") ? (c as PetalColor) : "purple";
}

export async function getCalendars(userId: string): Promise<CalendarDTO[]> {
  const rows = await db
    .select()
    .from(schema.calendars)
    .where(eq(schema.calendars.userId, userId));
  return rows
    .map((r) => ({
      id: r.id,
      name: r.name,
      color: color(r.color),
      orderIndex: r.orderIndex,
    }))
    .sort((a, b) => a.orderIndex - b.orderIndex);
}

export async function getEvents(userId: string): Promise<CalendarEvent[]> {
  const cals = await getCalendars(userId);
  const colorById = new Map(cals.map((c) => [c.id, c.color]));

  const rows = await db
    .select()
    .from(schema.pages)
    .where(
      and(
        eq(schema.pages.userId, userId),
        eq(schema.pages.hasSchedule, true),
        isNull(schema.pages.deletedAt),
      ),
    );

  return rows
    .filter((r) => r.startsAt)
    .map((r) => ({
      id: r.id,
      calendarId: r.calendarId,
      title: r.title,
      startsAt: r.startsAt as string,
      endsAt: r.endsAt,
      allDay: r.allDay,
      location: r.location,
      description: r.description,
      color: r.calendarId ? colorById.get(r.calendarId) ?? "purple" : "purple",
    }));
}
