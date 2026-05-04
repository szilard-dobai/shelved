import { Fragment } from "react";
import type { Book } from "@/lib/shelf/types";

type Palette = "warm" | "minimal" | "spines";

const palettes: Record<
  Palette,
  { bg: string; fg: string; rule: string }
> = {
  warm: {
    bg: "rgba(40,26,18,0.78)",
    fg: "#f2e7ce",
    rule: "rgba(242,231,206,0.25)",
  },
  minimal: {
    bg: "#1a1410",
    fg: "#f4ead4",
    rule: "rgba(244,234,212,0.2)",
  },
  spines: {
    bg: "rgba(26,18,12,0.88)",
    fg: "#e8d8b4",
    rule: "rgba(232,216,180,0.22)",
  },
};

export function StatsPanel({
  books,
  palette = "warm",
  showBookCount = true,
  showPages = true,
  showRating = true,
}: {
  books: Book[];
  palette?: Palette;
  showBookCount?: boolean;
  showPages?: boolean;
  showRating?: boolean;
}) {
  const total = books.length;
  const everyHasPages = total > 0 && books.every((b) => b.pages != null);
  const everyHasRating = total > 0 && books.every((b) => b.rating > 0);
  const pages = books.reduce((s, b) => s + (b.pages ?? 0), 0);
  const avg = total ? (books.reduce((s, b) => s + b.rating, 0) / total).toFixed(1) : "0.0";
  const p = palettes[palette];
  const items: { k: string; l: string }[] = [];
  if (showBookCount) items.push({ k: String(total), l: "books" });
  if (showPages && everyHasPages) {
    items.push({ k: pages.toLocaleString(), l: "pages" });
  }
  if (showRating && everyHasRating) items.push({ k: avg, l: "avg rating" });
  if (items.length === 0) return null;
  return (
    <div
      className="flex justify-between items-center px-12 py-7 font-serif"
      style={{
        background: p.bg,
        color: p.fg,
        borderTop: `1px solid ${p.rule}`,
        borderBottom: `1px solid ${p.rule}`,
      }}
    >
      {items.map((it, i) => (
        <Fragment key={it.l}>
          <div className="text-center flex-1">
            <div className="text-[68px] font-medium leading-none tracking-[-0.02em]">
              {it.k}
            </div>
            <div className="text-[18px] uppercase tracking-[0.24em] mt-2 opacity-75 font-sans font-normal">
              {it.l}
            </div>
          </div>
          {i < items.length - 1 && (
            <div className="w-px h-[60px]" style={{ background: p.rule }} />
          )}
        </Fragment>
      ))}
    </div>
  );
}
