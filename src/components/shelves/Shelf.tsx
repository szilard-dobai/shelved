import type { Book, ShelfStyle, SortMode } from "@/lib/shelf/types";
import { WoodShelf } from "./WoodShelf";
import { MinimalShelf } from "./MinimalShelf";
import { SpinesShelf } from "./SpinesShelf";

/**
 * Dispatcher that renders the correct shelf variant without capturing a
 * dynamic component reference at the call site (keeps component identity
 * stable across renders).
 */
export function Shelf({
  style,
  books,
  userTitle,
  sortMode,
}: {
  style: ShelfStyle;
  books: Book[];
  userTitle: string;
  sortMode: SortMode;
}) {
  if (style === "minimal") {
    return <MinimalShelf books={books} userTitle={userTitle} sortMode={sortMode} />;
  }
  if (style === "spines") {
    return <SpinesShelf books={books} userTitle={userTitle} sortMode={sortMode} />;
  }
  return <WoodShelf books={books} userTitle={userTitle} sortMode={sortMode} />;
}
