import "server-only";
import { randomUUID } from "node:crypto";
import webpush from "web-push";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";

let configured = false;
function ensureVapid() {
  if (configured) return;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.KITKER_VAPID_PRIVATE;
  const subject = process.env.KITKER_VAPID_SUBJECT || "mailto:pm.younga@gmail.com";
  if (!pub || !priv) throw new Error("VAPID 키 미설정 (.env.local)");
  webpush.setVapidDetails(subject, pub, priv);
  configured = true;
}

export type PushPayload = { title: string; body: string; url?: string; tag?: string };

export async function saveSubscription(
  userId: string,
  sub: { endpoint: string; keys: { p256dh: string; auth: string } },
) {
  const now = new Date().toISOString();
  await db
    .insert(schema.pushSubscriptions)
    .values({
      id: randomUUID(),
      userId,
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
      createdAt: now,
    })
    .onConflictDoNothing();
  return { ok: true };
}

export async function sendToUser(userId: string, payload: PushPayload) {
  ensureVapid();
  const subs = await db
    .select()
    .from(schema.pushSubscriptions)
    .where(eq(schema.pushSubscriptions.userId, userId));

  let sent = 0;
  for (const s of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        JSON.stringify(payload),
      );
      sent++;
    } catch (e: unknown) {
      const code = (e as { statusCode?: number })?.statusCode;
      if (code === 404 || code === 410) {
        // 만료된 구독 제거
        await db
          .delete(schema.pushSubscriptions)
          .where(eq(schema.pushSubscriptions.endpoint, s.endpoint));
      }
    }
  }
  return { sent, total: subs.length };
}

export async function alreadySent(pageId: string, kind: string): Promise<boolean> {
  const rows = await db
    .select({ id: schema.remindersSent.id })
    .from(schema.remindersSent)
    .where(and(eq(schema.remindersSent.pageId, pageId), eq(schema.remindersSent.kind, kind)))
    .limit(1);
  return rows.length > 0;
}

export async function markSent(pageId: string, kind: string) {
  await db.insert(schema.remindersSent).values({
    id: randomUUID(),
    pageId,
    kind,
    sentAt: new Date().toISOString(),
  });
}
