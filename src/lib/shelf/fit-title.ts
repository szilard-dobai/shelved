/**
 * Fit-to-spine typography. Given a title and the space available inside a
 * book spine (width perpendicular to the text flow, height along the text
 * flow), return the font size + row split that renders the *entire* title.
 *
 * Never truncates. Prefers one row at base font; if that doesn't fit, shrinks
 * the font (down to a readability floor) before falling back to multiple rows
 * of vertical text side-by-side.
 */

export interface TitleFit {
  fontSize: number;
  rows: string[];
}

interface FitOptions {
  /** Spine width in px (perpendicular to vertical text flow). */
  spineWidth: number;
  /** Height available for the vertical text (along the text flow). */
  availHeight: number;
  /** Preferred font size when there's room. Clamped internally. */
  baseFontSize: number;
  /** Minimum font size before we prefer adding rows over shrinking further. */
  minReadable?: number;
  /** Absolute minimum font size for last-resort fallbacks. */
  absoluteMin?: number;
  /** Horizontal padding between text and spine edges. */
  hPad?: number;
  /** Vertical padding at the top/bottom of the text region. */
  vPad?: number;
}

const ROW_WIDTH_FACTOR = 1.3; // char glyph block-size + inter-row spacing, per font unit
const CHAR_HEIGHT_FACTOR = 0.7; // vertical-writing character inline-size per font unit

/**
 * Core fitting algorithm. For each font size from base → min, packs the
 * title into rows that each respect the vertical character capacity at that
 * font, then accepts the first font whose resulting row count fits the
 * spine's horizontal budget.
 *
 * Prefers larger font + more rows over tiny font + fewer rows.
 */
export function fitTitle(title: string, opts: FitOptions): TitleFit {
  const {
    spineWidth,
    availHeight,
    baseFontSize,
    minReadable = 9,
    absoluteMin = 6,
    hPad = 5,
    vPad = 4,
  } = opts;

  const widthBudget = Math.max(0, spineWidth - hPad);
  const heightBudget = Math.max(0, availHeight - vPad);

  // Phase 1: readable fonts, word-based packing.
  for (let fs = baseFontSize; fs >= minReadable; fs -= 0.5) {
    const result = tryFit(title, fs, widthBudget, heightBudget, "words");
    if (result) return result;
  }

  // Phase 2: below readable floor, still word-based.
  for (let fs = minReadable - 0.5; fs >= absoluteMin; fs -= 0.5) {
    const result = tryFit(title, fs, widthBudget, heightBudget, "words");
    if (result) return result;
  }

  // Phase 3: last-resort char-splitting (single word too long for any font).
  for (let fs = baseFontSize; fs >= absoluteMin; fs -= 0.5) {
    const result = tryFit(title, fs, widthBudget, heightBudget, "chars");
    if (result) return result;
  }

  // Absolute fallback: smallest font, char-split, whatever rows fit.
  const fs = absoluteMin;
  const charsPerRow = Math.max(1, Math.floor(heightBudget / (fs * CHAR_HEIGHT_FACTOR)));
  return { fontSize: fs, rows: splitByChars(title, charsPerRow) };
}

function tryFit(
  title: string,
  fs: number,
  widthBudget: number,
  heightBudget: number,
  mode: "words" | "chars",
): TitleFit | null {
  const charsPerRow = Math.max(1, Math.floor(heightBudget / (fs * CHAR_HEIGHT_FACTOR)));
  const rowWidth = fs * ROW_WIDTH_FACTOR;

  const rows =
    mode === "words"
      ? packByWords(title, charsPerRow)
      : splitByChars(title, charsPerRow);

  if (!rows) return null; // word-mode returned null — a single word was too long
  if (rows.length * rowWidth > widthBudget) return null;
  return { fontSize: fs, rows };
}

/**
 * Pack a title into rows where each row's character count is ≤ `charsPerRow`,
 * breaking only on word boundaries. Returns null if any single word exceeds
 * the cap (caller should retry at a smaller font or fall back to char-split).
 */
export function packByWords(title: string, charsPerRow: number): string[] | null {
  const words = title.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [title];
  if (words.some((w) => w.length > charsPerRow)) return null;

  const rows: string[] = [];
  let cur = "";
  for (const w of words) {
    const candidate = cur ? cur + " " + w : w;
    if (candidate.length > charsPerRow && cur) {
      rows.push(cur);
      cur = w;
    } else {
      cur = candidate;
    }
  }
  if (cur) rows.push(cur);
  return rows;
}

function splitByChars(text: string, charsPerRow: number): string[] {
  if (charsPerRow <= 0) return [text];
  const rows: string[] = [];
  for (let i = 0; i < text.length; i += charsPerRow) {
    rows.push(text.slice(i, i + charsPerRow));
  }
  return rows;
}
