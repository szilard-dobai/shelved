import type { BgVariant, Book, ShelfStyle, SortMode } from "@/lib/shelf/types";
import { WoodShelf } from "./WoodShelf";
import { MinimalShelf } from "./MinimalShelf";
import { SpinesShelf } from "./SpinesShelf";

export function Shelf({
  style,
  books,
  userTitle,
  sortMode,
  bgVariant = "warm",
  showBookCount = true,
  showPages = true,
  showRating = true,
  shareUrl,
}: {
  style: ShelfStyle;
  books: Book[];
  userTitle: string;
  sortMode: SortMode;
  bgVariant?: BgVariant;
  showBookCount?: boolean;
  showPages?: boolean;
  showRating?: boolean;
  shareUrl?: string;
}) {
  const flags = { showBookCount, showPages, showRating, shareUrl, bgVariant };
  if (style === "minimal") {
    return (
      <MinimalShelf
        books={books}
        userTitle={userTitle}
        sortMode={sortMode}
        {...flags}
      />
    );
  }
  if (style === "spines") {
    return (
      <SpinesShelf
        books={books}
        userTitle={userTitle}
        sortMode={sortMode}
        {...flags}
      />
    );
  }
  return (
    <WoodShelf
      books={books}
      userTitle={userTitle}
      sortMode={sortMode}
      {...flags}
    />
  );
}
