"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookMarked,
  Bot,
  Calendar,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  FileText,
  FolderKanban,
  Inbox,
  NotebookPen,
  Plus,
  Search,
  Sun,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  shortcut: string;
};

const NAV: NavItem[] = [
  { href: "/today", label: "Today", icon: Sun, shortcut: "⌘1" },
  { href: "/inbox", label: "Inbox", icon: Inbox, shortcut: "⌘2" },
  { href: "/tasks", label: "Tasks", icon: CheckSquare, shortcut: "⌘3" },
  { href: "/calendar", label: "Calendar", icon: Calendar, shortcut: "⌘4" },
  { href: "/notes", label: "Notes", icon: FileText, shortcut: "⌘5" },
  { href: "/projects", label: "Projects", icon: FolderKanban, shortcut: "⌘6" },
  { href: "/reading", label: "Reading", icon: BookMarked, shortcut: "⌘7" },
  { href: "/journal", label: "Journal", icon: NotebookPen, shortcut: "⌘8" },
  { href: "/budget", label: "Budget", icon: CircleDollarSign, shortcut: "⌘9" },
];

const CHLOE: NavItem = {
  href: "/chloe",
  label: "Chloé",
  icon: Bot,
  shortcut: "⌘0",
};

const STORAGE_KEY = "eveworks:sidebar:collapsed";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "1") setCollapsed(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
  }, [collapsed, mounted]);

  // ⌘1~9, ⌘0, ⌘K, ⌘N 글로벌 단축키
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!(e.metaKey || e.ctrlKey)) return;
      const key = e.key;
      if (/^[1-9]$/.test(key)) {
        const idx = parseInt(key, 10) - 1;
        if (idx < NAV.length) {
          e.preventDefault();
          router.push(NAV[idx].href);
        }
      } else if (key === "0") {
        e.preventDefault();
        router.push(CHLOE.href);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <aside
      className={cn(
        "hidden md:flex h-screen shrink-0 flex-col border-r bg-sidebar transition-[width] duration-200",
        collapsed ? "w-[60px]" : "w-[240px]",
      )}
    >
      {/* Header: 로고 + collapse 토글 */}
      <div
        className={cn(
          "flex h-12 items-center gap-2 border-b px-3",
          collapsed && "justify-center px-0",
        )}
      >
        <span className="text-lg">🌿</span>
        {!collapsed && (
          <>
            <span className="text-sm font-semibold tracking-tight">
              eveworks
            </span>
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="ml-auto rounded p-1 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              title="사이드바 접기"
            >
              <ChevronLeft className="size-4" />
            </button>
          </>
        )}
      </div>

      {collapsed && (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="mx-auto mt-2 rounded p-1 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          title="사이드바 펴기"
        >
          <ChevronRight className="size-4" />
        </button>
      )}

      {/* Quick capture + Search */}
      <div
        className={cn(
          "flex flex-col gap-1.5 p-2",
          collapsed && "items-center",
        )}
      >
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
            collapsed ? "size-9 justify-center p-0" : "w-full",
          )}
          title="빠른 추가 (⌘N)"
          onClick={() => router.push("/inbox")}
        >
          <Plus className="size-4 shrink-0" />
          {!collapsed && (
            <>
              <span>빠른 추가</span>
              <kbd className="ml-auto rounded bg-black/10 px-1.5 py-0.5 text-[10px]">
                ⌘N
              </kbd>
            </>
          )}
        </button>

        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-2 rounded-md border bg-background text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
            collapsed ? "size-9 justify-center" : "w-full px-3 py-2",
          )}
          title="검색 (⌘K)"
          onClick={() =>
            window.dispatchEvent(new CustomEvent("eveworks:open-search"))
          }
        >
          <Search className="size-4 shrink-0" />
          {!collapsed && (
            <>
              <span>검색</span>
              <kbd className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px]">
                ⌘K
              </kbd>
            </>
          )}
        </button>
      </div>

      {/* Nav */}
      <nav
        className={cn(
          "flex flex-1 flex-col gap-0.5 overflow-y-auto p-2",
          collapsed && "items-center",
        )}
      >
        {NAV.map((item) => (
          <SidebarLink
            key={item.href}
            item={item}
            collapsed={collapsed}
            active={isActive(pathname, item.href)}
          />
        ))}
        <div className="my-2 border-t" />
        <SidebarLink
          item={CHLOE}
          collapsed={collapsed}
          active={isActive(pathname, CHLOE.href)}
        />
      </nav>

      {/* Footer */}
      <div
        className={cn(
          "border-t p-2",
          collapsed && "flex justify-center",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm",
            collapsed && "size-9 justify-center p-0",
          )}
          title="영아 · pm.younga@gmail.com"
        >
          <div className="grid size-7 shrink-0 place-items-center rounded-full bg-accent-sage-soft text-[11px] font-semibold text-accent-sage-deep dark:text-[var(--accent-sage)]">
            영
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">영아</div>
              <div className="truncate text-[11px] text-muted-foreground">
                pm.younga@gmail.com
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarLink({
  item,
  collapsed,
  active,
}: {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      title={collapsed ? `${item.label} (${item.shortcut})` : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm transition-colors",
        active
          ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent/50",
        collapsed && "size-9 justify-center p-0",
      )}
    >
      <Icon
        className={cn("size-4 shrink-0", active && "text-sidebar-primary")}
      />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          <kbd className="text-[10px] text-muted-foreground tabular-nums">
            {item.shortcut}
          </kbd>
        </>
      )}
    </Link>
  );
}
