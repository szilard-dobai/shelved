"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { trackEvent } from "@/lib/tracking";

type Theme = "light" | "dark" | "system";

const THEME_CYCLE: Theme[] = ["light", "dark", "system"];

const THEME_CONFIG: Record<Theme, { icon: typeof Sun; label: string }> = {
  light: { icon: Sun, label: "Light" },
  dark: { icon: Moon, label: "Dark" },
  system: { icon: Monitor, label: "System" },
};

const emptySubscribe = () => () => {};

function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

const baseClass =
  "fixed bottom-[18px] left-6 z-[500] inline-flex items-center gap-2 px-3 h-9 rounded-md border border-rule bg-bg-panel-solid text-ink-muted hover:text-ink hover:bg-bg-raised backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.4)] font-sans text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed";

export function ThemeToggle() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const mounted = useIsMounted();

  if (pathname?.startsWith("/s/")) return null;

  if (!mounted) {
    return (
      <button type="button" className={baseClass} disabled aria-hidden>
        <Monitor className="size-4" />
        <span>System</span>
      </button>
    );
  }

  const current = (theme as Theme) || "system";
  const { icon: Icon, label } = THEME_CONFIG[current];

  const handleClick = () => {
    const next = THEME_CYCLE[(THEME_CYCLE.indexOf(current) + 1) % THEME_CYCLE.length];
    setTheme(next);
    trackEvent("theme_changed", { theme: next });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Current theme: ${label}. Click to change.`}
      className={baseClass}
    >
      <Icon className="size-4" />
      <span>{label}</span>
    </button>
  );
}
