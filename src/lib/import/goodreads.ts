import { parse } from "csv-parse/browser/esm/sync";
import type { Book } from "@/lib/shelf/types";
import {
  type ImportResult,
  clampRating,
  paletteFor,
  parseDateYM,
  parseOptionalInt,
  sortAndCap,
} from "./shared";

export function parseGoodreadsCsv(text: string): ImportResult {
  const records = parse(text, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    trim: true,
  }) as Record<string, string>[];

  let totalRead = 0;
  let skipped = 0;
  const books: Book[] = [];

  for (const r of records) {
    if (r["Exclusive Shelf"] !== "read") continue;
    totalRead++;

    const parsed = parseDateYM(r["Date Read"] || r["Date Added"]);
    const title = r["Title"]?.trim();
    const author = r["Author"]?.trim();
    if (!parsed || !title || !author) {
      skipped++;
      continue;
    }

    const pages = parseOptionalInt(r["Number of Pages"]);
    books.push({
      title,
      author,
      year: parsed.year,
      month: parsed.month,
      ...(pages != null ? { pages } : {}),
      rating: clampRating(r["My Rating"]),
      genre: "Fiction",
      ...paletteFor(title, author),
    });
  }

  const { books: sorted, capped } = sortAndCap(books);
  return { books: sorted, totalRead, skipped: skipped + capped };
}
