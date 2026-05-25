"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const MODES = [
  { value: "light", icon: Sun, label: "Petals" },
  { value: "dark", icon: Moon, label: "Velvet" },
  { value: "system", icon: Monitor, label: "자동" },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-8 w-[88px]" aria-hidden />;
  }

  return (
    <div
      role="radiogroup"
      aria-label="테마"
      className="flex items-center gap-0.5 rounded-md border bg-bg-surface p-0.5"
    >
      {MODES.map(({ value, icon: Icon, label }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-[6px] transition-colors duration-200",
              active
                ? "bg-accent-soft text-accent"
                : "text-text-tertiary hover:bg-bg-muted",
            )}
          >
            <Icon size={14} />
          </button>
        );
      })}
    </div>
  );
}
