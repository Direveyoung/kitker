import { requireUserId } from "@/lib/auth/dev-session";
import { sendToUser } from "@/lib/push/send";

export const dynamic = "force-dynamic";

export async function POST() {
  const userId = await requireUserId();
  try {
    const res = await sendToUser(userId, {
      title: "Kitker 알림 테스트 🌿",
      body: "알림이 정상 작동해요. 일정·할일 마감 전에 알려드릴게요.",
      url: "/today",
      tag: "kitker-test",
    });
    return Response.json({ ok: true, ...res });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
