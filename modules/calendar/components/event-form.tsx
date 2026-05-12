"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { createEvent } from "../actions";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function defaultStarts(): string {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EventForm() {
  const [open, setOpen] = useState(false);
  const startsDefault = defaultStarts();

  return (
    <>
      <Button
        type="button"
        size="lg"
        className="gap-1"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4" /> 일정 추가
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>일정 추가</DialogTitle>
          <form
            action={async (fd) => {
              await createEvent(fd);
              setOpen(false);
            }}
            className="mt-4 space-y-3"
          >
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                제목
              </label>
              <Input
                name="title"
                placeholder="회의·약속·기념일…"
                autoFocus
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  시작
                </label>
                <Input
                  name="startsAt"
                  type="datetime-local"
                  defaultValue={startsDefault}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  종료 (생략 시 1시간 후)
                </label>
                <Input name="endsAt" type="datetime-local" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                장소
              </label>
              <Input name="location" placeholder="(선택)" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isAllDay" />
              <span>종일</span>
            </label>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                취소
              </Button>
              <Button type="submit">추가</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
