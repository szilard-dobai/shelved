"use client";

import { useSyncExternalStore } from "react";

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

export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 779px)");
}
