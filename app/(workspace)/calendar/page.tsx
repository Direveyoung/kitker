import { requireUserId } from "@/lib/auth/dev-session";
import { getCalendars, getEvents } from "@/lib/calendar/queries";
import { CalendarApp } from "@/components/calendar/calendar-app";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const userId = await requireUserId();
  const [calendars, events] = await Promise.all([
    getCalendars(userId),
    getEvents(userId),
  ]);

  return <CalendarApp calendars={calendars} events={events} />;
}
