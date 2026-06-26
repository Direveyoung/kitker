import type { Block } from "@/lib/pages/types";

const uid = () => crypto.randomUUID();

/** 마크다운 → { title, blocks }. 첫 H1은 제목으로 승격. */
export function parseMarkdown(md: string): { title: string | null; blocks: Block[] } {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let title: string | null = null;

  let inCode = false;
  let codeBuf: string[] = [];

  const flushCode = () => {
    blocks.push({ id: uid(), type: "code", text: codeBuf.join("\n") });
    codeBuf = [];
  };

  for (const raw of lines) {
    const line = raw;

    // 코드 펜스
    if (/^\s*```/.test(line)) {
      if (inCode) {
        flushCode();
        inCode = false;
      } else {
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      codeBuf.push(line);
      continue;
    }

    const t = line.trim();
    if (t === "") continue;

    // 구분선
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(t)) {
      blocks.push({ id: uid(), type: "divider" });
      continue;
    }

    // 할 일
    const todo = t.match(/^[-*]\s+\[( |x|X)\]\s+(.*)$/);
    if (todo) {
      blocks.push({
        id: uid(),
        type: "todo",
        text: inline(todo[2]),
        checked: todo[1].toLowerCase() === "x",
      });
      continue;
    }

    // 제목
    const h = t.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const text = inline(h[2]);
      if (h[1].length === 1 && title === null) {
        title = text; // 첫 H1 → 제목
        continue;
      }
      const level = Math.min(h[1].length, 3) as 1 | 2 | 3;
      blocks.push({ id: uid(), type: "heading", level, text });
      continue;
    }

    // 인용
    if (/^>\s?/.test(t)) {
      blocks.push({ id: uid(), type: "quote", text: inline(t.replace(/^>\s?/, "")) });
      continue;
    }

    // 리스트 → 불릿 문단 (전용 블록 없음)
    const li = t.match(/^([-*+]|\d+\.)\s+(.*)$/);
    if (li) {
      blocks.push({ id: uid(), type: "paragraph", text: `• ${inline(li[2])}` });
      continue;
    }

    blocks.push({ id: uid(), type: "paragraph", text: inline(t) });
  }

  if (inCode && codeBuf.length) flushCode();

  return { title, blocks };
}

/** 인라인 마크다운 기호 제거(**bold**, *em*, `code`, [text](url)) */
function inline(s: string): string {
  return s
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}
