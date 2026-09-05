"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/providers/theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={toggleTheme}
      className="group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
    >
      {isDark ? (
        <Moon
          aria-hidden="true"
          className="size-4 shrink-0 transition-colors group-hover:text-foreground"
        />
      ) : (
        <Sun
          aria-hidden="true"
          className="size-4 shrink-0 transition-colors group-hover:text-foreground"
        />
      )}

      <span className="flex-1 text-left">Theme</span>

      <span
        aria-hidden="true"
        className={
          isDark
            ? "relative h-5 w-9 shrink-0 rounded-full border border-brand-400/40 bg-brand-500 transition-colors"
            : "relative h-5 w-9 shrink-0 rounded-full border border-border bg-secondary transition-colors"
        }
      >
        <span
          className={
            isDark
              ? "absolute top-0.5 right-0.5 size-3.5 rounded-full bg-[#211900] shadow-sm transition-all"
              : "absolute top-0.5 left-0.5 size-3.5 rounded-full bg-foreground shadow-sm transition-all"
          }
        />
      </span>
    </button>
  );
}
