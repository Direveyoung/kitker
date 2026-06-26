import { requireUserId } from "@/lib/auth/dev-session";
import { getEvents } from "@/lib/calendar/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function pad(n: number) { return String(n).padStart(2, "0"); }

function utc(iso: string): string {
  const d = new Date(iso);
  return (
    d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) +
    "T" + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + "Z"
  );
}
function dateOnly(s: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (m) return m[1] + m[2] + m[3];
  const d = new Date(s);
  return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate());
}
function plusOneDay(yyyymmdd: string): string {
  const y = +yyyymmdd.slice(0, 4), m = +yyyymmdd.slice(4, 6), d = +yyyymmdd.slice(6, 8);
  const x = new Date(y, m - 1, d + 1);
  return x.getFullYear() + pad(x.getMonth() + 1) + pad(x.getDate());
}
function esc(s: string | null): string {
  return (s ?? "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export async function GET() {
  const userId = await requireUserId();
  const events = await getEvents(userId);
  const stamp = utc(new Date().toISOString());

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//kitker//calendar//KO",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:kitker",
    "X-WR-TIMEZONE:Asia/Seoul",
  ];

  for (const e of events) {
    lines.push("BEGIN:VEVENT", `UID:${e.id}@kitker`, `DTSTAMP:${stamp}`);
    if (e.allDay) {
      const s = dateOnly(e.startsAt);
      const end = e.endsAt ? dateOnly(e.endsAt) : s;
      lines.push(`DTSTART;VALUE=DATE:${s}`, `DTEND;VALUE=DATE:${plusOneDay(end)}`);
    } else {
      lines.push(`DTSTART:${utc(e.startsAt)}`);
      lines.push(`DTEND:${utc(e.endsAt ?? e.startsAt)}`);
    }
    lines.push(`SUMMARY:${esc(e.title)}`);
    if (e.location) lines.push(`LOCATION:${esc(e.location)}`);
    if (e.description) lines.push(`DESCRIPTION:${esc(e.description)}`);
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");

  return new Response(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="kitker.ics"',
      "Cache-Control": "no-cache",
    },
  });
}
