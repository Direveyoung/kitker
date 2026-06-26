"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Calendar,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  FileText,
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
  color: "purple" | "yellow" | "pink";
};

const NAV: NavItem[] = [
  { href: "/today", label: "Today", icon: Sun, shortcut: "⌘1", color: "purple" },
  {
    href: "/calendar",
    label: "Calendar",
    icon: Calendar,
    shortcut: "⌘2",
    color: "yellow",
  },
  {
    href: "/tasks",
    label: "Tasks",
    icon: CheckSquare,
    shortcut: "⌘3",
    color: "pink",
  },
  {
    href: "/pages",
    label: "Pages",
    icon: FileText,
    shortcut: "⌘4",
    color: "purple",
  },
];

const STORAGE_KEY = "kitker:sidebar:collapsed";

export function Sidebar({ tree }: { tree?: React.ReactNode }) {
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

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!(e.metaKey || e.ctrlKey)) return;
      const k = e.key;
      if (/^[1-9]$/.test(k)) {
        const idx = parseInt(k, 10) - 1;
        if (idx < NAV.length) {
          e.preventDefault();
          router.push(NAV[idx].href);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <aside
      className={cn(
        "hidden md:flex h-screen shrink-0 flex-col border-r bg-bg-surface transition-[width] duration-200",
        collapsed ? "w-[60px]" : "w-[240px]",
      )}
    >
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
              Kitker
            </span>
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="ml-auto rounded p-1 text-text-tertiary hover:bg-bg-muted hover:text-text-primary"
              title="접기"
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
          className="mx-auto mt-2 rounded p-1 text-text-tertiary hover:bg-bg-muted hover:text-text-primary"
          title="펴기"
        >
          <ChevronRight className="size-4" />
        </button>
      )}

      <div
        className={cn(
          "flex flex-col gap-1.5 p-2",
          collapsed && "items-center",
        )}
      >
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-deep",
            collapsed ? "size-9 justify-center p-0" : "w-full",
          )}
          title="빠른 캡처 (⌘N)"
          onClick={() =>
            window.dispatchEvent(new CustomEvent("kitker:open-capture"))
          }
        >
          <Plus className="size-4 shrink-0" />
          {!collapsed && (
            <>
              <span>빠른 캡처</span>
              <kbd className="ml-auto rounded bg-black/10 px-1.5 py-0.5 text-[10px] text-white/90">
                ⌘N
              </kbd>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() =>
            window.dispatchEvent(new CustomEvent("kitker:open-search"))
          }
          className={cn(
            "inline-flex items-center gap-2 rounded-md border bg-bg-page text-sm text-text-secondary transition-colors hover:bg-bg-muted hover:text-text-primary",
            collapsed ? "size-9 justify-center" : "w-full px-3 py-2",
          )}
          title="검색 (⌘K)"
        >
          <Search className="size-4 shrink-0" />
          {!collapsed && (
            <>
              <span>검색</span>
              <kbd className="ml-auto rounded bg-bg-muted px-1.5 py-0.5 text-[10px]">
                ⌘K
              </kbd>
            </>
          )}
        </button>
      </div>

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

        {!collapsed && tree}
      </nav>

      <div
        className={cn(
          "border-t p-2 text-[11px] text-text-tertiary",
          collapsed ? "text-center" : "px-3 py-2",
        )}
      >
        {collapsed ? "🌿" : "v3.1 · Petals + Velvet"}
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
          ? "bg-accent-soft font-semibold text-accent-deep"
          : "text-text-primary hover:bg-bg-muted",
        collapsed && "size-9 justify-center p-0",
      )}
    >
      <Icon
        className={cn(
          "size-4 shrink-0",
          active && "text-accent",
        )}
      />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          <kbd className="text-[10px] text-text-tertiary tabular-nums">
            {item.shortcut}
          </kbd>
        </>
      )}
    </Link>
  );
}
