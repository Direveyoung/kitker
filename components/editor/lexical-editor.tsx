"use client";

import { useEffect } from "react";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
} from "@lexical/markdown";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";

const theme = {
  paragraph: "mb-2",
  heading: {
    h1: "text-2xl font-bold mt-4 mb-2",
    h2: "text-xl font-bold mt-3 mb-1",
    h3: "text-lg font-semibold mt-2 mb-1",
  },
  list: {
    ul: "list-disc ml-6 mb-2",
    ol: "list-decimal ml-6 mb-2",
    listitem: "mb-1",
  },
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
    code: "px-1 py-0.5 rounded bg-muted font-mono text-[0.85em]",
  },
  quote:
    "border-l-4 border-border pl-4 italic text-muted-foreground my-2",
  link: "text-primary underline underline-offset-2",
  code: "block bg-muted rounded p-3 font-mono text-sm my-2 overflow-x-auto",
};

function onError(error: Error) {
  console.error("Lexical:", error);
}

function AutoFocus() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    editor.focus();
  }, [editor]);
  return null;
}

export function LexicalEditor({
  initialMarkdown,
  onChange,
  placeholder = "자유롭게 적기… (마크다운 단축키 지원: # 제목, - 리스트, **굵게**)",
  autoFocus = false,
}: {
  initialMarkdown: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const initialConfig = {
    namespace: "eveworks-note",
    theme,
    onError,
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      CodeNode,
      CodeHighlightNode,
      LinkNode,
    ],
    editorState: () =>
      $convertFromMarkdownString(initialMarkdown ?? "", TRANSFORMERS),
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="relative flex-1">
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className="min-h-[60vh] outline-none text-sm leading-relaxed"
              aria-label="노트 본문"
            />
          }
          placeholder={
            <div className="pointer-events-none absolute left-0 top-0 select-none text-sm text-muted-foreground">
              {placeholder}
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        <ListPlugin />
        <LinkPlugin />
        <OnChangePlugin
          onChange={(editorState) => {
            editorState.read(() => {
              const md = $convertToMarkdownString(TRANSFORMERS);
              onChange(md);
            });
          }}
        />
        {autoFocus && <AutoFocus />}
      </div>
    </LexicalComposer>
  );
}
