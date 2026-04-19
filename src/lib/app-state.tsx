"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  BgVariant,
  Book,
  ShelfStyle,
  SortMode,
  ThemeMode,
} from "@/lib/shelf/types";
import { SAMPLE_BOOKS } from "@/data/sample-books";

const STORAGE_KEY = "shelved_app_state_v1";
const THEME_KEY = "shelved_theme";
const OWNED_KEY = "shelved_owned_shares";

export interface AppState {
  books: Book[];
  userTitle: string;
  sortMode: SortMode;
  style: ShelfStyle;
  bgVariant: BgVariant;
}

const DEFAULT_STATE: AppState = {
  books: SAMPLE_BOOKS,
  userTitle: "Sarah's year in books",
  sortMode: "year",
  style: "wood",
  bgVariant: "warm",
};

interface AppStateContextValue {
  state: AppState;
  setState: (next: AppState | ((prev: AppState) => AppState)) => void;
  patch: (partial: Partial<AppState>) => void;
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  ownedShares: Record<string, string>;
  rememberShare: (slug: string, editKey: string) => void;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

function applyThemeClass(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("light", mode === "light");
  root.classList.toggle("dark", mode === "dark");
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setStateRaw] = useState<AppState>(DEFAULT_STATE);
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [ownedShares, setOwnedShares] = useState<Record<string, string>>({});
  const [hydrated, setHydrated] = useState(false);

  // Hydrate persisted state from localStorage after mount. Calling setState
  // inside the effect is the idiomatic bootstrap pattern here — the alternative
  // (lazy useState initializer) would cause SSR/client hydration mismatch.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setStateRaw({ ...DEFAULT_STATE, ...JSON.parse(raw) });
    } catch {}
    try {
      const t = localStorage.getItem(THEME_KEY) as ThemeMode | null;
      if (t === "dark" || t === "light") {
        setThemeState(t);
        applyThemeClass(t);
      } else {
        applyThemeClass("dark");
      }
    } catch {
      applyThemeClass("dark");
    }
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

  const setTheme = useCallback((t: ThemeMode) => {
    setThemeState(t);
    applyThemeClass(t);
    try {
      localStorage.setItem(THEME_KEY, t);
    } catch {}
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

  const value = useMemo<AppStateContextValue>(
    () => ({ state, setState, patch, theme, setTheme, ownedShares, rememberShare }),
    [state, setState, patch, theme, setTheme, ownedShares, rememberShare],
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
