"use client";

import { useRef } from "react";

/**
 * Form action 완료 후 자동 reset.
 * 입력창 textarea 비우기 + autoGrow height 복구.
 */
export function QuickForm({
  action,
  children,
  className,
}: {
  action: (formData: FormData) => Promise<void> | void;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLFormElement>(null);

  async function handle(fd: FormData) {
    await action(fd);
    if (ref.current) {
      ref.current.reset();
      const ta = ref.current.querySelector("textarea");
      if (ta) ta.style.height = "auto";
    }
  }

  return (
    <form ref={ref} action={handle} className={className}>
      {children}
    </form>
  );
}
