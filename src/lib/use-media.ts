"use client";

import { useSyncExternalStore } from "react";

/**
 * Reactive `matches` for a media query. Uses `useSyncExternalStore` so SSR
 * is safe (returns the provided server default during first paint) and the
 * store stays in sync with viewport changes without setState-in-effect noise.
 */
function subscribe(query: string) {
  return (notify: () => void) => {
    const mq = window.matchMedia(query);
    mq.addEventListener("change", notify);
    return () => mq.removeEventListener("change", notify);
  };
}

function getSnapshot(query: string): boolean {
  return window.matchMedia(query).matches;
}

export function useMediaQuery(query: string, serverDefault = false): boolean {
  return useSyncExternalStore(
    subscribe(query),
    () => getSnapshot(query),
    () => serverDefault,
  );
}

/**
 * True when viewport is ≤ 779px (matches the design's `md:` cutoff at 780).
 * SSR-safe: returns false during server render / first client paint, then
 * resolves to the real value post-hydration.
 */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 779px)");
}
