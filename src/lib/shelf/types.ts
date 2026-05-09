export type ShelfStyle = "wood" | "minimal" | "spines";
export type SortMode = "year" | "author" | "title";
export type BgVariant = "warm" | "ink" | "paper";

export interface Book {
  title: string;
  author: string;
  year: number;
  month: number;
  pages?: number;
  rating: number;
  genre: string;
  spineColor: string;
  textColor: string;
  accent: "gold" | "silver" | "none";
  _spineWidth?: number;
  _spineWidth2?: number;
}
