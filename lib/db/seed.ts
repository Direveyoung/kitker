import { randomUUID } from "node:crypto";
import { db, schema } from "./index";

const USER_ID =
  process.env.EVE_DEV_USER_ID || "00000000-0000-0000-0000-000000000001";

function at(dayOffset: number, h: number, m = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}
function dateKey(dayOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  return d.toISOString().slice(0, 10);
}

async function main() {
  const now = new Date().toISOString();

  // 캘린더 3개 (이미 있으면 스킵)
  const existing = await db.select().from(schema.calendars);
  const cals = [
    { name: "개인", color: "purple", orderIndex: 0 },
    { name: "회사", color: "yellow", orderIndex: 1 },
    { name: "할일", color: "pink", orderIndex: 2 },
  ];
  const idByName = new Map<string, string>();
  for (const c of cals) {
    const found = existing.find((e) => e.name === c.name && e.userId === USER_ID);
    if (found) { idByName.set(c.name, found.id); continue; }
    const id = randomUUID();
    idByName.set(c.name, id);
    await db.insert(schema.calendars).values({ id, userId: USER_ID, createdAt: now, ...c });
  }

  const personal = idByName.get("개인")!;
  const work = idByName.get("회사")!;
  const todo = idByName.get("할일")!;

  const events = [
    { calendarId: work, title: "서울팀 주간회의", startsAt: at(0, 10), endsAt: at(0, 11), allDay: false, location: "Zoom" },
    { calendarId: personal, title: "요가 클래스", startsAt: at(0, 18), endsAt: at(0, 19), allDay: false, location: "Canggu" },
    { calendarId: work, title: "클라이언트 데모", startsAt: at(1, 14), endsAt: at(1, 15, 30), allDay: false, location: null },
    { calendarId: todo, title: "분기 리포트 마감", startsAt: dateKey(2), endsAt: null, allDay: true, location: null },
    { calendarId: personal, title: "발리 → 서울 항공", startsAt: at(3, 23, 50), endsAt: at(4, 8), allDay: false, location: "DPS" },
    { calendarId: work, title: "디자인 리뷰", startsAt: at(4, 16), endsAt: at(4, 17), allDay: false, location: null },
    { calendarId: personal, title: "주말 워케이션", startsAt: dateKey(6), endsAt: dateKey(7), allDay: true, location: "Ubud" },
  ];
  for (const e of events) {
    await db.insert(schema.pages).values({
      id: randomUUID(), userId: USER_ID, hasSchedule: true,
      blocks: [], tags: [], createdAt: now, updatedAt: now, ...e,
    });
  }
  console.log(`✅ seed 완료: 캘린더 ${cals.length}, 일정 ${events.length}`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
