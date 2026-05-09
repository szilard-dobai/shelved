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

interface SpinesShelfProps {
  books: Book[];
  userTitle: string;
  sortMode: SortMode;
  bgVariant?: BgVariant;
  showBookCount?: boolean;
  showPages?: boolean;
  showRating?: boolean;
  shareUrl?: string;
}

const SPINES_TONES: Record<
  BgVariant,
  {
    frame: string;
    ink: string;
    title: string;
    rowLabel: string;
    cabinet: string;
    plank: string;
    statsPalette: "warm" | "minimal" | "spines";
  }
> = {
  warm: {
    frame: "#241510",
    ink: "#e8d8b4",
    title: "#f2e2b4",
    rowLabel: "#d9a848",
    cabinet: "linear-gradient(180deg, #140a06 0%, #1e100a 100%)",
    plank:
      "linear-gradient(180deg, #4a2818 0%, #6a3a1e 40%, #8b4e28 60%, #3a1e10 100%)",
    statsPalette: "warm",
  },
  ink: {
    frame: "#0a0e18",
    ink: "#e0e6f4",
    title: "#f2e2b4",
    rowLabel: "#d9a848",
    cabinet: "linear-gradient(180deg, #06080f 0%, #0e1422 100%)",
    plank:
      "linear-gradient(180deg, #1c1410 0%, #2a1e16 40%, #3a2a1e 60%, #14080a 100%)",
    statsPalette: "spines",
  },
  paper: {
    frame: "#e4d3a8",
    ink: "#2a1810",
    title: "#2a1810",
    rowLabel: "#7a4a1a",
    cabinet: "linear-gradient(180deg, #c8b890 0%, #b8a880 100%)",
    plank:
      "linear-gradient(180deg, #8c6238 0%, #b08358 40%, #c89868 60%, #6a4828 100%)",
    statsPalette: "minimal",
  },
};

export function SpinesShelf({
  books,
  userTitle,
  sortMode,
  bgVariant = "warm",
  showBookCount = true,
  showPages = true,
  showRating = true,
  shareUrl,
}: SpinesShelfProps) {
  const tone = SPINES_TONES[bgVariant];
  const groups =
    sortMode === "year"
      ? groupByYear(books)
      : sortMode === "title"
        ? groupByTitle(books)
        : groupByAuthor(books);

  const rows = flowGroups(groups, sortMode, 980, 22, 44, "w2");
  const shelfRows = rows.slice(0, 5);

  return (
    <div
      className="relative overflow-hidden font-serif"
      style={{
        width: STORY_W,
        height: STORY_H,
        background: tone.frame,
        color: tone.ink,
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
            color: tone.title,
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
          background: tone.cabinet,
          boxShadow:
            "inset 0 4px 30px rgba(0,0,0,0.8), 0 0 80px rgba(0,0,0,0.5)",
        }}
      >
        {shelfRows.map((row, ri) => (
          <div key={ri} className="relative flex-1 min-h-0">
            {row.yearLabel != null && (
              <div
                className="absolute italic z-[3]"
                style={{
                  top: 6,
                  left: 14,
                  fontSize: 22,
                  color: tone.rowLabel,
                  letterSpacing: "0.03em",
                  textShadow: "0 1px 3px rgba(0,0,0,0.8)",
                }}
              >
                {row.yearLabel}
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
                background: tone.plank,
                boxShadow: "0 4px 10px rgba(0,0,0,0.7)",
              }}
            />
          </div>
        ))}
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
            bgVariant === "paper" ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.4)",
          color: "#f2e2b4",
        }}
      >
        <div>
          <div className="font-sans text-[13px] uppercase tracking-[0.3em] opacity-55">
            Make yours
          </div>
          <div className="italic mt-1" style={{ fontSize: 32 }}>
            shelved.app
          </div>
        </div>
        <div className="p-2" style={{ background: "#e8d8b4" }}>
          <QRCode size={84} bg="#e8d8b4" fg="#1a0e08" value={shareUrl} />
        </div>
      </div>
    </div>
  );
}
