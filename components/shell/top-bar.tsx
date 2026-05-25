import { ThemeToggle } from "./theme-toggle";

export function TopBar() {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b bg-bg-page/80 px-4 backdrop-blur sm:px-6">
      <div className="text-sm text-text-tertiary">
        {/* 페이지 자체 헤더가 우선. top-bar는 글로벌 정보만 */}
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
