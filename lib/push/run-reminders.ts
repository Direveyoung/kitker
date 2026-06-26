import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import webpush from "web-push";
import { and, eq, isNull } from "drizzle-orm";
import { db, schema } from "@/lib/db";

// 독립 실행 스크립트라 .env.local 수동 로드 (Next가 안 띄움)
try {
  const txt = fs.readFileSync(path.join(process.cwd(), ".env.local"), "utf8");
  for (const line of txt.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {
  /* .env.local 없으면 환경변수 그대로 사용 */
}

const USER_ID = process.env.KITKER_DEV_USER_ID || "00000000-0000-0000-0000-000000000001";
const LOOKAHEAD_MIN = Number(process.env.KITKER_REMINDER_LOOKAHEAD || 30);

type Sub = typeof schema.pushSubscriptions.$inferSelect;

function configVapid() {
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.KITKER_VAPID_PRIVATE;
  if (!pub || !priv) throw new Error("VAPID 키 미설정 (.env.local)");
  webpush.setVapidDetails(
    process.env.KITKER_VAPID_SUBJECT || "mailto:pm.younga@gmail.com",
    pub,
    priv,
  );
}

const hhmm = (iso: string) =>
  new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Seoul",
  }).format(new Date(iso));

const todayKeySeoul = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date()); // YYYY-MM-DD

async function sentAlready(pageId: string, kind: string) {
  const r = await db
    .select({ id: schema.remindersSent.id })
    .from(schema.remindersSent)
    .where(and(eq(schema.remindersSent.pageId, pageId), eq(schema.remindersSent.kind, kind)))
    .limit(1);
  return r.length > 0;
}
async function mark(pageId: string, kind: string) {
  await db.insert(schema.remindersSent).values({
    id: randomUUID(), pageId, kind, sentAt: new Date().toISOString(),
  });
}
async function push(subs: Sub[], payload: object) {
  for (const s of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        JSON.stringify(payload),
      );
    } catch (e) {
      const code = (e as { statusCode?: number })?.statusCode;
      if (code === 404 || code === 410) {
        await db.delete(schema.pushSubscriptions).where(eq(schema.pushSubscriptions.endpoint, s.endpoint));
      }
    }
  }
}

(async () => {
  configVapid();
  const subs = await db
    .select()
    .from(schema.pushSubscriptions)
    .where(eq(schema.pushSubscriptions.userId, USER_ID));
  if (subs.length === 0) {
    console.log("구독 기기 없음 — 종료");
    process.exit(0);
  }

  const now = Date.now();
  let count = 0;

  // 1) 곧 시작하는 시간 일정
  const rows = await db
    .select()
    .from(schema.pages)
    .where(and(eq(schema.pages.userId, USER_ID), eq(schema.pages.hasSchedule, true), isNull(schema.pages.deletedAt)));
  for (const p of rows) {
    if (!p.startsAt || p.allDay) continue;
    const diffMin = (new Date(p.startsAt).getTime() - now) / 60000;
    if (diffMin < 0 || diffMin > LOOKAHEAD_MIN) continue;
    if (await sentAlready(p.id, "schedule")) continue;
    await push(subs, {
      title: "곧 시작: " + p.title,
      body: hhmm(p.startsAt) + (p.location ? " · " + p.location : ""),
      url: "/calendar",
      tag: "sched-" + p.id,
    });
    await mark(p.id, "schedule");
    count++;
  }

  // 2) 오늘 마감 할일
  const todos = await db
    .select()
    .from(schema.pages)
    .where(and(eq(schema.pages.userId, USER_ID), eq(schema.pages.hasTodo, true), isNull(schema.pages.deletedAt)));
  const today = todayKeySeoul();
  for (const t of todos) {
    if (t.todoDone || !t.dueAt) continue;
    if (t.dueAt.slice(0, 10) !== today) continue;
    if (await sentAlready(t.id, "todo")) continue;
    await push(subs, {
      title: "오늘 마감: " + t.title,
      body: "오늘까지예요.",
      url: "/tasks",
      tag: "todo-" + t.id,
    });
    await mark(t.id, "todo");
    count++;
  }

  console.log(`리마인더 발송 ${count}건 (구독 ${subs.length}기기)`);
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
