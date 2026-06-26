"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, BellRing } from "lucide-react";
import { cn } from "@/lib/utils";

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

type State = "unsupported" | "default" | "granted" | "denied" | "busy";

export function PushToggle() {
  const [state, setState] = useState<State>("default");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }
    setState(Notification.permission as State);
  }, []);

  async function enable() {
    setState("busy");
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setState(perm as State);
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!key) {
        alert("서버에 VAPID 키가 설정되지 않았어요.");
        setState("default");
        return;
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key) as unknown as BufferSource,
      });
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(sub),
      });
      if (!res.ok) throw new Error("구독 저장 실패");
      // 바로 테스트 알림
      await fetch("/api/push/test", { method: "POST" });
      setState("granted");
    } catch (e) {
      console.error(e);
      alert("알림 켜기 실패: " + String(e));
      setState("default");
    }
  }

  async function test() {
    await fetch("/api/push/test", { method: "POST" });
  }

  if (state === "unsupported") return null;

  if (state === "granted") {
    return (
      <button
        type="button"
        onClick={test}
        title="알림 테스트 보내기 (켜짐)"
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs text-success transition-colors hover:bg-bg-muted"
      >
        <BellRing className="size-3.5" />
        알림 켜짐
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={enable}
      disabled={state === "busy" || state === "denied"}
      title={state === "denied" ? "브라우저 설정에서 알림 권한을 허용해주세요" : "알림 켜기"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs transition-colors hover:bg-bg-muted disabled:opacity-50",
        state === "denied" ? "text-text-tertiary" : "text-text-secondary",
      )}
    >
      {state === "denied" ? <BellOff className="size-3.5" /> : <Bell className="size-3.5" />}
      {state === "busy" ? "설정 중…" : state === "denied" ? "알림 차단됨" : "알림 켜기"}
    </button>
  );
}
