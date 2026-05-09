"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { BgVariant, Book, ShelfStyle, SortMode } from "@/lib/shelf/types";
import { SAMPLE_BOOKS } from "@/data/sample-books";

const STORAGE_KEY = "shelved_app_state_v1";
const OWNED_KEY = "shelved_owned_shares";

export interface AppState {
  books: Book[];
  userTitle: string;
  sortMode: SortMode;
  style: ShelfStyle;
  bgVariant: BgVariant;
  showBookCount: boolean;
  showPages: boolean;
  showRating: boolean;
  currentSlug: string | null;
}

const DEFAULT_STATE: AppState = {
  books: SAMPLE_BOOKS,
  userTitle: "Sarah's year in books",
  sortMode: "year",
  style: "wood",
  bgVariant: "warm",
  showBookCount: true,
  showPages: true,
  showRating: true,
  currentSlug: null,
};

interface AppStateContextValue {
  state: AppState;
  setState: (next: AppState | ((prev: AppState) => AppState)) => void;
  patch: (partial: Partial<AppState>) => void;
  resetEditor: () => void;
  loadDemo: () => void;
  ownedShares: Record<string, string>;
  rememberShare: (slug: string, editKey: string) => void;
  forgetShare: (slug: string) => void;
  hydrated: boolean;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setStateRaw] = useState<AppState>(DEFAULT_STATE);
  const [ownedShares, setOwnedShares] = useState<Record<string, string>>({});
  const [hydrated, setHydrated] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.sortMode === "genre") parsed.sortMode = "year";
        if (parsed.style === "spines") parsed.style = "wood";
        setStateRaw({ ...DEFAULT_STATE, ...parsed });
      }
    } catch {}
    try {
      const raw = localStorage.getItem(OWNED_KEY);
      if (raw) setOwnedShares(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state, hydrated]);

  const setState = useCallback(
    (next: AppState | ((prev: AppState) => AppState)) => {
      setStateRaw((prev) =>
        typeof next === "function" ? (next as (p: AppState) => AppState)(prev) : next,
      );
    },
    [],
  );

  const patch = useCallback((partial: Partial<AppState>) => {
    setStateRaw((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetEditor = useCallback(() => {
    setStateRaw({ ...DEFAULT_STATE, books: [] });
  }, []);

  const loadDemo = useCallback(() => {
    setStateRaw({ ...DEFAULT_STATE });
  }, []);

  const rememberShare = useCallback((slug: string, editKey: string) => {
    setOwnedShares((prev) => {
      const next = { ...prev, [slug]: editKey };
      try {
        localStorage.setItem(OWNED_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const forgetShare = useCallback((slug: string) => {
    setOwnedShares((prev) => {
      const next = { ...prev };
      delete next[slug];
      try {
        localStorage.setItem(OWNED_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const value = useMemo<AppStateContextValue>(
    () => ({
      state,
      setState,
      patch,
      resetEditor,
      loadDemo,
      ownedShares,
      rememberShare,
      forgetShare,
      hydrated,
    }),
    [
      state,
      setState,
      patch,
      resetEditor,
      loadDemo,
      ownedShares,
      rememberShare,
      forgetShare,
      hydrated,
    ],
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
