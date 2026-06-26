import { requireUserId } from "@/lib/auth/dev-session";
import { getEvents } from "@/lib/calendar/queries";
import { getTodos } from "@/lib/today/queries";
import { TodayView } from "@/components/today/today-view";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const userId = await requireUserId();
  const [events, todos] = await Promise.all([getEvents(userId), getTodos(userId)]);
  return <TodayView events={events} todos={todos} />;
}
