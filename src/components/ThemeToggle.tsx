"use client";

import { usePathname } from "next/navigation";
import { useAppState } from "@/lib/app-state";
import { Icon } from "@/components/ui/Icon";
import { trackEvent } from "@/lib/tracking";

export function ThemeToggle() {
  const pathname = usePathname();
  const { theme, setTheme } = useAppState();
  if (pathname?.startsWith("/s/")) return null;

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    trackEvent("theme_changed", { theme: next });
  };

  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="fixed bottom-[18px] left-6 z-[500] flex items-center justify-center w-10 h-10 rounded-full border border-rule bg-bg-panel-solid text-ink-muted hover:text-ink backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
    >
      <Icon name={theme === "dark" ? "sun" : "moon"} size={16} />
    </button>
  );
}
