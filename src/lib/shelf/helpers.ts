import type { Book } from "./types";

export const STORY_W = 1080;
export const STORY_H = 1920;

export function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

export function bookSeed(b: Book, salt = ""): number {
  return hashStr(b.title + "|" + b.author + salt);
}

export interface GroupedBooks {
  label?: string;
  year?: number;
  books: Book[];
}

export function groupByYear(books: Book[]): GroupedBooks[] {
  const byYear: Record<number, Book[]> = {};
  for (const b of books) {
    (byYear[b.year] ||= []).push(b);
  }
  const years = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => b - a);
  return years.map((y) => ({
    year: y,
    books: byYear[y].slice().sort((a, b) => b.month - a.month),
  }));
}

export function groupByAuthor(books: Book[]): GroupedBooks[] {
  const byAuthor: Record<string, Book[]> = {};
  for (const b of books) {
    const key = b.author.split(" ").slice(-1)[0];
    (byAuthor[key] ||= []).push(b);
  }
  const keys = Object.keys(byAuthor).sort();
  return keys.map((k) => ({
    label: byAuthor[k][0].author,
    books: byAuthor[k],
  }));
}

export function groupByGenre(books: Book[]): GroupedBooks[] {
  const byGenre: Record<string, Book[]> = {};
  for (const b of books) {
    (byGenre[b.genre] ||= []).push(b);
  }
  const order = ["Fiction", "Sci-fi", "Nonfiction", "Memoir"];
  return order
    .filter((g) => byGenre[g])
    .map((g) => ({ label: g, books: byGenre[g] }));
}

export function spineWidthFor(
  book: Book,
  minW: number,
  maxW: number,
  salt = "w",
): number {
  const t = pagesToWidthT(book.pages);
  const jitter = (bookSeed(book, salt) - 0.5) * 0.14;
  const clamped = Math.max(0, Math.min(1, t + jitter));
  return Math.round(minW + clamped * (maxW - minW));
}

const PAGE_ANCHORS: readonly (readonly [number, number])[] = [
  [100, 0],
  [250, 0.25],
  [400, 0.75],
  [700, 1],
];

function pagesToWidthT(pages: number): number {
  if (pages <= PAGE_ANCHORS[0][0]) return PAGE_ANCHORS[0][1];
  if (pages >= PAGE_ANCHORS[PAGE_ANCHORS.length - 1][0]) return 1;
  for (let i = 0; i < PAGE_ANCHORS.length - 1; i++) {
    const [p0, t0] = PAGE_ANCHORS[i];
    const [p1, t1] = PAGE_ANCHORS[i + 1];
    if (pages <= p1) {
      return t0 + ((pages - p0) / (p1 - p0)) * (t1 - t0);
    }
  }
  return 1;
}

export function packIntoRows(
  books: Book[],
  targetWidth: number,
  minW: number,
  maxW: number,
): Book[][] {
  const rows: Book[][] = [];
  let cur: Book[] = [];
  let curW = 0;
  for (const b of books) {
    const w = spineWidthFor(b, minW, maxW, "w");
    b._spineWidth = w;
    if (curW + w > targetWidth && cur.length > 0) {
      rows.push(cur);
      cur = [];
      curW = 0;
    }
    cur.push(b);
    curW += w;
  }
  if (cur.length) rows.push(cur);
  return rows;
}

export function darken(hex: string, amt = 0.15): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const d = (v: number) => Math.max(0, Math.round(v * (1 - amt)));
  return `rgb(${d(r)}, ${d(g)}, ${d(b)})`;
}

export function lighten(hex: string, amt = 0.15): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const l = (v: number) => Math.min(255, Math.round(v + (255 - v) * amt));
  return `rgb(${l(r)}, ${l(g)}, ${l(b)})`;
}
