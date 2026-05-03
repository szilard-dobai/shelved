import type { Book, SortMode } from "@/lib/shelf/types";
import {
  STORY_H,
  STORY_W,
  bookSeed,
  groupByAuthor,
  groupByGenre,
  groupByYear,
  packIntoRows,
} from "@/lib/shelf/helpers";
import { Spine } from "./Spine";
import { Cat } from "@/components/decor/Cat";
import { Plant } from "@/components/decor/Plant";
import { Mug } from "@/components/decor/Mug";
import { Glasses } from "@/components/decor/Glasses";
import { QRCode } from "@/components/decor/QRCode";
import { StatsPanel } from "@/components/decor/StatsPanel";

interface WoodShelfProps {
  books: Book[];
  userTitle: string;
  sortMode: SortMode;
  showPages?: boolean;
}

export function WoodShelf({
  books,
  userTitle,
  sortMode,
  showPages = true,
}: WoodShelfProps) {
  const groups =
    sortMode === "year"
      ? groupByYear(books)
      : sortMode === "author"
        ? groupByAuthor(books)
        : groupByGenre(books);

  interface Row {
    books: Book[];
    label: string | number | null;
  }
  const rows: Row[] = [];
  for (const g of groups) {
    const rowPacks = packIntoRows(g.books, 880, 28, 56);
    rowPacks.forEach((row, i) =>
      rows.push({ books: row, label: i === 0 ? (g.label ?? g.year ?? null) : null }),
    );
  }
  const shelfRows = rows.slice(0, 4);

  const shelfY0 = 260;
  const shelfH = 320;
  const shelfGap = 20;
  const shelfInnerW = 940;
  const shelfLeft = 70;

  return (
    <div
      className="relative overflow-hidden font-serif"
      style={{
        width: STORY_W,
        height: STORY_H,
        background:
          "radial-gradient(ellipse at 50% 0%, #3a2818 0%, #2a1a10 60%, #1a0e08 100%), #1a0e08",
        color: "#f2e7ce",
      }}
    >
      <div
        className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          top: -100,
          width: 1200,
          height: 800,
          background:
            "radial-gradient(ellipse, rgba(232,200,120,0.15) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-[2] px-[70px] pt-[70px]">
        <div className="text-[20px] uppercase tracking-[0.4em] opacity-60 font-sans font-normal">
          Shelved
        </div>
        <div
          className="mt-4 italic font-medium"
          style={{
            fontSize: 76,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            color: "#f4e8c8",
          }}
        >
          {userTitle}
        </div>
        <div className="mt-5 text-[22px] opacity-[0.72] font-sans tracking-[0.06em]">
          {sortMode === "year"
            ? "A year in books · sorted by date read"
            : sortMode === "author"
              ? "A year in books · sorted by author"
              : "A year in books · sorted by genre"}
        </div>
      </div>

      <div
        className="absolute"
        style={{ left: shelfLeft, top: shelfY0, width: shelfInnerW }}
      >
        {shelfRows.map((row, ri) => {
          const y = ri * (shelfH + shelfGap);
          return (
            <div
              key={ri}
              className="absolute left-0 w-full"
              style={{ top: y, height: shelfH }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.15) 40%, transparent 100%)",
                }}
              />

              {row.label != null && (
                <div
                  className="absolute italic"
                  style={{
                    top: -30,
                    right: 0,
                    fontFamily: "var(--font-cormorant), Georgia, serif",
                    fontSize: 32,
                    color: "#d9b858",
                    letterSpacing: "0.04em",
                  }}
                >
                  <span className="not-italic font-sans opacity-60 mr-[14px] text-[14px] uppercase tracking-[0.3em]">
                    {sortMode === "year" ? "Read in" : ""}
                  </span>
                  {row.label}
                </div>
              )}

              <div
                className="absolute flex items-end"
                style={{
                  bottom: 24,
                  left: 10,
                  right: 10,
                  height: shelfH - 50,
                }}
              >
                {row.books.map((b, i) => {
                  const seed = bookSeed(b, "h");
                  const h = Math.round((shelfH - 60) * (0.78 + seed * 0.22));
                  const w = b._spineWidth || 38;
                  return (
                    <Spine
                      key={b.title + i}
                      book={b}
                      height={h}
                      width={w}
                      style="wood"
                    />
                  );
                })}
                {ri === shelfRows.length - 1 && (
                  <div
                    className="ml-2 rounded-[1px]"
                    style={{
                      width: 14,
                      height: 200,
                      background:
                        "linear-gradient(90deg, #3a2818, #5a3828, #3a2818)",
                      boxShadow: "inset 0 2px 0 rgba(255,220,160,0.15)",
                    }}
                  />
                )}
              </div>

              <div
                className="absolute"
                style={{
                  bottom: 0,
                  left: -16,
                  right: -16,
                  height: 22,
                  background:
                    "linear-gradient(180deg, #6b3a1e 0%, #8b4e28 20%, #a05a30 45%, #7a421e 80%, #3a1e10 100%)",
                  boxShadow:
                    "0 8px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,220,160,0.2)",
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "repeating-linear-gradient(90deg, transparent 0 40px, rgba(0,0,0,0.08) 40px 42px, transparent 42px 90px, rgba(0,0,0,0.05) 90px 91px)",
                  }}
                />
              </div>

              {ri === 0 && <Plant x={shelfInnerW - 160} bottom={22} size={130} />}
              {ri === 1 && <Mug x={shelfInnerW - 130} bottom={22} size={80} />}
              {ri === 1 && (
                <Glasses x={12} bottom={22} size={92} color="#2a1e18" />
              )}
              {ri === 2 && (
                <Cat x={shelfInnerW - 200} bottom={22} size={140} fill="#1a0e08" />
              )}
            </div>
          );
        })}
      </div>

      <div className="absolute left-0 right-0" style={{ bottom: 140 }}>
        <StatsPanel books={books} palette="warm" showPages={showPages} />
      </div>

      <div
        className="absolute left-0 right-0 bottom-0 flex items-center justify-between"
        style={{
          height: 140,
          padding: "26px 70px",
          background: "rgba(0,0,0,0.35)",
        }}
      >
        <div>
          <div className="font-sans text-[14px] uppercase tracking-[0.3em] opacity-60">
            Make yours
          </div>
          <div
            className="italic mt-1"
            style={{ fontSize: 32, color: "#f4e8c8" }}
          >
            shelved.app
          </div>
        </div>
        <div className="p-2" style={{ background: "#f2e7ce" }}>
          <QRCode size={84} bg="#f2e7ce" fg="#1a0e08" />
        </div>
      </div>
    </div>
  );
}
