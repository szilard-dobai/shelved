"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Eyebrow, Hairline, Wordmark } from "@/components/ui/typography";
import { Icon } from "@/components/ui/Icon";
import { ShelfPreview } from "@/components/ShelfPreview";
import { Shelf } from "@/components/shelves";
import { useAppState } from "@/lib/app-state";
import { useIsMobile } from "@/lib/use-media";
import type { BgVariant, Book, ShelfStyle, SortMode } from "@/lib/shelf/types";
import { darken } from "@/lib/shelf/helpers";
import { trackEvent } from "@/lib/tracking";

type MobileTab = "books" | "preview";

type EditingState =
  | { mode: "edit"; index: number; initial: Book }
  | { mode: "create"; initial: Book };

export default function EditorPage() {
  const { state, patch } = useAppState();
  const { books, userTitle, sortMode, style, bgVariant } = state;
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>("books");
  const mobile = useIsMobile();

  useEffect(() => {
    trackEvent("editor_view");
  }, []);

  const openEdit = (i: number) => {
    setEditing({ mode: "edit", index: i, initial: books[i] });
  };

  const openCreate = () => {
    setEditing({ mode: "create", initial: makeBlankBook(books.length) });
  };

  const saveBook = (updated: Book) => {
    if (!editing) return;
    if (editing.mode === "create") {
      patch({ books: [updated, ...books] });
      trackEvent("book_added_manual");
    } else {
      const next = books.slice();
      next[editing.index] = updated;
      patch({ books: next });
      trackEvent("book_edited", { title: updated.title });
    }
    setEditing(null);
  };

  const editingIndex = editing?.mode === "edit" ? editing.index : null;

  return (
    <div className="bg-bg text-ink flex flex-col md:h-[100dvh]">
      <div className="sticky top-0 z-10 bg-bg flex-shrink-0 md:static">
        <div className="flex items-center justify-between px-4 py-[14px] md:px-8 md:py-[18px] border-b border-rule gap-2">
          <div className="flex items-center gap-[10px] md:gap-5 min-w-0">
            <Link
              href="/import"
              className="flex items-center gap-2 text-ink-muted hover:text-ink text-[13px] font-sans"
              aria-label="Back"
            >
              <Icon name="arrowLeft" size={16} />
              <span className="hidden md:inline">Back</span>
            </Link>
            <div className="hidden md:block w-px h-5 bg-rule" />
            <Wordmark size={20} className="!text-[18px] md:!text-[20px]" />
            <div className="hidden md:block font-sans text-xs text-ink-faint tracking-[0.3em] ml-2">
              STEP 2 · EDITOR
            </div>
          </div>
          <div className="flex gap-3 items-center flex-shrink-0">
            <div className="hidden md:block font-sans text-[13px] text-ink-muted">
              {books.length} books ·{" "}
              {books.reduce((s, b) => s + b.pages, 0).toLocaleString()} pages
            </div>
            <Link href="/export">
              <Button variant="gold" size={mobile ? "sm" : "md"}>
                <Icon name="download" size={14} />
                Export
              </Button>
            </Link>
          </div>
        </div>

        <div className="md:hidden flex border-b border-rule">
          {[
            { id: "books" as const, label: "Books" },
            { id: "preview" as const, label: "Preview" },
          ].map((tab) => {
            const active = mobileTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setMobileTab(tab.id)}
                className={[
                  "flex-1 py-3 bg-transparent border-0 font-sans text-[11px] font-medium uppercase tracking-[0.24em] cursor-pointer",
                  "border-b-2",
                  active
                    ? "border-gold text-ink"
                    : "border-transparent text-ink-muted",
                ].join(" ")}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col md:flex-1 md:flex-row md:min-h-0">
        <div
          className={[
            "min-w-0 md:flex-1 md:overflow-auto",
            "border-b md:border-b-0 md:border-r border-rule",
            "px-4 pt-[18px] pb-10 md:px-8 md:pt-6 md:pb-28",
            mobile && mobileTab !== "books" ? "hidden" : "block",
          ].join(" ")}
        >
          <div className="flex items-baseline justify-between mb-[18px]">
            <div>
              <Eyebrow>Your library</Eyebrow>
              <div className="font-serif italic text-[36px] mt-1 text-ink">
                {books.length} books
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={openCreate}>
              <Icon name="plus" size={12} />
              Add book
            </Button>
          </div>

          <Hairline className="mb-5" />

          <div className="grid gap-[14px] md:gap-5 [grid-template-columns:repeat(auto-fill,minmax(100px,1fr))] md:[grid-template-columns:repeat(auto-fill,minmax(130px,1fr))]">
            {books.map((b, i) => (
              <button
                key={i}
                onClick={() => openEdit(i)}
                className="bg-transparent border-none cursor-pointer p-0 text-left text-ink group"
              >
                <div
                  className={`aspect-[2/3] w-full p-[10px] box-border flex flex-col justify-between transition-transform group-hover:-translate-y-[3px] ${
                    editingIndex === i
                      ? "outline outline-2 outline-gold outline-offset-[3px]"
                      : ""
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

        <div
          className={[
            "flex-shrink-0 bg-bg-raised flex-col md:min-h-0",
            "w-full md:w-[min(54%,760px)]",
            mobile && mobileTab !== "preview" ? "hidden" : "flex",
          ].join(" ")}
        >
          <div className="flex items-center justify-center p-4 md:p-8 md:flex-1 md:overflow-hidden md:min-h-0">
            <ShelfPreview
              fitMode={mobile ? "viewport" : "height"}
              heightOffset={mobile ? 280 : 220}
              widthOffset={40}
              maxScale={mobile ? 0.38 : 0.5}
            >
              <Shelf
                style={style}
                books={books}
                userTitle={userTitle}
                sortMode={sortMode}
              />
            </ShelfPreview>
          </div>

          <div
            className="flex-shrink-0 px-4 pt-[14px] pb-20 md:px-6 md:pt-[18px] md:pb-5 border-t border-rule"
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
                className="w-full box-border bg-transparent border-0 border-b border-rule text-ink font-serif italic text-[20px] md:text-[24px] py-1 outline-none"
              />
            </div>

            <div className="grid gap-[10px] md:gap-[14px] [grid-template-columns:repeat(auto-fit,minmax(110px,1fr))] md:[grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
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

      {editing && (
        <BookEditModal
          initial={editing.initial}
          mode={editing.mode}
          onClose={() => setEditing(null)}
          onSave={saveBook}
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
  initial,
  mode,
  onClose,
  onSave,
}: {
  initial: Book;
  mode: "edit" | "create";
  onClose: () => void;
  onSave: (book: Book) => void;
}) {
  const [draft, setDraft] = useState<Book>(initial);
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);

  const TITLE_PLACEHOLDER = "Untitled";
  const AUTHOR_PLACEHOLDER = "Unknown author";

  const isDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(initial),
    [draft, initial],
  );

  const updateDraft = (partial: Partial<Book>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
  };

  const requestClose = () => {
    if (isDirty) {
      setConfirmingDiscard(true);
    } else {
      onClose();
    }
  };

  return (
    <>
      <div
        onClick={requestClose}
        className="fixed inset-0 flex items-end md:items-center justify-center z-[100]"
        style={{ background: "rgba(0,0,0,0.6)" }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative border border-rule p-6 md:p-9 w-full md:w-[540px] md:max-w-[calc(100%-40px)] max-h-[92vh] md:max-h-none overflow-y-auto md:overflow-visible text-ink"
          style={{ background: "var(--color-bg-panel-solid)" }}
        >
          <button
            onClick={requestClose}
            aria-label="Close"
            className="absolute top-4 right-4 bg-transparent border-0 cursor-pointer text-ink-muted hover:text-ink"
          >
            <Icon name="x" size={20} />
          </button>
          <Eyebrow>{mode === "create" ? "Add a book" : "Edit book"}</Eyebrow>
          <div className="flex flex-col md:flex-row gap-[18px] md:gap-6 mt-5 items-center md:items-stretch">
            <div
              className="w-20 h-[120px] md:w-[100px] md:h-[150px] flex-shrink-0 p-[10px] box-border shadow-[0_6px_20px_rgba(0,0,0,0.4)]"
              style={{ background: draft.spineColor }}
            >
              <div
                className="h-[2px] mb-2"
                style={{
                  background:
                    draft.accent === "gold"
                      ? "#d9b858"
                      : darken(draft.spineColor, 0.4),
                }}
              />
              <div
                className="font-serif italic font-semibold text-[12px] leading-[1.15]"
                style={{
                  color: draft.textColor,
                  opacity: draft.title.trim() ? 1 : 0.5,
                }}
              >
                {draft.title.trim() || TITLE_PLACEHOLDER}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <Field
                label="Title"
                value={draft.title}
                onChange={(v) => updateDraft({ title: v })}
                placeholder={TITLE_PLACEHOLDER}
              />
              <Field
                label="Author"
                value={draft.author}
                onChange={(v) => updateDraft({ author: v })}
                placeholder={AUTHOR_PLACEHOLDER}
              />
              <div className="flex gap-[14px] mt-[10px]">
                <Field
                  label="Year"
                  value={draft.year}
                  onChange={(v) => updateDraft({ year: +v })}
                  small
                />
                <Field
                  label="Rating"
                  value={draft.rating}
                  onChange={(v) => updateDraft({ rating: +v })}
                  small
                />
                <Field
                  label="Pages"
                  value={draft.pages}
                  onChange={(v) => updateDraft({ pages: +v })}
                  small
                />
              </div>
            </div>
          </div>
          <Hairline className="my-[18px] mt-7" />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={requestClose}>
              Cancel
            </Button>
            <Button
              variant="gold"
              onClick={() =>
                onSave({
                  ...draft,
                  title: draft.title.trim() || TITLE_PLACEHOLDER,
                  author: draft.author.trim() || AUTHOR_PLACEHOLDER,
                })
              }
            >
              {mode === "create" ? "Add book" : "Save changes"}
            </Button>
          </div>
        </div>
      </div>

      {confirmingDiscard && (
        <div
          onClick={() => setConfirmingDiscard(false)}
          className="fixed inset-0 z-[110] flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.55)" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="border border-rule p-6 md:p-7 w-full max-w-[380px] text-ink text-center"
            style={{ background: "var(--color-bg-panel-solid)" }}
          >
            <Eyebrow className="mb-3">Discard changes?</Eyebrow>
            <p className="font-serif italic text-[18px] text-ink-muted mb-6 leading-[1.45]">
              {mode === "create"
                ? "This book hasn't been added yet. Close anyway?"
                : "Your edits to this book will be lost."}
            </p>
            <div className="flex justify-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setConfirmingDiscard(false)}
              >
                Keep editing
              </Button>
              <Button variant="danger" size="sm" onClick={onClose}>
                Discard
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  small,
  placeholder,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  small?: boolean;
  placeholder?: string;
}) {
  return (
    <div className={`flex-1 min-w-0 ${small ? "" : "mt-[10px]"}`}>
      <div className="font-sans text-[10px] tracking-[0.2em] text-ink-faint uppercase mb-1">
        {label}
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full box-border bg-transparent border-0 border-b border-rule text-ink font-serif py-1 outline-none placeholder:text-ink-faint placeholder:italic ${
          small ? "text-[16px]" : "text-[18px]"
        }`}
      />
    </div>
  );
}

const BLANK_PALETTE: Array<Pick<Book, "spineColor" | "textColor" | "accent">> =
  [
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
    title: "",
    author: "",
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    pages: 300,
    rating: 4,
    genre: "Fiction",
    ...palette,
  };
}
