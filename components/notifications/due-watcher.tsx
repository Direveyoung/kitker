"use client";

import { useEffect } from "react";
import { toast } from "sonner";

type UpcomingTodo = {
  id: string;
  body: string;
  dueAt: Date | string | null;
};

export function DueWatcher({ upcoming }: { upcoming: UpcomingTodo[] }) {
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (const item of upcoming) {
      if (!item.dueAt) continue;
      const ms = new Date(item.dueAt).getTime() - Date.now();
      if (ms <= 0 || ms > 24 * 3600 * 1000) continue;
      timers.push(
        setTimeout(() => {
          toast(`⏰ ${item.body || "(제목 없음)"}`, {
            description: "마감 시간이에요",
            duration: 8000,
          });
          if (
            typeof Notification !== "undefined" &&
            Notification.permission === "granted"
          ) {
            try {
              new Notification("⏰ 마감 시간", {
                body: item.body || "(제목 없음)",
              });
            } catch {}
          }
        }, ms),
      );
    }
    return () => {
      for (const t of timers) clearTimeout(t);
    };
  }, [upcoming]);

  // 첫 진입 시 브라우저 알림 권한 요청 (한 번만 시도)
  useEffect(() => {
    if (
      typeof Notification === "undefined" ||
      Notification.permission !== "default"
    )
      return;
    void Notification.requestPermission();
  }, []);

  return null;
}
