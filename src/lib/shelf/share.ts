import { createHash, randomBytes } from "node:crypto";
import type { BgVariant, Book, ShelfStyle, SortMode } from "./types";

export interface ShareDoc {
  slug: string;
  editKeyHash: string;
  books: Book[];
  userTitle: string;
  sortMode: SortMode;
  style: ShelfStyle;
  bgVariant: BgVariant;
  showBookCount: boolean;
  showPages: boolean;
  showRating: boolean;
  yearFilter: number | null;
  createdAt: Date;
  updatedAt: Date;
  views?: number;
}

export interface SharePayload {
  books: Book[];
  userTitle: string;
  sortMode: SortMode;
  style: ShelfStyle;
  bgVariant: BgVariant;
  showBookCount: boolean;
  showPages: boolean;
  showRating: boolean;
  yearFilter: number | null;
}

export function hashEditKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export function generateEditKey(): string {
  return randomBytes(12).toString("base64url");
}

export function sanitizePayload(input: unknown): SharePayload | null {
  if (!input || typeof input !== "object") return null;
  const o = input as Record<string, unknown>;

  if (!Array.isArray(o.books) || o.books.length === 0 || o.books.length > 2000) {
    return null;
  }
  if (typeof o.userTitle !== "string" || o.userTitle.length > 200) return null;
  const sortMode = o.sortMode === "genre" ? "year" : o.sortMode;
  if (!isSortMode(sortMode)) return null;
  const style = o.style === "spines" ? "wood" : o.style;
  if (!isShelfStyle(style)) return null;
  if (!isBgVariant(o.bgVariant)) return null;

  const books: Book[] = [];
  for (const raw of o.books) {
    const b = raw as Record<string, unknown>;
    if (
      typeof b.title !== "string" ||
      typeof b.author !== "string" ||
      typeof b.year !== "number" ||
      typeof b.month !== "number" ||
      (b.pages !== undefined && typeof b.pages !== "number") ||
      typeof b.rating !== "number" ||
      typeof b.genre !== "string" ||
      typeof b.spineColor !== "string" ||
      typeof b.textColor !== "string" ||
      !isAccent(b.accent)
    ) {
      return null;
    }
    books.push({
      title: b.title.slice(0, 300),
      author: b.author.slice(0, 200),
      year: b.year,
      month: b.month,
      ...(typeof b.pages === "number" ? { pages: b.pages } : {}),
      rating: b.rating,
      genre: b.genre.slice(0, 50),
      spineColor: b.spineColor.slice(0, 20),
      textColor: b.textColor.slice(0, 20),
      accent: b.accent,
    });
  }

  const yearFilter =
    typeof o.yearFilter === "number" && Number.isFinite(o.yearFilter)
      ? Math.trunc(o.yearFilter)
      : null;

  return {
    books,
    userTitle: o.userTitle,
    sortMode,
    style,
    bgVariant: o.bgVariant,
    showBookCount: o.showBookCount !== false,
    showPages: o.showPages !== false,
    showRating: o.showRating !== false,
    yearFilter,
  };
}

function isSortMode(v: unknown): v is SortMode {
  return v === "year" || v === "author" || v === "title";
}
function isShelfStyle(v: unknown): v is ShelfStyle {
  return v === "wood" || v === "minimal";
}
function isBgVariant(v: unknown): v is BgVariant {
  return v === "warm" || v === "ink" || v === "paper";
}
function isAccent(v: unknown): v is Book["accent"] {
  return v === "gold" || v === "silver" || v === "none";
}
