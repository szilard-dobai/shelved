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

const ROW_WIDTH_FACTOR = 1.15; // char glyph width + inter-row spacing, per font unit
const CHAR_HEIGHT_FACTOR = 0.7; // vertical-writing character height per font unit

/**
 * Core fitting algorithm. Searches (rowCount, fontSize) space for the best
 * combination that fits the title.
 */
export function fitTitle(title: string, opts: FitOptions): TitleFit {
  const {
    spineWidth,
    availHeight,
    baseFontSize,
    minReadable = 9,
    absoluteMin = 6,
    hPad = 4,
    vPad = 4,
  } = opts;

  const widthBudget = Math.max(0, spineWidth - hPad);
  const heightBudget = Math.max(0, availHeight - vPad);

  const fits = (fs: number, rowCount: number): boolean => {
    const rowWidth = fs * ROW_WIDTH_FACTOR;
    if (rowCount * rowWidth > widthBudget) return false;
    const charsPerRow = Math.max(1, Math.floor(heightBudget / (fs * CHAR_HEIGHT_FACTOR)));
    return title.length <= charsPerRow * rowCount;
  };

  const fontSteps: number[] = [];
  for (let fs = baseFontSize; fs >= minReadable; fs -= 0.5) fontSteps.push(fs);

  // Phase 1: prefer 1 row, shrink font as needed, but stay readable.
  for (const fs of fontSteps) {
    if (fits(fs, 1)) return { fontSize: fs, rows: [title] };
  }

  // Phase 2: need multiple rows. For each row count, take the largest readable
  // font that fits — prefers "bigger text, more rows" over "tiny text, one row".
  for (let rowCount = 2; rowCount <= 10; rowCount++) {
    for (const fs of fontSteps) {
      if (fits(fs, rowCount)) {
        return { fontSize: fs, rows: splitIntoRows(title, rowCount) };
      }
    }
  }

  // Phase 3: readable floor isn't enough. Keep shrinking below minReadable,
  // preferring the largest font + fewest rows that fits.
  for (let fs = minReadable - 0.5; fs >= absoluteMin; fs -= 0.5) {
    const rowWidth = fs * ROW_WIDTH_FACTOR;
    const maxRows = Math.floor(widthBudget / rowWidth);
    const charsPerRow = Math.max(1, Math.floor(heightBudget / (fs * CHAR_HEIGHT_FACTOR)));
    for (let rowCount = 1; rowCount <= maxRows; rowCount++) {
      if (title.length <= charsPerRow * rowCount) {
        return { fontSize: fs, rows: splitIntoRows(title, rowCount) };
      }
    }
  }

  // Absolute fallback: smallest font, however many rows the spine width allows.
  const fs = absoluteMin;
  const maxRows = Math.max(1, Math.floor(widthBudget / (fs * ROW_WIDTH_FACTOR)));
  return { fontSize: fs, rows: splitIntoRows(title, maxRows) };
}

/**
 * Split a title into N rows, balancing on word boundaries where possible.
 * If the requested row count exceeds the number of words (or the title is a
 * single word), falls back to character splitting.
 */
export function splitIntoRows(text: string, rowCount: number): string[] {
  if (rowCount <= 1) return [text];
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length < 2) return splitByChars(text, rowCount);

  const target = text.length / rowCount;
  const rows: string[] = [];
  let cur = "";

  for (const w of words) {
    const candidate = cur ? cur + " " + w : w;
    const wouldOvershoot = cur.length > 0 && candidate.length > target * 1.15;
    const haveBudgetForMore = rows.length < rowCount - 1;
    if (wouldOvershoot && haveBudgetForMore) {
      rows.push(cur);
      cur = w;
    } else {
      cur = candidate;
    }
  }
  if (cur) rows.push(cur);
  return rows;
}

function splitByChars(text: string, rowCount: number): string[] {
  const perRow = Math.ceil(text.length / rowCount);
  const rows: string[] = [];
  for (let i = 0; i < text.length; i += perRow) {
    rows.push(text.slice(i, i + perRow));
  }
  return rows;
}
