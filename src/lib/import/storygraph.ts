import { parse } from "csv-parse/browser/esm/sync";
import type { Book } from "@/lib/shelf/types";
import {
  type ImportResult,
  clampRating,
  paletteFor,
  parseDateYM,
  sortAndCap,
} from "./shared";

export function parseStorygraphCsv(text: string): ImportResult {
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
    if (r["Read Status"] !== "read") continue;
    totalRead++;

    const parsed = parseDateYM(r["Last Date Read"] || r["Date Added"]);
    const title = r["Title"]?.trim();
    const author = firstAuthor(r["Authors"]);
    if (!parsed || !title || !author) {
      skipped++;
      continue;
    }

    books.push({
      title,
      author,
      year: parsed.year,
      month: parsed.month,
      rating: clampRating(r["Star Rating"]),
      genre: "Fiction",
      ...paletteFor(title, author),
    });
  }

  const { books: sorted, capped } = sortAndCap(books);
  return { books: sorted, totalRead, skipped: skipped + capped };
}

function firstAuthor(raw: string | undefined): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  const comma = trimmed.indexOf(",");
  return (comma === -1 ? trimmed : trimmed.slice(0, comma)).trim();
}
