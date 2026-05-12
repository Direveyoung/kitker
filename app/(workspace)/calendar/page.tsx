import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { requireUserId } from "@/lib/auth/dev-session";
import { MonthGrid } from "@/modules/calendar/components/month-grid";
import { EventForm } from "@/modules/calendar/components/event-form";
import { getEventsInRange } from "@/modules/calendar/queries";

function parseYearMonth(input: string | undefined): {
  year: number;
  month: number;
} {
  if (input && /^\d{4}-\d{1,2}$/.test(input)) {
    const [y, m] = input.split("-").map(Number);
    return { year: y!, month: (m ?? 1) - 1 };
  }
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}

function shiftMonth(year: number, month: number, delta: number) {
  const d = new Date(year, month + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const userId = await requireUserId();
  const params = await searchParams;
  const { year, month } = parseYearMonth(params.m);

  const rangeStart = new Date(year, month, 1);
  rangeStart.setDate(rangeStart.getDate() - 7);
  const rangeEnd = new Date(year, month + 1, 0);
  rangeEnd.setDate(rangeEnd.getDate() + 7);
  const events = await getEventsInRange(userId, rangeStart, rangeEnd);

  const prev = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);
  const monthLabel = new Date(year, month, 1).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
  });

  return (
    <section className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/80 px-4 py-4 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight">
              📅 Calendar
            </h1>
            <div className="flex items-center gap-0.5">
              <Link
                href={`/calendar?m=${prev}`}
                className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label="이전 달"
              >
                <ChevronLeft className="size-4" />
              </Link>
              <span className="px-2 text-sm font-medium tabular-nums">
                {monthLabel}
              </span>
              <Link
                href={`/calendar?m=${next}`}
                className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label="다음 달"
              >
                <ChevronRight className="size-4" />
              </Link>
              <Link
                href="/calendar"
                className="ml-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                오늘
              </Link>
            </div>
          </div>
          <EventForm />
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl flex-1 overflow-auto p-4 sm:p-6">
        <MonthGrid year={year} month={month} events={events} />
      </div>
    </section>
  );
}
