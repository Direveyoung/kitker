export type WithCreatedAt = { createdAt: Date | null };

export function groupByRelativeTime<T extends WithCreatedAt>(
  items: T[],
): { label: string; items: T[] }[] {
  const now = new Date();
  const today = startOfDay(now);
  const yesterday = addDays(today, -1);

  const groups = new Map<string, T[]>();
  const order: string[] = [];

  for (const item of items) {
    const d = item.createdAt ?? now;
    const label = relativeLabel(d, now, today, yesterday);
    if (!groups.has(label)) {
      groups.set(label, []);
      order.push(label);
    }
    groups.get(label)!.push(item);
  }

  return order.map((label) => ({ label, items: groups.get(label)! }));
}

function relativeLabel(d: Date, now: Date, today: Date, yesterday: Date) {
  const diffMin = (now.getTime() - d.getTime()) / 60000;
  if (diffMin < 5) return "방금 전";
  if (diffMin < 60) return "한 시간 이내";
  if (d >= today) return "오늘";
  if (d >= yesterday) return "어제";
  const days = Math.floor((today.getTime() - d.getTime()) / 86400000);
  return `${days}일 전`;
}

function startOfDay(d: Date) {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

function addDays(d: Date, days: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + days);
  return r;
}

export function formatDateTime(d: Date | null): string {
  if (!d) return "";
  const now = new Date();
  const diffMin = (now.getTime() - d.getTime()) / 60000;
  if (diffMin < 1) return "방금";
  if (diffMin < 60) return `${Math.floor(diffMin)}분 전`;
  if (diffMin < 60 * 24) return `${Math.floor(diffMin / 60)}시간 전`;
  const diffDay = Math.floor(diffMin / (60 * 24));
  if (diffDay < 7) return `${diffDay}일 전`;
  return d.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}
