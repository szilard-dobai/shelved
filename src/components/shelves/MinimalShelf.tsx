import { Fragment } from "react";
import type { Book, SortMode } from "@/lib/shelf/types";
import {
  STORY_H,
  STORY_W,
  groupByAuthor,
  groupByGenre,
  groupByYear,
} from "@/lib/shelf/helpers";
import { QRCode } from "@/components/decor/QRCode";

interface MinimalShelfProps {
  books: Book[];
  userTitle: string;
  sortMode: SortMode;
  showPages?: boolean;
}

type Rendered =
  | { kind: "label"; text: string | number }
  | { kind: "book"; book: Book };

export function MinimalShelf({
  books,
  userTitle,
  sortMode,
  showPages = true,
}: MinimalShelfProps) {
  const groups =
    sortMode === "year"
      ? groupByYear(books)
      : sortMode === "author"
        ? groupByAuthor(books)
        : groupByGenre(books);

  const rendered: Rendered[] = [];
  groups.forEach((g) => {
    rendered.push({
      kind: "label",
      text: sortMode === "year" ? (g.year ?? "") : (g.label ?? ""),
    });
    g.books.forEach((b) => rendered.push({ kind: "book", book: b }));
  });

  const everyHasPages = books.length > 0 && books.every((b) => b.pages != null);
  const showPagesStat = showPages && everyHasPages;
  const pages = books.reduce((s, b) => s + (b.pages ?? 0), 0);
  const avg = books.length
    ? (books.reduce((s, b) => s + b.rating, 0) / books.length).toFixed(1)
    : "0.0";

  return (
    <div
      className="relative overflow-hidden font-serif"
      style={{
        width: STORY_W,
        height: STORY_H,
        background: "#f4ead4",
        color: "#1a1410",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(232,216,180,0.6), transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(180,160,120,0.25), transparent 60%)",
        }}
      />

      <div className="relative text-center" style={{ padding: "88px 80px 40px" }}>
        <div className="text-[18px] uppercase tracking-[0.6em] opacity-55 font-sans">
          — Shelved —
        </div>
        <div
          className="mt-7 italic font-medium"
          style={{ fontSize: 88, lineHeight: 1, letterSpacing: "-0.035em" }}
        >
          {userTitle}
        </div>
        <div className="mt-[18px] text-[22px] opacity-[0.62] font-sans uppercase tracking-[0.18em]">
          {sortMode === "year"
            ? "by date read"
            : sortMode === "author"
              ? "by author"
              : "by genre"}
        </div>
        <div
          className="mx-auto mt-[38px] h-px opacity-40"
          style={{ width: 60, background: "#1a1410" }}
        />
      </div>

      <div
        className="grid"
        style={{
          padding: "24px 80px 24px",
          gridTemplateColumns: "repeat(3, 1fr)",
          columnGap: 44,
          rowGap: 14,
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
                  marginTop: i === 0 ? 0 : 24,
                  marginBottom: 4,
                }}
              >
                <div
                  className="italic font-medium"
                  style={{ fontSize: 44, letterSpacing: "-0.01em" }}
                >
                  {r.text}
                </div>
                <div
                  className="flex-1 h-px opacity-[0.25]"
                  style={{ background: "#1a1410" }}
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
            <div key={"b" + i} className="flex items-start gap-[14px]">
              <div
                className="flex-shrink-0"
                style={{
                  width: 16,
                  height: 58,
                  background: b.spineColor,
                  boxShadow: accentShadow,
                }}
              />
              <div className="min-w-0 flex-1 pt-[2px]">
                <div
                  className="font-medium line-clamp-2"
                  style={{
                    fontSize: 19,
                    lineHeight: 1.15,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {b.title}
                </div>
                <div className="italic opacity-[0.65] mt-1 text-[14px] whitespace-nowrap overflow-hidden text-ellipsis">
                  {b.author}
                </div>
                <div className="mt-1 flex items-center gap-[6px] text-[11px] font-sans opacity-55 tracking-[0.12em]">
                  {"★".repeat(b.rating)}
                  <span className="opacity-30">{"★".repeat(5 - b.rating)}</span>
                  {showPages && b.pages != null && (
                    <span className="ml-[6px]">· {b.pages}p</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute left-0 right-0" style={{ bottom: 140 }}>
        <div
          className="flex justify-around items-baseline"
          style={{
            padding: "36px 80px 32px",
            borderTop: "1px solid rgba(26,20,16,0.2)",
            borderBottom: "1px solid rgba(26,20,16,0.2)",
          }}
        >
          {[
            { k: String(books.length), l: "books" },
            ...(showPagesStat
              ? [{ k: pages.toLocaleString(), l: "pages" }]
              : []),
            { k: avg, l: "avg rating" },
          ].map((it, i, arr) => (
            <Fragment key={it.l}>
              <div className="text-center">
                <div
                  className="font-medium italic"
                  style={{
                    fontSize: 72,
                    lineHeight: 1,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {it.k}
                </div>
                <div className="mt-[10px] text-[13px] uppercase tracking-[0.3em] opacity-60 font-sans">
                  {it.l}
                </div>
              </div>
              {i < arr.length - 1 && (
                <div
                  className="w-px h-[50px]"
                  style={{ background: "rgba(26,20,16,0.25)" }}
                />
              )}
            </Fragment>
          ))}
        </div>
      </div>

      <div
        className="absolute left-0 right-0 bottom-0 flex items-center justify-between"
        style={{ height: 140, padding: "26px 80px" }}
      >
        <div>
          <div className="font-sans text-[13px] uppercase tracking-[0.3em] opacity-55">
            Make yours
          </div>
          <div className="italic mt-1" style={{ fontSize: 32 }}>
            shelved.app
          </div>
        </div>
        <QRCode size={84} bg="#f4ead4" fg="#1a1410" />
      </div>
    </div>
  );
}
