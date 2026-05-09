import { Fragment } from "react";
import type { BgVariant, Book, SortMode } from "@/lib/shelf/types";
import {
  STORY_H,
  STORY_W,
  groupByAuthor,
  groupByTitle,
  groupByYear,
  titleFontSize,
} from "@/lib/shelf/helpers";
import { QRCode } from "@/components/decor/QRCode";

interface MinimalShelfProps {
  books: Book[];
  userTitle: string;
  sortMode: SortMode;
  bgVariant?: BgVariant;
  showBookCount?: boolean;
  showPages?: boolean;
  showRating?: boolean;
  shareUrl?: string;
}

type Rendered =
  | { kind: "label"; text: string | number }
  | { kind: "book"; book: Book };

const MINIMAL_TONES: Record<
  BgVariant,
  {
    bg: string;
    overlay: string;
    ink: string;
    inkRgba: string;
  }
> = {
  warm: {
    bg: "#f4ead4",
    overlay:
      "radial-gradient(ellipse at 30% 20%, rgba(232,216,180,0.6), transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(180,160,120,0.25), transparent 60%)",
    ink: "#1a1410",
    inkRgba: "26,20,16",
  },
  ink: {
    bg: "#15110d",
    overlay:
      "radial-gradient(ellipse at 30% 20%, rgba(70,52,34,0.4), transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(40,30,20,0.5), transparent 60%)",
    ink: "#f0e4c4",
    inkRgba: "240,228,196",
  },
  paper: {
    bg: "#fafaf6",
    overlay:
      "radial-gradient(ellipse at 30% 20%, rgba(220,212,194,0.4), transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(200,190,170,0.2), transparent 60%)",
    ink: "#1a1410",
    inkRgba: "26,20,16",
  },
};

interface Density {
  cols: number;
  swatchW: number;
  swatchH: number;
  titleSize: number;
  authorSize: number;
  metaSize: number;
  rowGap: number;
  colGap: number;
  yearSize: number;
  showMeta: boolean;
  itemPadTop: number;
}

function pickDensity(n: number): Density {
  if (n <= 10)
    return {
      cols: 1,
      swatchW: 28,
      swatchH: 104,
      titleSize: 34,
      authorSize: 22,
      metaSize: 16,
      rowGap: 28,
      colGap: 0,
      yearSize: 64,
      showMeta: true,
      itemPadTop: 6,
    };
  if (n <= 20)
    return {
      cols: 2,
      swatchW: 22,
      swatchH: 80,
      titleSize: 26,
      authorSize: 18,
      metaSize: 14,
      rowGap: 22,
      colGap: 64,
      yearSize: 56,
      showMeta: true,
      itemPadTop: 4,
    };
  if (n <= 45)
    return {
      cols: 3,
      swatchW: 16,
      swatchH: 58,
      titleSize: 19,
      authorSize: 14,
      metaSize: 11,
      rowGap: 14,
      colGap: 44,
      yearSize: 44,
      showMeta: true,
      itemPadTop: 2,
    };
  if (n <= 60)
    return {
      cols: 4,
      swatchW: 13,
      swatchH: 46,
      titleSize: 15,
      authorSize: 12,
      metaSize: 10,
      rowGap: 10,
      colGap: 32,
      yearSize: 36,
      showMeta: true,
      itemPadTop: 1,
    };
  if (n <= 80)
    return {
      cols: 5,
      swatchW: 11,
      swatchH: 36,
      titleSize: 13,
      authorSize: 11,
      metaSize: 9,
      rowGap: 8,
      colGap: 22,
      yearSize: 28,
      showMeta: false,
      itemPadTop: 1,
    };
  return {
    cols: 6,
    swatchW: 9,
    swatchH: 30,
    titleSize: 11,
    authorSize: 10,
    metaSize: 8,
    rowGap: 6,
    colGap: 16,
    yearSize: 24,
    showMeta: false,
    itemPadTop: 0,
  };
}

export function MinimalShelf({
  books,
  userTitle,
  sortMode,
  bgVariant = "warm",
  showBookCount = true,
  showPages = true,
  showRating = true,
  shareUrl,
}: MinimalShelfProps) {
  const tone = MINIMAL_TONES[bgVariant];
  const density = pickDensity(books.length);
  const groups =
    sortMode === "year"
      ? groupByYear(books)
      : sortMode === "title"
        ? groupByTitle(books)
        : groupByAuthor(books);

  const rendered: Rendered[] = [];
  groups.forEach((g) => {
    if (sortMode === "year") {
      rendered.push({ kind: "label", text: g.year ?? "" });
    }
    g.books.forEach((b) => rendered.push({ kind: "book", book: b }));
  });

  const everyHasPages = books.length > 0 && books.every((b) => b.pages != null);
  const everyHasRating = books.length > 0 && books.every((b) => b.rating > 0);
  const showPagesStat = showPages && everyHasPages;
  const showRatingStat = showRating && everyHasRating;
  const pages = books.reduce((s, b) => s + (b.pages ?? 0), 0);
  const avg = books.length
    ? (books.reduce((s, b) => s + b.rating, 0) / books.length).toFixed(1)
    : "0.0";
  const stats: { k: string; l: string }[] = [];
  if (showBookCount) stats.push({ k: String(books.length), l: "books" });
  if (showPagesStat) stats.push({ k: pages.toLocaleString(), l: "pages" });
  if (showRatingStat) stats.push({ k: avg, l: "avg rating" });

  return (
    <div
      className="relative overflow-hidden font-serif"
      style={{
        width: STORY_W,
        height: STORY_H,
        background: tone.bg,
        color: tone.ink,
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: tone.overlay }}
      />

      <div
        className="relative text-center"
        style={{ padding: "72px 80px 32px" }}
      >
        <div className="text-[18px] uppercase tracking-[0.6em] opacity-55 font-sans">
          — Shelved —
        </div>
        <div
          className="mt-6 italic font-medium"
          style={{
            fontSize: titleFontSize(userTitle, 80),
            lineHeight: 1,
            letterSpacing: "-0.035em",
          }}
        >
          {userTitle}
        </div>
        {stats.length > 0 && (
          <div
            className="mt-[26px] flex items-center justify-center font-sans uppercase opacity-65"
            style={{
              fontSize: 14,
              letterSpacing: "0.22em",
              gap: 18,
            }}
          >
            {stats.map((it, i, arr) => (
              <Fragment key={it.l}>
                <span>
                  <span className="font-medium">{it.k}</span>
                  <span className="ml-[6px] opacity-70">{it.l}</span>
                </span>
                {i < arr.length - 1 && <span className="opacity-40">·</span>}
              </Fragment>
            ))}
          </div>
        )}
        <div
          className="mx-auto mt-[28px] h-px opacity-40"
          style={{ width: 60, background: tone.ink }}
        />
      </div>

      <div
        className="absolute overflow-hidden"
        style={{ left: 0, right: 0, top: 310, bottom: 156 }}
      >
        <div
          className="grid"
          style={{
            padding: "0 80px",
            gridTemplateColumns: `repeat(${density.cols}, 1fr)`,
            columnGap: density.colGap,
            rowGap: density.rowGap,
          }}
        >
          {rendered.map((r, i) => {
            if (r.kind === "label") {
              return (
                <div
                  key={"l" + i}
                  className="flex items-baseline gap-5"
                  style={{
                    gridColumn: "1 / -1",
                    marginTop: i === 0 ? 0 : Math.max(8, density.rowGap * 1.2),
                    marginBottom: 4,
                  }}
                >
                  <div
                    className="italic font-medium"
                    style={{
                      fontSize: density.yearSize,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {r.text}
                  </div>
                  <div
                    className="flex-1 h-px opacity-[0.25]"
                    style={{ background: tone.ink }}
                  />
                </div>
              );
            }
            const b = r.book;
            const accentShadow =
              b.accent === "gold"
                ? "inset 0 0 0 1px rgba(217,184,88,0.8)"
                : b.accent === "silver"
                  ? "inset 0 0 0 1px rgba(200,200,208,0.7)"
                  : "inset 0 -1px 0 rgba(0,0,0,0.12)";
            return (
              <div
                key={"b" + i}
                className="flex items-start"
                style={{ gap: Math.max(8, density.swatchW * 0.7) }}
              >
                <div
                  className="flex-shrink-0"
                  style={{
                    width: density.swatchW,
                    height: density.swatchH,
                    background: b.spineColor,
                    boxShadow: accentShadow,
                  }}
                />
                <div
                  className="min-w-0 flex-1"
                  style={{ paddingTop: density.itemPadTop }}
                >
                  <div
                    className="font-medium"
                    style={{
                      fontSize: density.titleSize,
                      lineHeight: 1.18,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {b.title}
                  </div>
                  <div
                    className="italic opacity-[0.65]"
                    style={{
                      fontSize: density.authorSize,
                      lineHeight: 1.2,
                      marginTop: 2,
                    }}
                  >
                    {b.author}
                  </div>
                  {density.showMeta && (
                    <div
                      className="flex items-center font-sans opacity-55 tracking-[0.12em]"
                      style={{
                        fontSize: density.metaSize,
                        gap: 6,
                        marginTop: 3,
                      }}
                    >
                      {"★".repeat(b.rating)}
                      <span className="opacity-30">
                        {"★".repeat(5 - b.rating)}
                      </span>
                      {showPages && b.pages != null && (
                        <span style={{ marginLeft: 4 }}>· {b.pages}p</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className="absolute left-0 right-0 bottom-0 flex items-center justify-between"
        style={{
          height: 140,
          padding: "26px 80px",
          background: tone.bg,
          borderTop: `1px solid rgba(${tone.inkRgba},0.18)`,
        }}
      >
        <div>
          <div className="font-sans text-[13px] uppercase tracking-[0.3em] opacity-55">
            Make yours
          </div>
          <div className="italic mt-1" style={{ fontSize: 32 }}>
            shelved.ink
          </div>
        </div>
        <QRCode size={84} bg={tone.bg} fg={tone.ink} value={shareUrl} />
      </div>
    </div>
  );
}
