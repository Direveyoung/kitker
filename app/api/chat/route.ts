import Anthropic from "@anthropic-ai/sdk";
import { requireUserId } from "@/lib/auth/dev-session";
import { CHLOE_TOOLS, runChloeTool } from "@/lib/chloe/tools";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type ClientMsg = { role: "user" | "assistant"; content: string };

const MODEL = "claude-opus-4-8";

function systemPrompt(): string {
  const now = new Date();
  const today = now.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
  return [
    "너는 '클로이(Chloé)', 영아 이사(Eve, 김영아)의 1인 워크스페이스 비서야.",
    "한국어로, 빠릿하고 다정하게. 농담·유머 환영.",
    "도구로 메모/할일/일정을 만들고, 검색·조회할 수 있어. 필요하면 먼저 조회한 뒤 답해.",
    `오늘은 ${today}.`,
    "사용자는 발리(UTC+8) 원격근무 + 서울(UTC+9) 팀 관리. 시간 있는 일정의 startsAt/endsAt는 의도한 현지시각을 ISO8601(UTC)로 변환해서 넣어(시간대 불명확하면 서울 기준). 종일 일정·할일 마감은 'YYYY-MM-DD'.",
    "행동을 실행했으면 무엇을 했는지 한 줄로 확인해줘. 결론 먼저, 군더더기 없이.",
  ].join("\n");
}

export async function POST(req: Request) {
  const userId = await requireUserId();

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY가 설정되지 않았어요. .env.local에 추가해 주세요." },
      { status: 400 },
    );
  }

  let body: { messages?: ClientMsg[] };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "잘못된 요청" }, { status: 400 });
  }
  const history = (body.messages ?? []).filter((m) => m.content?.trim());
  if (!history.length) return Response.json({ error: "메시지가 비어있어요" }, { status: 400 });

  const client = new Anthropic();
  const messages: Anthropic.MessageParam[] = history.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const actions: string[] = [];

  try {
    for (let i = 0; i < 6; i++) {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 8000,
        thinking: { type: "adaptive" },
        output_config: { effort: "medium" },
        system: systemPrompt(),
        tools: CHLOE_TOOLS,
        messages,
      });

      if (response.stop_reason !== "tool_use") {
        const text = response.content
          .filter((b): b is Anthropic.TextBlock => b.type === "text")
          .map((b) => b.text)
          .join("");
        return Response.json({ text: text || "(응답 없음)", actions });
      }

      // tool_use: 실행 후 결과를 돌려주고 루프 계속
      messages.push({ role: "assistant", content: response.content });
      const toolUses = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
      );
      const results: Anthropic.ToolResultBlockParam[] = [];
      for (const tu of toolUses) {
        const outcome = await runChloeTool(
          userId,
          tu.name,
          (tu.input ?? {}) as Record<string, unknown>,
        );
        if (outcome.action) actions.push(outcome.action);
        results.push({ type: "tool_result", tool_use_id: tu.id, content: outcome.result });
      }
      messages.push({ role: "user", content: results });
    }
    return Response.json({ text: "처리가 길어졌어요. 다시 시도해 주세요.", actions });
  } catch (e) {
    const msg = e instanceof Anthropic.APIError ? `${e.status} ${e.message}` : String(e);
    return Response.json({ error: `클로이 오류: ${msg}` }, { status: 500 });
  }
}
