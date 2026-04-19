"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Eyebrow, Hairline, Wordmark } from "@/components/ui/typography";
import { Icon } from "@/components/ui/Icon";
import { ShelfPreview } from "@/components/ShelfPreview";
import { Shelf } from "@/components/shelves";
import { useAppState } from "@/lib/app-state";
import type { BgVariant, Book, ShelfStyle, SortMode } from "@/lib/shelf/types";
import { darken } from "@/lib/shelf/helpers";
import { trackEvent } from "@/lib/tracking";

export default function EditorPage() {
  const { state, patch } = useAppState();
  const { books, userTitle, sortMode, style, bgVariant } = state;
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    trackEvent("editor_view");
  }, []);

  const updateBook = (i: number, bookPatch: Partial<Book>) => {
    const next = books.slice();
    next[i] = { ...next[i], ...bookPatch };
    patch({ books: next });
    trackEvent("book_edited", { title: next[i].title });
  };

  const removeBook = (i: number) => {
    patch({ books: books.filter((_, j) => j !== i) });
    trackEvent("book_removed");
    setSelected(null);
  };

  const addBook = () => {
    const newBook = makeBlankBook(books.length);
    patch({ books: [newBook, ...books] });
    setSelected(0);
    trackEvent("book_added_manual");
  };

  return (
    <div className="absolute inset-0 bg-bg text-ink flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-8 py-[18px] border-b border-rule">
        <div className="flex items-center gap-5">
          <Link
            href="/import"
            className="flex items-center gap-2 text-ink-muted hover:text-ink text-[13px] font-sans"
          >
            <Icon name="arrowLeft" size={16} /> Back
          </Link>
          <div className="w-px h-5 bg-rule" />
          <Wordmark size={20} />
          <div className="font-sans text-xs text-ink-faint tracking-[0.3em] ml-2">
            STEP 2 · EDITOR
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <div className="font-sans text-[13px] text-ink-muted">
            {books.length} books ·{" "}
            {books.reduce((s, b) => s + b.pages, 0).toLocaleString()} pages
          </div>
          <Link href="/export">
            <Button variant="gold">
              <Icon name="download" size={14} />
              Export
            </Button>
          </Link>
        </div>
      </div>

      {/* Main 2-pane */}
      <div className="flex-1 flex min-h-0">
        {/* Left: gallery */}
        <div className="flex-1 min-w-0 border-r border-rule overflow-auto px-8 pt-6 pb-28">
          <div className="flex items-baseline justify-between mb-[18px]">
            <div>
              <Eyebrow>Your library</Eyebrow>
              <div className="font-serif italic text-[36px] mt-1 text-ink">
                {books.length} books
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={addBook}>
              <Icon name="plus" size={12} />
              Add book
            </Button>
          </div>

          <Hairline className="mb-5" />

          <div
            className="grid gap-5"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))" }}
          >
            {books.map((b, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className="bg-transparent border-none cursor-pointer p-0 text-left text-ink group"
              >
                {/* Mini cover */}
                <div
                  className={`aspect-[2/3] w-full p-[10px] box-border flex flex-col justify-between transition-transform group-hover:-translate-y-[3px] ${
                    selected === i ? "outline outline-2 outline-gold outline-offset-[3px]" : ""
                  }`}
                  style={{
                    background: b.spineColor,
                    boxShadow: `inset 0 0 0 1px ${
                      b.accent === "gold" ? "#d9b858" : "rgba(0,0,0,0.3)"
                    }, 0 4px 14px rgba(0,0,0,0.5)`,
                  }}
                >
                  <div>
                    <div
                      className="h-[2px] mb-2"
                      style={{
                        background:
                          b.accent === "gold"
                            ? "#d9b858"
                            : darken(b.spineColor, 0.4),
                      }}
                    />
                    <div
                      className="font-serif font-semibold text-[11px] leading-[1.15] line-clamp-3"
                      style={{
                        color: b.textColor,
                        letterSpacing: "-0.005em",
                        fontStyle: b.accent === "gold" ? "italic" : "normal",
                      }}
                    >
                      {b.title}
                    </div>
                  </div>
                  <div
                    className="font-sans text-[9px] whitespace-nowrap overflow-hidden text-ellipsis opacity-75 tracking-[0.06em]"
                    style={{ color: b.textColor }}
                  >
                    {b.author}
                  </div>
                </div>
                <div className="mt-[10px] font-sans text-[11px] text-ink-muted leading-[1.35]">
                  <div className="text-ink font-medium text-[12px] overflow-hidden text-ellipsis whitespace-nowrap">
                    {b.title}
                  </div>
                  <div className="italic opacity-70">{b.author}</div>
                  <div className="text-[10px] tracking-[0.08em] mt-[2px] opacity-55">
                    {"★".repeat(b.rating)}
                    <span className="opacity-30">
                      {"★".repeat(5 - b.rating)}
                    </span>{" "}
                    · {b.year}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: preview + controls */}
        <div
          className="flex-shrink-0 bg-bg-raised flex flex-col min-h-0"
          style={{ width: "min(54%, 760px)" }}
        >
          <div className="flex-1 flex items-center justify-center p-8 overflow-hidden min-h-0">
            <ShelfPreview>
              <Shelf
                style={style}
                books={books}
                userTitle={userTitle}
                sortMode={sortMode}
              />
            </ShelfPreview>
          </div>

          {/* Controls dock */}
          <div
            className="flex-shrink-0 px-6 pt-[18px] pb-5 border-t border-rule"
            style={{ background: "var(--color-bg-panel-solid)" }}
          >
            <div className="mb-[14px]">
              <Eyebrow className="mb-[6px] !text-[10px]">Title</Eyebrow>
              <input
                value={userTitle}
                onChange={(e) => {
                  patch({ userTitle: e.target.value });
                  trackEvent("title_edited");
                }}
                className="w-full box-border bg-transparent border-0 border-b border-rule text-ink font-serif italic text-[24px] py-1 outline-none"
              />
            </div>

            <div
              className="grid gap-[14px]"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}
            >
              <SegControl<ShelfStyle>
                label="Style"
                options={[
                  { id: "wood", label: "Wood" },
                  { id: "minimal", label: "Minimal" },
                  { id: "spines", label: "Spines" },
                ]}
                value={style}
                onChange={(v) => {
                  patch({ style: v });
                  trackEvent("shelf_style_changed", { style: v });
                }}
              />
              <SegControl<SortMode>
                label="Sort"
                options={[
                  { id: "year", label: "Date" },
                  { id: "author", label: "Author" },
                  { id: "genre", label: "Genre" },
                ]}
                value={sortMode}
                onChange={(v) => {
                  patch({ sortMode: v });
                  trackEvent("sort_changed", { sort: v });
                }}
              />
              <SegControl<BgVariant>
                label="Background"
                options={[
                  { id: "warm", label: "Warm" },
                  { id: "ink", label: "Ink" },
                  { id: "paper", label: "Paper" },
                ]}
                value={bgVariant}
                onChange={(v) => {
                  patch({ bgVariant: v });
                  trackEvent("background_changed", { background: v });
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Book edit modal */}
      {selected !== null && books[selected] && (
        <BookEditModal
          book={books[selected]}
          onClose={() => setSelected(null)}
          onChange={(p) => updateBook(selected, p)}
          onRemove={() => removeBook(selected)}
        />
      )}
    </div>
  );
}

function SegControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <Eyebrow className="mb-[6px] !text-[10px]">{label}</Eyebrow>
      <div className="flex border border-rule rounded-[2px]">
        {options.map((o, i) => {
          const active = value === o.id;
          return (
            <button
              key={o.id}
              onClick={() => onChange(o.id)}
              className={[
                "flex-1 min-w-0 py-2 px-1 text-[11px] font-sans font-medium uppercase tracking-[0.12em] whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer border-0",
                i === 0 ? "" : "border-l border-rule",
                active
                  ? "bg-ink text-bg"
                  : "bg-transparent text-ink-muted hover:text-ink",
              ].join(" ")}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BookEditModal({
  book,
  onClose,
  onChange,
  onRemove,
}: {
  book: Book;
  onClose: () => void;
  onChange: (p: Partial<Book>) => void;
  onRemove: () => void;
}) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 flex items-center justify-center z-[100]"
      style={{ background: "rgba(0,0,0,0.6)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative border border-rule p-9 w-[540px] max-w-[calc(100%-40px)] text-ink"
        style={{ background: "var(--color-bg-panel-solid)" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-transparent border-0 cursor-pointer text-ink-muted hover:text-ink"
        >
          <Icon name="x" size={20} />
        </button>
        <Eyebrow>Edit book</Eyebrow>
        <div className="flex gap-6 mt-5">
          <div
            className="w-[100px] h-[150px] flex-shrink-0 p-[10px] box-border shadow-[0_6px_20px_rgba(0,0,0,0.4)]"
            style={{ background: book.spineColor }}
          >
            <div
              className="h-[2px] mb-2"
              style={{
                background:
                  book.accent === "gold" ? "#d9b858" : darken(book.spineColor, 0.4),
              }}
            />
            <div
              className="font-serif italic font-semibold text-[12px] leading-[1.15]"
              style={{ color: book.textColor }}
            >
              {book.title}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <Field
              label="Title"
              value={book.title}
              onChange={(v) => onChange({ title: String(v) })}
            />
            <Field
              label="Author"
              value={book.author}
              onChange={(v) => onChange({ author: String(v) })}
            />
            <div className="flex gap-[14px] mt-[10px]">
              <Field
                label="Year"
                value={book.year}
                onChange={(v) => onChange({ year: +v })}
                small
              />
              <Field
                label="Rating"
                value={book.rating}
                onChange={(v) => onChange({ rating: +v })}
                small
              />
              <Field
                label="Pages"
                value={book.pages}
                onChange={(v) => onChange({ pages: +v })}
                small
              />
            </div>
          </div>
        </div>
        <Hairline className="my-[18px] mt-7" />
        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={onRemove}
            className="!text-[color:var(--color-danger)]"
          >
            Remove book
          </Button>
          <Button variant="primary" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  small,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  small?: boolean;
}) {
  return (
    <div className={`flex-1 min-w-0 ${small ? "" : "mt-[10px]"}`}>
      <div className="font-sans text-[10px] tracking-[0.2em] text-ink-faint uppercase mb-1">
        {label}
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full box-border bg-transparent border-0 border-b border-rule text-ink font-serif py-1 outline-none ${
          small ? "text-[16px]" : "text-[18px]"
        }`}
      />
    </div>
  );
}

/** Rotation of neutral, readable spine palettes used for newly-added blanks. */
const BLANK_PALETTE: Array<Pick<Book, "spineColor" | "textColor" | "accent">> = [
  { spineColor: "#3d5a3a", textColor: "#e4d8b8", accent: "none" },
  { spineColor: "#8b3a2f", textColor: "#f0e4c8", accent: "gold" },
  { spineColor: "#1a2847", textColor: "#e8d9a8", accent: "gold" },
  { spineColor: "#d4c4a0", textColor: "#3a2818", accent: "none" },
  { spineColor: "#6b8e8a", textColor: "#f4ead9", accent: "silver" },
  { spineColor: "#7a2838", textColor: "#e8d4a8", accent: "gold" },
  { spineColor: "#c9b87a", textColor: "#3a3018", accent: "none" },
];

function makeBlankBook(existingCount: number): Book {
  const now = new Date();
  const palette = BLANK_PALETTE[existingCount % BLANK_PALETTE.length];
  return {
    title: "Untitled",
    author: "Unknown author",
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    pages: 300,
    rating: 4,
    genre: "Fiction",
    ...palette,
  };
}
