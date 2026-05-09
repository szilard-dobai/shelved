import type { BgVariant, Book, SortMode } from "@/lib/shelf/types";
import {
  STORY_H,
  STORY_W,
  bookSeed,
  flowGroups,
  groupByAuthor,
  groupByTitle,
  groupByYear,
} from "@/lib/shelf/helpers";
import { Spine } from "./Spine";
import { QRCode } from "@/components/decor/QRCode";
import { StatsPanel } from "@/components/decor/StatsPanel";

interface WoodShelfProps {
  books: Book[];
  userTitle: string;
  sortMode: SortMode;
  bgVariant?: BgVariant;
  showBookCount?: boolean;
  showPages?: boolean;
  showRating?: boolean;
  shareUrl?: string;
}

const WOOD_TONES: Record<
  BgVariant,
  {
    wall: string;
    glow: string;
    ink: string;
    inkAccent: string;
    plank: string;
    bookend: string;
    statsPalette: "warm" | "minimal" | "spines";
  }
> = {
  warm: {
    wall: "radial-gradient(ellipse at 50% 0%, #3a2818 0%, #2a1a10 60%, #1a0e08 100%), #1a0e08",
    glow: "rgba(232,200,120,0.15)",
    ink: "#f4e8c8",
    inkAccent: "#d9b858",
    plank:
      "linear-gradient(180deg, #6b3a1e 0%, #8b4e28 20%, #a05a30 45%, #7a421e 80%, #3a1e10 100%)",
    bookend: "linear-gradient(90deg, #3a2818, #5a3828, #3a2818)",
    statsPalette: "warm",
  },
  ink: {
    wall: "radial-gradient(ellipse at 50% 0%, #1c2440 0%, #0e1424 55%, #060912 100%), #060912",
    glow: "rgba(190,210,255,0.10)",
    ink: "#e8eef8",
    inkAccent: "#d9b858",
    plank:
      "linear-gradient(180deg, #2a1c14 0%, #3a2a1e 20%, #44321e 45%, #2a1c14 80%, #100a08 100%)",
    bookend: "linear-gradient(90deg, #1a1208, #2a1c10, #1a1208)",
    statsPalette: "spines",
  },
  paper: {
    wall: "radial-gradient(ellipse at 50% 0%, #f4e6c4 0%, #e4d3a8 55%, #cab98a 100%), #cab98a",
    glow: "rgba(255,240,200,0.4)",
    ink: "#2a1810",
    inkAccent: "#7a4a1a",
    plank:
      "linear-gradient(180deg, #b8884a 0%, #d2a06a 20%, #dcae7a 45%, #b88858 80%, #6a4828 100%)",
    bookend: "linear-gradient(90deg, #8c6238, #a8784c, #8c6238)",
    statsPalette: "minimal",
  },
};

export function WoodShelf({
  books,
  userTitle,
  sortMode,
  bgVariant = "warm",
  showBookCount = true,
  showPages = true,
  showRating = true,
  shareUrl,
}: WoodShelfProps) {
  const tone = WOOD_TONES[bgVariant];
  const groups =
    sortMode === "year"
      ? groupByYear(books)
      : sortMode === "title"
        ? groupByTitle(books)
        : groupByAuthor(books);

  const rows = flowGroups(groups, sortMode, 880, 28, 56, "w");
  const shelfRows = rows.slice(0, 5);

  const shelfY0 = 240;
  const shelfH = 260;
  const shelfGap = 20;
  const shelfInnerW = 940;
  const shelfLeft = 70;

  return (
    <div
      className="relative overflow-hidden font-serif"
      style={{
        width: STORY_W,
        height: STORY_H,
        background: tone.wall,
        color: tone.ink,
      }}
    >
      <div
        className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          top: -100,
          width: 1200,
          height: 800,
          background: `radial-gradient(ellipse, ${tone.glow} 0%, transparent 70%)`,
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
            color: tone.ink,
          }}
        >
          {userTitle}
        </div>
        <div className="mt-5 text-[22px] opacity-[0.72] font-sans tracking-[0.06em]">
          {sortMode === "year"
            ? "A year in books · sorted by date read"
            : sortMode === "title"
              ? "A year in books · sorted by title"
              : "A year in books · sorted by author"}
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

              {row.yearLabel != null && (
                <div
                  className="absolute italic"
                  style={{
                    top: 8,
                    right: 4,
                    fontFamily: "var(--font-cormorant), Georgia, serif",
                    fontSize: 22,
                    color: tone.inkAccent,
                    letterSpacing: "0.04em",
                  }}
                >
                  <span className="not-italic font-sans opacity-60 mr-[10px] text-[11px] uppercase tracking-[0.3em]">
                    Read in
                  </span>
                  {row.yearLabel}
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
                      height: 150,
                      background: tone.bookend,
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
                  background: tone.plank,
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

            </div>
          );
        })}
      </div>

      <div className="absolute left-0 right-0" style={{ bottom: 140 }}>
        <StatsPanel
          books={books}
          palette={tone.statsPalette}
          showBookCount={showBookCount}
          showPages={showPages}
          showRating={showRating}
        />
      </div>

      <div
        className="absolute left-0 right-0 bottom-0 flex items-center justify-between"
        style={{
          height: 140,
          padding: "26px 70px",
          background:
            bgVariant === "paper" ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.35)",
          color: "#f4e8c8",
        }}
      >
        <div>
          <div className="font-sans text-[14px] uppercase tracking-[0.3em] opacity-60">
            Make yours
          </div>
          <div className="italic mt-1" style={{ fontSize: 32 }}>
            shelved.app
          </div>
        </div>
        <div className="p-2" style={{ background: "#f2e7ce" }}>
          <QRCode size={84} bg="#f2e7ce" fg="#1a0e08" value={shareUrl} />
        </div>
      </div>
    </div>
  );
}
