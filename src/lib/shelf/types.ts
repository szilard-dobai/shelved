export type ShelfStyle = "wood" | "minimal" | "spines";
export type SortMode = "year" | "author" | "genre";
export type BgVariant = "warm" | "ink" | "paper";
export type ThemeMode = "dark" | "light";

export interface Book {
  title: string;
  author: string;
  year: number;
  month: number;
  pages: number;
  rating: number;
  genre: string;
  spineColor: string;
  textColor: string;
  accent: "gold" | "silver" | "none";
  /** cached spine width after packing — set by packIntoRows */
  _spineWidth?: number;
  /** cached spine width for dense (spines-only) layout */
  _spineWidth2?: number;
}
