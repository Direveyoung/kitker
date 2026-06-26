export type CaptureType = "memo" | "todo" | "event";

export type Parsed = {
  title: string;
  type: CaptureType;
  date: Date | null; // 로컬 자정 기준
  time: { h: number; m: number } | null;
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function atMidnight(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** 자연어 한 줄 → {제목, 타입, 날짜, 시각} */
export function parseCapture(input: string, now = new Date()): Parsed {
  let s = ` ${input} `;
  let date: Date | null = null;
  let time: { h: number; m: number } | null = null;

  const cut = (re: RegExp) => {
    const m = s.match(re);
    if (m) s = s.replace(m[0], " ");
    return m;
  };

  // ── 날짜 ──
  if (cut(/오늘/)) date = atMidnight(now);
  else if (cut(/내일/)) date = atMidnight(addDays(now, 1));
  else if (cut(/모레/)) date = atMidnight(addDays(now, 2));
  else if (cut(/글피/)) date = atMidnight(addDays(now, 3));

  if (!date) {
    const wd = cut(/(이번주|다음주)?\s*([월화수목금토일])요일/);
    if (wd) {
      const dow = now.getDay(); // 0=일
      const targetDow = WEEKDAYS.indexOf(wd[2]); // 0=일
      const offsetFromMon = (targetDow + 6) % 7; // 월=0 … 일=6
      if (wd[1] === "다음주") {
        const daysToNextMon = ((1 - dow + 7) % 7) || 7;
        date = atMidnight(addDays(now, daysToNextMon + offsetFromMon));
      } else if (wd[1] === "이번주") {
        const daysToThisMon = -((dow + 6) % 7); // 이번 주 월요일까지(음수)
        date = atMidnight(addDays(now, daysToThisMon + offsetFromMon));
      } else {
        const diff = (targetDow - dow + 7) % 7; // 다가오는 해당 요일(0=오늘)
        date = atMidnight(addDays(now, diff));
      }
    }
  }

  if (!date) {
    const md = cut(/(\d{1,2})\s*월\s*(\d{1,2})\s*일/);
    if (md) date = ymd(now.getFullYear(), +md[1] - 1, +md[2], now);
  }
  if (!date) {
    const slash = cut(/(?<!\d)(\d{1,2})[./](\d{1,2})(?!\d)/);
    if (slash) date = ymd(now.getFullYear(), +slash[1] - 1, +slash[2], now);
  }

  // ── 시각 ──
  const hm = cut(/(?<!\d)(\d{1,2}):(\d{2})(?!\d)/);
  if (hm) {
    time = { h: clamp(+hm[1], 0, 23), m: clamp(+hm[2], 0, 59) };
  } else {
    const ko = cut(/(오전|오후)?\s*(\d{1,2})\s*시\s*(반|(\d{1,2})\s*분)?/);
    if (ko) {
      let h = clamp(+ko[2], 0, 23);
      if (ko[1] === "오후" && h < 12) h += 12;
      if (ko[1] === "오전" && h === 12) h = 0;
      const m = ko[3] === "반" ? 30 : ko[4] ? clamp(+ko[4], 0, 59) : 0;
      time = { h, m };
    }
  }

  // 시각만 있고 날짜 없으면 오늘로 보정
  if (time && !date) date = atMidnight(now);

  const title = s.replace(/\s+/g, " ").trim();

  // ── 타입 추론 ──
  let type: CaptureType;
  if (time) type = "event";
  else if (date) type = "todo";
  else type = "todo";

  return { title: title || "제목 없음", type, date, time };
}

/** Parsed → 저장 페이로드 */
export function toPayload(p: Parsed) {
  const dateKey = p.date ? fmtKey(p.date) : null;
  if (p.type === "event") {
    if (p.time && p.date) {
      const start = new Date(p.date);
      start.setHours(p.time.h, p.time.m, 0, 0);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      return { kind: "event" as const, startsAt: start.toISOString(), endsAt: end.toISOString(), allDay: false };
    }
    // 시간 없는 일정 = 종일
    const key = dateKey ?? fmtKey(new Date());
    return { kind: "event" as const, startsAt: key, endsAt: null, allDay: true };
  }
  if (p.type === "todo") {
    return { kind: "todo" as const, dueAt: dateKey };
  }
  return { kind: "memo" as const };
}

/* ── helpers ── */
function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function ymd(y: number, mIdx: number, day: number, now: Date): Date {
  let d = new Date(y, mIdx, day, 0, 0, 0, 0);
  if (d.getTime() < atMidnight(now).getTime()) d = new Date(y + 1, mIdx, day);
  return d;
}
function fmtKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
