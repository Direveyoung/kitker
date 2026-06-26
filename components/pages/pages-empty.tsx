"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { FilePlus } from "lucide-react";
import { createPage } from "@/lib/pages/actions";

export function PagesEmpty() {
  const router = useRouter();
  const [pending, start] = useTransition();

  function create() {
    start(async () => {
      const { id } = await createPage({});
      router.push(`/pages/${id}`);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-1 items-center justify-center p-12">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="text-5xl">📝</div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pages</h1>
          <p className="mt-1 text-sm text-text-secondary">
            왼쪽 트리에서 메모를 고르거나, 새로 만들어 보세요.
          </p>
        </div>
        <button
          type="button"
          onClick={create}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-deep disabled:opacity-60"
        >
          <FilePlus className="size-4" />
          새 메모 만들기
        </button>
      </div>
    </div>
  );
}
