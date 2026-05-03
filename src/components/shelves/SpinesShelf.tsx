import type { Book, SortMode } from "@/lib/shelf/types";
import {
  STORY_H,
  STORY_W,
  bookSeed,
  groupByAuthor,
  groupByGenre,
  groupByYear,
  spineWidthFor,
} from "@/lib/shelf/helpers";
import { Spine } from "./Spine";
import { Cat } from "@/components/decor/Cat";
import { Mug } from "@/components/decor/Mug";
import { QRCode } from "@/components/decor/QRCode";
import { StatsPanel } from "@/components/decor/StatsPanel";

interface SpinesShelfProps {
  books: Book[];
  userTitle: string;
  sortMode: SortMode;
  showPages?: boolean;
}

type FlatItem =
  | { kind: "divider"; text: string | number }
  | { kind: "book"; book: Book };

interface Row {
  books: Book[];
  label: string | number | null;
  totalW: number;
}

export function SpinesShelf({
  books,
  userTitle,
  sortMode,
  showPages = true,
}: SpinesShelfProps) {
  const groups =
    sortMode === "year"
      ? groupByYear(books)
      : sortMode === "author"
        ? groupByAuthor(books)
        : groupByGenre(books);

  const flat: FlatItem[] = [];
  groups.forEach((g) => {
    flat.push({
      kind: "divider",
      text: sortMode === "year" ? (g.year ?? "") : (g.label ?? ""),
    });
    g.books.forEach((b) => flat.push({ kind: "book", book: b }));
  });

  const rowW = 980;
  const rows: Row[] = [];
  let cur: Row = { books: [], label: null, totalW: 0 };
  for (const item of flat) {
    if (item.kind === "divider") {
      if (cur.books.length) rows.push(cur);
      cur = { books: [], label: item.text, totalW: 0 };
    } else {
      const w = spineWidthFor(item.book, 22, 44, "w2");
      item.book._spineWidth2 = w;
      if (cur.totalW + w > rowW && cur.books.length > 0) {
        rows.push(cur);
        cur = { books: [], label: null, totalW: 0 };
      }
      cur.books.push(item.book);
      cur.totalW += w;
    }
  }
  if (cur.books.length) rows.push(cur);
  const shelfRows = rows.slice(0, 5);

  return (
    <div
      className="relative overflow-hidden font-serif"
      style={{
        width: STORY_W,
        height: STORY_H,
        background: "#1a0e08",
        color: "#e8d8b4",
      }}
    >
      <div className="text-center" style={{ padding: "68px 50px 40px" }}>
        <div className="text-[18px] uppercase tracking-[0.5em] opacity-55 font-sans">
          Shelved
        </div>
        <div
          className="mt-[18px] italic font-medium"
          style={{
            fontSize: 72,
            lineHeight: 1,
            letterSpacing: "-0.025em",
            color: "#f2e2b4",
          }}
        >
          {userTitle}
        </div>
      </div>

      <div
        className="absolute flex flex-col"
        style={{
          left: 50,
          right: 50,
          top: 260,
          bottom: 360,
          background: "linear-gradient(180deg, #140a06 0%, #1e100a 100%)",
          boxShadow:
            "inset 0 4px 30px rgba(0,0,0,0.8), 0 0 80px rgba(0,0,0,0.5)",
        }}
      >
        {shelfRows.map((row, ri) => (
          <div key={ri} className="relative flex-1 min-h-0">
            {row.label != null && (
              <div
                className="absolute italic z-[3]"
                style={{
                  top: 6,
                  left: 14,
                  fontSize: 22,
                  color: "#d9a848",
                  letterSpacing: "0.03em",
                  textShadow: "0 1px 3px rgba(0,0,0,0.8)",
                }}
              >
                <span className="not-italic font-sans opacity-55 mr-[10px] text-[11px] uppercase tracking-[0.3em]">
                  {sortMode === "year" ? "·" : ""}
                </span>
                {row.label}
              </div>
            )}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.1) 30%, transparent 100%)",
              }}
            />
            <div
              className="absolute flex items-end"
              style={{
                bottom: 12,
                left: 8,
                right: 8,
                height: "calc(100% - 22px)",
              }}
            >
              {row.books.map((b, i) => {
                const seed = bookSeed(b, "h2");
                const h = Math.round(220 * (0.84 + seed * 0.16));
                const w = b._spineWidth2 || 30;
                return (
                  <Spine
                    key={b.title + i}
                    book={b}
                    height={h}
                    width={w}
                    style="spines"
                  />
                );
              })}
            </div>
            <div
              className="absolute left-0 right-0"
              style={{
                bottom: 0,
                height: 12,
                background:
                  "linear-gradient(180deg, #4a2818 0%, #6a3a1e 40%, #8b4e28 60%, #3a1e10 100%)",
                boxShadow: "0 4px 10px rgba(0,0,0,0.7)",
              }}
            />
            {ri === 1 && <Cat x={60} bottom={12} size={96} fill="#0a0604" />}
            {ri === 3 && <Mug x={780} bottom={12} size={64} />}
          </div>
        ))}
      </div>

      <div className="absolute left-0 right-0" style={{ bottom: 140 }}>
        <StatsPanel books={books} palette="spines" showPages={showPages} />
      </div>

      <div
        className="absolute left-0 right-0 bottom-0 flex items-center justify-between"
        style={{
          height: 140,
          padding: "26px 70px",
          background: "rgba(0,0,0,0.4)",
        }}
      >
        <div>
          <div className="font-sans text-[13px] uppercase tracking-[0.3em] opacity-55">
            Make yours
          </div>
          <div
            className="italic mt-1"
            style={{ fontSize: 32, color: "#f2e2b4" }}
          >
            shelved.app
          </div>
        </div>
        <div className="p-2" style={{ background: "#e8d8b4" }}>
          <QRCode size={84} bg="#e8d8b4" fg="#1a0e08" />
        </div>
      </div>
    </div>
  );
}
