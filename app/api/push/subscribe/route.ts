import { requireUserId } from "@/lib/auth/dev-session";
import { saveSubscription } from "@/lib/push/send";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const userId = await requireUserId();
  const sub = await req.json().catch(() => null);
  if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
    return Response.json({ error: "잘못된 구독 정보" }, { status: 400 });
  }
  await saveSubscription(userId, sub);
  return Response.json({ ok: true });
}
