"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight, FileText, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createPage, deletePage } from "@/lib/pages/actions";
import type { PageNode } from "@/lib/pages/types";

export function PageTree({ nodes }: { nodes: PageNode[] }) {
  const router = useRouter();
  const [, start] = useTransition();

  function addRoot() {
    start(async () => {
      const { id } = await createPage({});
      router.push(`/pages/${id}`);
      router.refresh();
    });
  }

  return (
    <div className="mt-3 flex flex-col">
      <div className="flex items-center justify-between px-3 py-1">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
          메모
        </span>
        <button
          type="button"
          onClick={addRoot}
          title="새 메모"
          className="rounded p-0.5 text-text-tertiary hover:bg-bg-muted hover:text-text-primary"
        >
          <Plus className="size-3.5" />
        </button>
      </div>

      {nodes.length === 0 ? (
        <p className="px-3 py-1 text-xs text-text-tertiary">메모가 없어요</p>
      ) : (
        <ul>
          {nodes.map((n) => (
            <TreeRow key={n.id} node={n} depth={0} />
          ))}
        </ul>
      )}
    </div>
  );
}

function TreeRow({ node, depth }: { node: PageNode; depth: number }) {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const active = params?.id === node.id;
  const [open, setOpen] = useState(false);
  const [, start] = useTransition();
  const hasChildren = node.children.length > 0;

  function addChild(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    start(async () => {
      const { id } = await createPage({ parentId: node.id });
      setOpen(true);
      router.push(`/pages/${id}`);
      router.refresh();
    });
  }

  function remove(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`"${node.title}" 메모를 삭제할까요? (하위 포함)`)) return;
    start(async () => {
      await deletePage(node.id);
      if (active) router.push("/pages");
      router.refresh();
    });
  }

  return (
    <li>
      <div
        className={cn(
          "group flex items-center gap-1 rounded-md pr-1 text-sm",
          active ? "bg-accent-soft text-accent-deep" : "hover:bg-bg-muted",
        )}
        style={{ paddingLeft: `${depth * 12 + 4}px` }}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "shrink-0 rounded p-0.5 text-text-tertiary hover:text-text-primary",
            !hasChildren && "invisible",
          )}
        >
          <ChevronRight className={cn("size-3.5 transition-transform", open && "rotate-90")} />
        </button>

        <Link
          href={`/pages/${node.id}`}
          className="flex min-w-0 flex-1 items-center gap-1.5 py-1"
        >
          <span className="shrink-0 text-sm">
            {node.icon ?? <FileText className="size-3.5 text-text-tertiary" />}
          </span>
          <span className="truncate">{node.title}</span>
        </Link>

        <button
          type="button"
          onClick={addChild}
          title="하위 메모"
          className="shrink-0 rounded p-0.5 text-text-tertiary opacity-0 hover:bg-bg-surface hover:text-text-primary group-hover:opacity-100"
        >
          <Plus className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={remove}
          title="삭제"
          className="shrink-0 rounded p-0.5 text-text-tertiary opacity-0 hover:bg-bg-surface hover:text-danger group-hover:opacity-100"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      {open && hasChildren && (
        <ul>
          {node.children.map((c) => (
            <TreeRow key={c.id} node={c} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}
