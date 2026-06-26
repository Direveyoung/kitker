import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { createPage } from "@/lib/pages/actions";
import { createTodo } from "@/lib/today/actions";
import { createEvent } from "@/lib/calendar/actions";
import { getTodos } from "@/lib/today/queries";
import { getEvents } from "@/lib/calendar/queries";
import { searchPages } from "@/lib/search/actions";

export const CHLOE_TOOLS: Anthropic.Tool[] = [
  {
    name: "create_memo",
    description: "새 메모(페이지)를 만든다. 본문 없이 제목만.",
    input_schema: {
      type: "object",
      properties: { title: { type: "string", description: "메모 제목" } },
      required: ["title"],
    },
  },
  {
    name: "create_todo",
    description: "할 일을 추가한다. 마감일은 선택.",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string", description: "할 일 내용" },
        dueAt: { type: "string", description: "마감일 'YYYY-MM-DD' (선택)" },
      },
      required: ["title"],
    },
  },
  {
    name: "create_event",
    description:
      "일정을 추가한다. 시간 있는 일정은 startsAt/endsAt에 ISO8601(UTC), 종일은 allDay=true에 startsAt='YYYY-MM-DD'.",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string" },
        startsAt: { type: "string", description: "ISO8601 또는 YYYY-MM-DD" },
        endsAt: { type: "string", description: "ISO8601 (선택)" },
        allDay: { type: "boolean" },
      },
      required: ["title", "startsAt"],
    },
  },
  {
    name: "search_pages",
    description: "제목·본문으로 메모를 검색한다.",
    input_schema: {
      type: "object",
      properties: { query: { type: "string" } },
      required: ["query"],
    },
  },
  {
    name: "list_todos",
    description: "할 일 목록을 가져온다 (완료/미완료 포함).",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "list_events",
    description: "일정 목록을 가져온다.",
    input_schema: { type: "object", properties: {} },
  },
];

export type ToolOutcome = { result: string; action?: string };

export async function runChloeTool(
  userId: string,
  name: string,
  input: Record<string, unknown>,
): Promise<ToolOutcome> {
  switch (name) {
    case "create_memo": {
      const { id } = await createPage({ title: String(input.title ?? "") });
      return { result: JSON.stringify({ ok: true, id }), action: `메모 “${input.title}” 생성` };
    }
    case "create_todo": {
      await createTodo({
        title: String(input.title ?? ""),
        dueAt: input.dueAt ? String(input.dueAt) : null,
      });
      return { result: JSON.stringify({ ok: true }), action: `할 일 “${input.title}” 추가` };
    }
    case "create_event": {
      await createEvent({
        calendarId: null,
        title: String(input.title ?? ""),
        startsAt: String(input.startsAt ?? ""),
        endsAt: input.endsAt ? String(input.endsAt) : null,
        allDay: Boolean(input.allDay),
      });
      return { result: JSON.stringify({ ok: true }), action: `일정 “${input.title}” 추가` };
    }
    case "search_pages": {
      const rows = await searchPages(String(input.query ?? ""));
      return { result: JSON.stringify(rows.slice(0, 10)) };
    }
    case "list_todos": {
      const rows = await getTodos(userId);
      return { result: JSON.stringify(rows) };
    }
    case "list_events": {
      const rows = await getEvents(userId);
      return { result: JSON.stringify(rows) };
    }
    default:
      return { result: JSON.stringify({ error: `unknown tool: ${name}` }) };
  }
}
