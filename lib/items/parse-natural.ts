// 한국어 + 영어 간단 자연어 → dueAt 파서
// "내일 오후 3시 회의" → { dueAt: <tomorrow 15:00>, cleanText: "회의" }
// "월요일 14시 미팅" → { dueAt: <next Monday 14:00>, cleanText: "미팅" }

type ParseResult = {
  dueAt: Date | null;
  recurrence: "daily" | "weekly" | "monthly" | null;
  cleanText: string;
};

const WEEKDAYS_KO = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

function startOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function parseNaturalDateTime(input: string): ParseResult {
  let text = input;
  let dueDay: Date | null = null;
  let hour: number | null = null;
  let minute: number = 0;
  let recurrence: ParseResult["recurrence"] = null;

  const today = startOfDay(new Date());

  // 반복 표현
  const recurMatch = text.match(/(매일|매주|매월)/);
  if (recurMatch) {
    if (recurMatch[1] === "매일") recurrence = "daily";
    else if (recurMatch[1] === "매주") recurrence = "weekly";
    else if (recurMatch[1] === "매월") recurrence = "monthly";
    text = text.replace(recurMatch[0], "").trim();
  }

  // 상대 날짜
  const relMatch = text.match(/(오늘|내일|모레|글피|다음주)/);
  if (relMatch) {
    switch (relMatch[1]) {
      case "오늘":
        dueDay = today;
        break;
      case "내일":
        dueDay = addDays(today, 1);
        break;
      case "모레":
        dueDay = addDays(today, 2);
        break;
      case "글피":
        dueDay = addDays(today, 3);
        break;
      case "다음주":
        dueDay = addDays(today, 7);
        break;
    }
    text = text.replace(relMatch[0], "").trim();
  }

  // 요일 (월요일 ~ 일요일)
  if (!dueDay) {
    const dayMatch = text.match(/(월요일|화요일|수요일|목요일|금요일|토요일|일요일)/);
    if (dayMatch) {
      const targetIdx = WEEKDAYS_KO.indexOf(dayMatch[1]);
      const todayIdx = today.getDay();
      let diff = targetIdx - todayIdx;
      if (diff <= 0) diff += 7;
      dueDay = addDays(today, diff);
      text = text.replace(dayMatch[0], "").trim();
    }
  }

  // 시간: "오전/오후 H시(M분)?", "H시(M분)?", "HH:MM"
  const timeWithAmPm = text.match(
    /(오전|오후)\s*(\d{1,2})시(?:\s*(\d{1,2})분)?/,
  );
  if (timeWithAmPm) {
    let h = parseInt(timeWithAmPm[2], 10);
    const m = timeWithAmPm[3] ? parseInt(timeWithAmPm[3], 10) : 0;
    if (timeWithAmPm[1] === "오후" && h < 12) h += 12;
    if (timeWithAmPm[1] === "오전" && h === 12) h = 0;
    hour = h;
    minute = m;
    text = text.replace(timeWithAmPm[0], "").trim();
  } else {
    const timeOnly = text.match(/(\d{1,2})시(?:\s*(\d{1,2})분)?/);
    if (timeOnly) {
      const h = parseInt(timeOnly[1], 10);
      const m = timeOnly[2] ? parseInt(timeOnly[2], 10) : 0;
      hour = h;
      minute = m;
      text = text.replace(timeOnly[0], "").trim();
    } else {
      const hhmm = text.match(/\b(\d{1,2}):(\d{2})\b/);
      if (hhmm) {
        hour = parseInt(hhmm[1], 10);
        minute = parseInt(hhmm[2], 10);
        text = text.replace(hhmm[0], "").trim();
      }
    }
  }

  let dueAt: Date | null = null;
  if (dueDay) {
    const d = new Date(dueDay);
    if (hour !== null) {
      d.setHours(hour, minute, 0, 0);
    } else {
      // 기본 마감 시각: 23:59
      d.setHours(23, 59, 0, 0);
    }
    dueAt = d;
  } else if (hour !== null) {
    // 날짜 없이 시간만 → 오늘 (또는 지났으면 내일)
    const d = new Date(today);
    d.setHours(hour, minute, 0, 0);
    if (d <= new Date()) {
      d.setDate(d.getDate() + 1);
    }
    dueAt = d;
  }

  // 정리
  text = text.replace(/\s+/g, " ").trim();
  return { dueAt, recurrence, cleanText: text || input };
}
