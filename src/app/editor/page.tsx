"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const { state, patch, resetEditor, hydrated, ownedShares, forgetShare } =
    useAppState();
  const { books, userTitle, sortMode, style, bgVariant } = state;
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>("books");
  const [settingsOpen, setSettingsOpen] = useState(false);
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
    <div className="flex flex-col bg-bg text-ink md:h-[100dvh]">
      <header className="sticky top-0 z-10 flex-shrink-0 bg-bg md:static">
        <div className="flex items-center justify-between gap-2 border-b border-rule px-4 py-3.5 md:px-8 md:py-4">
          <div className="flex min-w-0 items-center gap-2.5 md:gap-5">
            <Link
              href="/import"
              className="flex items-center gap-2 font-sans text-md text-ink-muted hover:text-ink"
              aria-label="Back"
            >
              <Icon name="arrowLeft" size={16} />
              <span className="hidden md:inline">Back</span>
            </Link>
            <div className="hidden h-5 w-px bg-rule md:block" />
            <Wordmark size={mobile ? 18 : 20} />
            <div className="ml-2 hidden font-sans text-xs tracking-eyebrow text-ink-faint md:block">
              STEP 2 · EDITOR
            </div>
          </div>
          <div className="flex flex-shrink-0 items-center gap-3">
            <div
              className="hidden font-sans text-md text-ink-muted md:block"
              style={{ visibility: hydrated ? undefined : "hidden" }}
            >
              {(() => {
                const parts: string[] = [];
                if (state.showBookCount) parts.push(`${books.length} books`);
                if (
                  state.showPages &&
                  books.length > 0 &&
                  books.every((b) => b.pages != null)
                ) {
                  parts.push(
                    `${books.reduce((s, b) => s + (b.pages ?? 0), 0).toLocaleString()} pages`,
                  );
                }
                return parts.join(" · ");
              })()}
            </div>
            <Link href="/export">
              <Button variant="gold" size="sm" className="!py-1.5">
                <Icon name="download" size={14} />
                Export
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex border-b border-rule md:hidden">
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
                  "flex-1 cursor-pointer border-0 border-b-2 bg-transparent py-3 font-sans text-xs font-medium uppercase tracking-widest",
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
      </header>

      <div
        className="flex flex-col md:flex-1 md:flex-row md:min-h-0"
        aria-busy={!hydrated}
        style={{ visibility: hydrated ? undefined : "hidden" }}
      >
        <section
          className={[
            "border-b border-rule px-4 pt-4 pb-10 md:border-b-0 md:border-r md:flex-1 md:overflow-auto md:px-8 md:pt-6 md:pb-28",
            "min-w-0",
            mobile && mobileTab !== "books" ? "hidden" : "block",
          ].join(" ")}
        >
          <div className="mb-4 flex items-baseline justify-between">
            <div>
              <Eyebrow>Your library</Eyebrow>
              <div className="mt-1 font-serif text-4xl italic text-ink">
                {books.length} books
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={openCreate}>
                <Icon name="plus" size={12} />
                Add book
              </Button>
              <button
                onClick={() => setSettingsOpen(true)}
                aria-label="Library settings"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-2xs border border-rule-strong bg-transparent text-ink-muted hover:text-ink"
              >
                <Icon name="settings" size={14} />
              </button>
            </div>
          </div>

          <Hairline className="mb-5" />

          {books.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-14 text-center md:py-20">
              <Eyebrow className="!text-2xs">Empty shelf</Eyebrow>
              <p className="max-w-sm font-serif text-xl italic leading-snug text-ink-muted md:text-2xl">
                Start adding the books you&apos;ve read.
              </p>
              <div className="mt-2 flex flex-col items-center gap-3.5">
                <Button variant="gold" onClick={openCreate}>
                  <Icon name="plus" size={14} />
                  Add a book
                </Button>
                <Link
                  href="/import"
                  className="font-sans text-sm text-ink-muted underline underline-offset-4 hover:text-ink"
                >
                  or import a list →
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(6.25rem,1fr))] md:gap-5 md:[grid-template-columns:repeat(auto-fill,minmax(8.125rem,1fr))]">
              {books.map((b, i) => (
                <BookCard
                  key={i}
                  book={b}
                  selected={editingIndex === i}
                  onClick={() => openEdit(i)}
                />
              ))}
            </div>
          )}
        </section>

        <section
          className={[
            "w-full flex-shrink-0 flex-col bg-bg-raised md:w-[min(54%,47.5rem)] md:min-h-0",
            mobile && mobileTab !== "preview" ? "hidden" : "flex",
          ].join(" ")}
        >
          <div className="flex items-center justify-center p-4 md:flex-1 md:overflow-hidden md:p-8 md:min-h-0">
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
                showBookCount={state.showBookCount}
                showPages={state.showPages}
                showRating={state.showRating}
              />
            </ShelfPreview>
          </div>

          <div className="flex-shrink-0 border-t border-rule bg-bg-panel-solid px-4 pt-3.5 pb-20 md:px-6 md:pt-4 md:pb-5">
            <div className="mb-3.5">
              <Eyebrow className="mb-1.5 !text-2xs">Title</Eyebrow>
              <input
                value={userTitle}
                onChange={(e) => {
                  patch({ userTitle: e.target.value });
                  trackEvent("title_edited");
                }}
                className="box-border w-full border-0 border-b border-rule bg-transparent py-1 font-serif text-xl italic text-ink outline-none md:text-2xl"
              />
            </div>

            <div className="grid gap-2.5 [grid-template-columns:repeat(auto-fit,minmax(6.875rem,1fr))] md:gap-3.5 md:[grid-template-columns:repeat(auto-fit,minmax(9.375rem,1fr))]">
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
              <div>
                <Eyebrow className="mb-1.5 !text-2xs">Stats</Eyebrow>
                <div className="flex flex-wrap gap-1.5">
                  <StatChip
                    label="Books"
                    active={state.showBookCount}
                    onToggle={() =>
                      patch({ showBookCount: !state.showBookCount })
                    }
                  />
                  <StatChip
                    label="Pages"
                    active={state.showPages}
                    onToggle={() => patch({ showPages: !state.showPages })}
                  />
                  <StatChip
                    label="Rating"
                    active={state.showRating}
                    onToggle={() => patch({ showRating: !state.showRating })}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {editing && (
        <BookEditModal
          initial={editing.initial}
          mode={editing.mode}
          onClose={() => setEditing(null)}
          onSave={saveBook}
        />
      )}

      {settingsOpen && (
        <SettingsModal
          onClose={() => setSettingsOpen(false)}
          onClearLibrary={() => {
            patch({ books: [], currentSlug: null });
            trackEvent("library_cleared");
            setSettingsOpen(false);
          }}
          onStartNew={() => {
            resetEditor();
            trackEvent("shelf_reset");
            setSettingsOpen(false);
          }}
          ownedShares={ownedShares}
          currentSlug={state.currentSlug}
          onForgetShare={(slug) => {
            if (state.currentSlug === slug) patch({ currentSlug: null });
            forgetShare(slug);
          }}
        />
      )}
    </div>
  );
}

function BookCard({
  book,
  selected,
  onClick,
}: {
  book: Book;
  selected: boolean;
  onClick: () => void;
}) {
  const accentColor = book.accent === "gold" ? "#d9b858" : null;
  return (
    <button
      onClick={onClick}
      className="group cursor-pointer border-none bg-transparent p-0 text-left text-ink"
    >
      <div
        className={[
          "box-border flex aspect-[2/3] w-full flex-col justify-between p-2.5 transition-transform group-hover:-translate-y-0.5",
          selected
            ? "outline outline-2 outline-offset-4 outline-gold"
            : "",
        ].join(" ")}
        style={{
          background: book.spineColor,
          boxShadow: `inset 0 0 0 1px ${
            accentColor ?? "rgba(0,0,0,0.3)"
          }, 0 0.25rem 0.875rem rgba(0,0,0,0.5)`,
        }}
      >
        <div>
          <div
            className="mb-2 h-0.5"
            style={{
              background: accentColor ?? darken(book.spineColor, 0.4),
            }}
          />
          <div
            className="line-clamp-3 font-serif text-xs font-semibold leading-cover"
            style={{
              color: book.textColor,
              letterSpacing: "-0.005em",
              fontStyle: book.accent === "gold" ? "italic" : "normal",
            }}
          >
            {book.title}
          </div>
        </div>
        <div
          className="overflow-hidden text-ellipsis whitespace-nowrap font-sans text-2xs tracking-wide opacity-75"
          style={{ color: book.textColor }}
        >
          {book.author}
        </div>
      </div>
      <div className="mt-2.5 font-sans text-xs leading-snug text-ink-muted">
        <div className="overflow-hidden text-ellipsis whitespace-nowrap text-xs font-medium text-ink">
          {book.title}
        </div>
        <div className="italic opacity-70">{book.author}</div>
        <div className="mt-0.5 text-2xs tracking-wide opacity-55">
          {"★".repeat(book.rating)}
          <span className="opacity-30">{"★".repeat(5 - book.rating)}</span> ·{" "}
          {book.year}
        </div>
      </div>
    </button>
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
      <Eyebrow className="mb-1.5 !text-2xs">{label}</Eyebrow>
      <div className="flex rounded-xs border border-rule">
        {options.map((o, i) => {
          const active = value === o.id;
          return (
            <button
              key={o.id}
              onClick={() => onChange(o.id)}
              className={[
                "flex-1 min-w-0 cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap border-0 px-1 py-2 font-sans text-xs font-medium uppercase tracking-wider",
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

function StatChip({
  label,
  active,
  onToggle,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={active}
      className={[
        "cursor-pointer rounded-2xs border px-3 py-1.5 font-sans text-2xs uppercase tracking-widest transition-colors",
        active
          ? "border-ink bg-ink text-bg"
          : "border-rule bg-transparent text-ink-muted hover:border-rule-strong hover:text-ink",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

const TITLE_PLACEHOLDER = "Untitled";
const AUTHOR_PLACEHOLDER = "Unknown author";

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

  const accentColor = draft.accent === "gold" ? "#d9b858" : null;

  return (
    <>
      <div
        onClick={requestClose}
        className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 md:items-center"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative max-h-[92vh] w-full overflow-y-auto border border-rule bg-bg-panel-solid p-6 text-ink md:max-h-none md:w-[33.75rem] md:max-w-[calc(100%-2.5rem)] md:overflow-visible md:p-9"
        >
          <button
            onClick={requestClose}
            aria-label="Close"
            className="absolute right-4 top-4 cursor-pointer border-0 bg-transparent text-ink-muted hover:text-ink"
          >
            <Icon name="x" size={20} />
          </button>
          <Eyebrow>{mode === "create" ? "Add a book" : "Edit book"}</Eyebrow>
          <div className="mt-5 flex flex-col items-center gap-4 md:flex-row md:items-stretch md:gap-6">
            <div
              className="box-border h-[7.5rem] w-20 flex-shrink-0 p-2.5 shadow-[0_0.375rem_1.25rem_rgba(0,0,0,0.4)] md:h-[9.375rem] md:w-[6.25rem]"
              style={{ background: draft.spineColor }}
            >
              <div
                className="mb-2 h-0.5"
                style={{
                  background: accentColor ?? darken(draft.spineColor, 0.4),
                }}
              />
              <div
                className="font-serif text-xs font-semibold italic leading-cover"
                style={{
                  color: draft.textColor,
                  opacity: draft.title.trim() ? 1 : 0.5,
                }}
              >
                {draft.title.trim() || TITLE_PLACEHOLDER}
              </div>
            </div>
            <div className="min-w-0 flex-1">
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
              <div className="mt-2.5 flex gap-3.5">
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
                  value={draft.pages ?? ""}
                  onChange={(v) => {
                    const n = parseInt(v, 10);
                    updateDraft({
                      pages: Number.isFinite(n) && n > 0 ? n : undefined,
                    });
                  }}
                  small
                  placeholder="—"
                />
              </div>
            </div>
          </div>
          <Hairline className="my-4 mt-7" />
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
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/55 px-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm border border-rule bg-bg-panel-solid p-6 text-center text-ink md:p-7"
          >
            <Eyebrow className="mb-3">Discard changes?</Eyebrow>
            <p className="mb-6 font-serif text-lg italic leading-snug text-ink-muted">
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
    <div className={`min-w-0 flex-1 ${small ? "" : "mt-2.5"}`}>
      <div className="mb-1 font-sans text-2xs uppercase tracking-widest text-ink-faint">
        {label}
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`box-border w-full border-0 border-b border-rule bg-transparent py-1 font-serif text-ink outline-none placeholder:italic placeholder:text-ink-faint ${
          small ? "text-base" : "text-lg"
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

function SettingsModal({
  onClose,
  onClearLibrary,
  onStartNew,
  ownedShares,
  currentSlug,
  onForgetShare,
}: {
  onClose: () => void;
  onClearLibrary: () => void;
  onStartNew: () => void;
  ownedShares: Record<string, string>;
  currentSlug: string | null;
  onForgetShare: (slug: string) => void;
}) {
  const router = useRouter();
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [confirmingStartNew, setConfirmingStartNew] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const slugs = Object.keys(ownedShares);

  const copyEditLink = async (slug: string, editKey: string) => {
    try {
      const url = `${window.location.origin}/s/${slug}?edit=${editKey}`;
      await navigator.clipboard.writeText(url);
      setCopiedSlug(slug);
      setTimeout(
        () => setCopiedSlug((current) => (current === slug ? null : current)),
        1500,
      );
      trackEvent("edit_link_copied");
    } catch {}
  };

  const handleDelete = async (slug: string, editKey: string) => {
    if (deleteBusy) return;
    setDeleteBusy(true);
    setDeleteError(null);
    try {
      const res = await fetch(
        `/api/shares/${slug}?edit=${encodeURIComponent(editKey)}`,
        { method: "DELETE" },
      );
      if (!res.ok && res.status !== 404) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? `Delete failed (${res.status})`);
      }
      onForgetShare(slug);
      trackEvent("share_deleted");
      setDeletingSlug(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleteBusy(false);
    }
  };

  const cancelDelete = () => {
    setDeletingSlug(null);
    setDeleteError(null);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 md:items-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[92vh] w-full overflow-y-auto border border-rule bg-bg-panel-solid p-6 text-ink md:max-h-none md:w-[33.75rem] md:max-w-[calc(100%-2.5rem)] md:overflow-visible md:p-9"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 cursor-pointer border-0 bg-transparent text-ink-muted hover:text-ink"
        >
          <Icon name="x" size={20} />
        </button>
        <Eyebrow>Library settings</Eyebrow>

        <div className="mt-6">
          <Eyebrow className="mb-2 !text-2xs">Library</Eyebrow>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <p className="font-serif text-base italic leading-snug text-ink-muted">
                Remove every book from this library. Style, sort and title stay
                put.
              </p>
              {!confirmingClear ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setConfirmingClear(true);
                    setConfirmingStartNew(false);
                  }}
                  className="flex-shrink-0 whitespace-nowrap"
                >
                  <Icon name="trash" size={12} />
                  Clear all
                </Button>
              ) : (
                <div className="flex flex-shrink-0 gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setConfirmingClear(false)}
                  >
                    Cancel
                  </Button>
                  <Button variant="danger" size="sm" onClick={onClearLibrary}>
                    Confirm
                  </Button>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between gap-4">
              <p className="font-serif text-base italic leading-snug text-ink-muted">
                Start a brand new shelf — wipes books, title and style and
                unbinds any published share.
              </p>
              {!confirmingStartNew ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setConfirmingStartNew(true);
                    setConfirmingClear(false);
                  }}
                  className="flex-shrink-0 whitespace-nowrap"
                >
                  <Icon name="sparkle" size={12} />
                  Start new
                </Button>
              ) : (
                <div className="flex flex-shrink-0 gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setConfirmingStartNew(false)}
                  >
                    Cancel
                  </Button>
                  <Button variant="danger" size="sm" onClick={onStartNew}>
                    Confirm
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <Hairline className="my-6" />

        <div>
          <Eyebrow className="mb-2 !text-2xs">Published shelves</Eyebrow>
          {slugs.length === 0 ? (
            <p className="font-serif text-base italic leading-snug text-ink-muted">
              You haven&apos;t published a shelf yet. Once you do, the edit
              links will live here.
            </p>
          ) : (
            <ul className="divide-y divide-rule">
              {slugs.map((slug) => {
                const editKey = ownedShares[slug];
                const copied = copiedSlug === slug;
                const confirming = deletingSlug === slug;
                const isCurrent = currentSlug === slug;
                return (
                  <li
                    key={slug}
                    className="flex flex-col gap-1.5 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/s/${slug}`}
                        target="_blank"
                        className="min-w-0 flex-1 truncate font-mono text-xs text-ink underline-offset-2 hover:underline"
                      >
                        /s/{slug}
                      </Link>
                      {confirming ? (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={cancelDelete}
                            disabled={deleteBusy}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(slug, editKey)}
                            disabled={deleteBusy}
                          >
                            {deleteBusy ? "Deleting…" : "Delete"}
                          </Button>
                        </>
                      ) : (
                        <>
                          {isCurrent ? (
                            <span className="font-sans text-2xs uppercase tracking-eyebrow text-gold">
                              Editing
                            </span>
                          ) : (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() =>
                                router.push(
                                  `/s/${slug}?edit=${encodeURIComponent(editKey)}`,
                                )
                              }
                            >
                              Open
                            </Button>
                          )}
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => copyEditLink(slug, editKey)}
                          >
                            {copied ? (
                              <>
                                <Icon name="check" size={12} /> Copied
                              </>
                            ) : (
                              <>Copy edit link</>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setDeletingSlug(slug);
                              setDeleteError(null);
                            }}
                            aria-label={`Delete ${slug}`}
                          >
                            <Icon name="trash" size={14} />
                          </Button>
                        </>
                      )}
                    </div>
                    {confirming && deleteError && (
                      <p className="font-sans text-xs text-danger">
                        {deleteError}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

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
