import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  type Klass,
  type LexicalNode,
} from "lexical";
import {
  $createHeadingNode,
  $isHeadingNode,
  HeadingNode,
  QuoteNode,
  $createQuoteNode,
  $isQuoteNode,
} from "@lexical/rich-text";
import {
  $createListItemNode,
  $createListNode,
  $isListItemNode,
  $isListNode,
  ListItemNode,
  ListNode,
} from "@lexical/list";
import { $createCodeNode, $isCodeNode, CodeHighlightNode, CodeNode } from "@lexical/code";
import {
  $createHorizontalRuleNode,
  $isHorizontalRuleNode,
  HorizontalRuleNode,
} from "@lexical/react/LexicalHorizontalRuleNode";
import type { Block } from "./types";

// LexicalComposer + headless 공용 노드 목록
export const EDITOR_NODES: ReadonlyArray<Klass<LexicalNode>> = [
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  CodeNode,
  CodeHighlightNode,
  HorizontalRuleNode,
];

const uid = () => crypto.randomUUID();

/** Block[] → 루트 트리 (editor.update / editorState 초기화 안에서 호출) */
export function $blocksToRoot(blocks: Block[]): void {
  const root = $getRoot();
  root.clear();

  let i = 0;
  while (i < blocks.length) {
    const b = blocks[i];

    if (b.type === "todo") {
      // 연속된 todo는 하나의 체크리스트로 묶음
      const list = $createListNode("check");
      while (i < blocks.length && blocks[i].type === "todo") {
        const t = blocks[i] as Extract<Block, { type: "todo" }>;
        const li = $createListItemNode(t.checked);
        if (t.text) li.append($createTextNode(t.text));
        list.append(li);
        i++;
      }
      root.append(list);
      continue;
    }

    switch (b.type) {
      case "heading": {
        const h = $createHeadingNode(`h${b.level}`);
        if (b.text) h.append($createTextNode(b.text));
        root.append(h);
        break;
      }
      case "quote": {
        const q = $createQuoteNode();
        if (b.text) q.append($createTextNode(b.text));
        root.append(q);
        break;
      }
      case "code": {
        const c = $createCodeNode();
        if (b.text) c.append($createTextNode(b.text));
        root.append(c);
        break;
      }
      case "divider": {
        root.append($createHorizontalRuleNode());
        break;
      }
      default: {
        const p = $createParagraphNode();
        if (b.text) p.append($createTextNode(b.text));
        root.append(p);
      }
    }
    i++;
  }

  if (root.getChildrenSize() === 0) root.append($createParagraphNode());
}

/** 루트 트리 → Block[] (editorState.read 안에서 호출) */
export function $rootToBlocks(): Block[] {
  const blocks: Block[] = [];

  for (const node of $getRoot().getChildren()) {
    if ($isHorizontalRuleNode(node)) {
      blocks.push({ id: uid(), type: "divider" });
      continue;
    }
    if ($isListNode(node)) {
      const isCheck = node.getListType() === "check";
      for (const li of node.getChildren()) {
        if (!$isListItemNode(li)) continue;
        const text = li.getTextContent();
        if (isCheck) {
          blocks.push({ id: uid(), type: "todo", text, checked: li.getChecked() ?? false });
        } else {
          blocks.push({ id: uid(), type: "paragraph", text: text ? `• ${text}` : "" });
        }
      }
      continue;
    }
    if ($isHeadingNode(node)) {
      const tag = node.getTag();
      const level = (tag === "h1" ? 1 : tag === "h2" ? 2 : 3) as 1 | 2 | 3;
      blocks.push({ id: uid(), type: "heading", level, text: node.getTextContent() });
      continue;
    }
    if ($isQuoteNode(node)) {
      blocks.push({ id: uid(), type: "quote", text: node.getTextContent() });
      continue;
    }
    if ($isCodeNode(node)) {
      blocks.push({ id: uid(), type: "code", text: node.getTextContent() });
      continue;
    }
    blocks.push({ id: uid(), type: "paragraph", text: node.getTextContent() });
  }

  return blocks;
}
