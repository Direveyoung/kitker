"use client";

import { useRef } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import {
  BOLD_ITALIC_STAR,
  BOLD_ITALIC_UNDERSCORE,
  BOLD_STAR,
  BOLD_UNDERSCORE,
  CHECK_LIST,
  CODE,
  HEADING,
  INLINE_CODE,
  ITALIC_STAR,
  ITALIC_UNDERSCORE,
  QUOTE,
  type Transformer,
} from "@lexical/markdown";
import type { Block } from "@/lib/pages/types";
import { $blocksToRoot, $rootToBlocks, EDITOR_NODES } from "@/lib/pages/lexical-blocks";

// 체크리스트 전용 모델이라 bullet/ordered 변환은 제외
const TRANSFORMERS: Transformer[] = [
  HEADING,
  QUOTE,
  CODE,
  CHECK_LIST,
  BOLD_ITALIC_STAR,
  BOLD_ITALIC_UNDERSCORE,
  BOLD_STAR,
  BOLD_UNDERSCORE,
  ITALIC_STAR,
  ITALIC_UNDERSCORE,
  INLINE_CODE,
];

const THEME = {
  paragraph: "mb-1",
  heading: {
    h1: "mt-4 mb-1 text-2xl font-bold tracking-tight",
    h2: "mt-3 mb-1 text-xl font-semibold tracking-tight",
    h3: "mt-2 mb-1 text-lg font-semibold",
  },
  quote: "my-1 border-l-2 border-accent pl-3 italic text-text-secondary",
  code: "eve-code my-2 block overflow-x-auto rounded-md bg-bg-muted p-3 font-mono text-sm",
  list: {
    checklist: "eve-checklist",
    listitem: "ml-1",
    listitemChecked: "eve-li-checked",
    listitemUnchecked: "eve-li-unchecked",
    nested: { listitem: "" },
  },
  text: {
    bold: "font-semibold",
    italic: "italic",
    code: "rounded bg-bg-muted px-1 py-0.5 font-mono text-[0.9em]",
  },
};

export function LexicalEditor({
  initial,
  onBlocks,
}: {
  initial: Block[];
  onBlocks: (blocks: Block[]) => void;
}) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const initialConfig = {
    namespace: "kitker",
    nodes: [...EDITOR_NODES],
    theme: THEME,
    editorState: () => $blocksToRoot(initial),
    onError: (e: Error) => console.error("[lexical]", e),
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="relative mt-6">
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="min-h-[320px] leading-relaxed text-text-primary outline-none" />
          }
          placeholder={
            <div className="pointer-events-none absolute left-0 top-0 text-text-tertiary">
              마크다운(# 제목, &gt; 인용, - [ ] 할일, ``` 코드)으로 작성…
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <ListPlugin />
        <CheckListPlugin />
        <HorizontalRulePlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        <OnChangePlugin
          ignoreSelectionChange
          onChange={(editorState) => {
            if (timer.current) clearTimeout(timer.current);
            timer.current = setTimeout(() => {
              editorState.read(() => onBlocks($rootToBlocks()));
            }, 250);
          }}
        />
      </div>
    </LexicalComposer>
  );
}
