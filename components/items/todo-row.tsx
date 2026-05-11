"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { deleteItem, toggleTodo } from "@/lib/items/actions";
import { cn } from "@/lib/utils";

type Item = {
  id: string;
  body: string;
  completed: boolean;
  carryOverCount: number;
};

export function TodoRow({ item }: { item: Item }) {
  return (
    <li className="group flex items-center gap-3 rounded-md px-3 py-2 hover:bg-accent">
      <Checkbox
        checked={item.completed}
        onCheckedChange={() => {
          void toggleTodo(item.id);
        }}
      />
      <span
        className={cn(
          "flex-1 text-sm whitespace-pre-wrap break-words",
          item.completed && "text-muted-foreground line-through",
        )}
      >
        {item.body}
      </span>
      {item.carryOverCount > 0 && (
        <span
          className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
          title={`${item.carryOverCount}일 이월됨`}
        >
          ↩{item.carryOverCount}
        </span>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className="md:opacity-0 md:group-hover:opacity-100"
        onClick={() => {
          void deleteItem(item.id);
        }}
        title="삭제"
      >
        <X className="size-3.5" />
      </Button>
    </li>
  );
}
