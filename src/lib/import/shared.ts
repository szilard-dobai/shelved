import type { Book } from "@/lib/shelf/types";

export const PALETTE: Array<Pick<Book, "spineColor" | "textColor" | "accent">> =
  [
    { spineColor: "#1a2847", textColor: "#e8d9a8", accent: "gold" },
    { spineColor: "#d4c4a0", textColor: "#3a2818", accent: "none" },
    { spineColor: "#6b8e8a", textColor: "#f4ead9", accent: "silver" },
    { spineColor: "#8b3a2f", textColor: "#f0e4c8", accent: "gold" },
    { spineColor: "#c9b87a", textColor: "#3a3018", accent: "none" },
    { spineColor: "#2d4a3a", textColor: "#e8d4a0", accent: "gold" },
    { spineColor: "#1e1e24", textColor: "#d9a84a", accent: "gold" },
    { spineColor: "#3d5a3a", textColor: "#e4d8b8", accent: "none" },
    { spineColor: "#b84a28", textColor: "#f4e8d0", accent: "none" },
    { spineColor: "#0f2a3a", textColor: "#c8a858", accent: "gold" },
    { spineColor: "#5a6b88", textColor: "#f0e8d4", accent: "silver" },
    { spineColor: "#d9b84a", textColor: "#2a1e0a", accent: "none" },
    { spineColor: "#e4c8a0", textColor: "#4a2818", accent: "none" },
    { spineColor: "#4a6b3a", textColor: "#f0e4c4", accent: "none" },
    { spineColor: "#7a2838", textColor: "#e8d4a8", accent: "gold" },
    { spineColor: "#2a3a5a", textColor: "#e4c878", accent: "none" },
    { spineColor: "#8b4a28", textColor: "#f4e4b8", accent: "gold" },
    { spineColor: "#c84a3a", textColor: "#f0e4c4", accent: "none" },
    { spineColor: "#e8a858", textColor: "#2a1808", accent: "none" },
    { spineColor: "#d98b88", textColor: "#3a1818", accent: "none" },
    { spineColor: "#1a1a2a", textColor: "#c8d4e8", accent: "silver" },
    { spineColor: "#8ba0b8", textColor: "#f4ead4", accent: "none" },
    { spineColor: "#4a688b", textColor: "#f0e4b8", accent: "gold" },
    { spineColor: "#2a4a4a", textColor: "#e4d4a8", accent: "none" },
  ];

export const MAX_BOOKS = 1500;

export interface ImportResult {
  books: Book[];
  totalRead: number;
  skipped: number;
}

export function parseDateYM(
  s: string | undefined,
): { year: number; month: number } | null {
  if (!s) return null;
  const match = s.match(/^(\d{4})\/(\d{1,2})/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!year || month < 1 || month > 12) return null;
  return { year, month };
}

export function parseIntOr(s: string | undefined, fallback: number): number {
  const n = parseInt(s ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function parseOptionalInt(s: string | undefined): number | null {
  const n = parseInt(s ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function clampRating(raw: string | number | undefined): number {
  const n = typeof raw === "number" ? raw : parseFloat(raw ?? "");
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(5, Math.round(n)));
}

export function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function paletteFor(title: string, author: string) {
  return PALETTE[hashStr(`${title}|${author}`) % PALETTE.length];
}

export function sortAndCap(books: Book[]): { books: Book[]; capped: number } {
  books.sort((a, b) => b.year * 12 + b.month - (a.year * 12 + a.month));
  if (books.length > MAX_BOOKS) {
    const capped = books.length - MAX_BOOKS;
    books.length = MAX_BOOKS;
    return { books, capped };
  }
  return { books, capped: 0 };
}
