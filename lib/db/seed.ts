import { randomUUID } from "node:crypto";
import { db, schema } from "./index";

const USER_ID =
  process.env.KITKER_DEV_USER_ID || "00000000-0000-0000-0000-000000000001";

function at(dayOffset: number, h: number, m = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}
function dateKey(dayOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  // 로컬 기준 YYYY-MM-DD (UTC slice 쓰면 +8/+9 TZ 새벽 실행 시 하루 밀림)
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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

  // 할 일 (Today 글로벌 뷰용)
  const todos = [
    { title: "디자인 리뷰 피드백 정리", dueAt: dateKey(0), todoDone: false },
    { title: "클라이언트 인보이스 발송", dueAt: dateKey(0), todoDone: true },
    { title: "분기 리포트 초안", dueAt: dateKey(-1), todoDone: false }, // 지난 마감
    { title: "항공권 좌석 지정", dueAt: dateKey(2), todoDone: false },
    { title: "독서 노트 옮기기", dueAt: null, todoDone: false }, // 마감 없음
  ];
  for (const t of todos) {
    await db.insert(schema.pages).values({
      id: randomUUID(), userId: USER_ID, calendarId: todo, hasTodo: true,
      blocks: [], tags: [], createdAt: now, updatedAt: now, ...t,
    });
  }

  console.log(
    `✅ seed 완료: 캘린더 ${cals.length}, 일정 ${events.length}, 할일 ${todos.length}`,
  );
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
