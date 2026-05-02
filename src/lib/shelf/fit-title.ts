export interface TitleFit {
  fontSize: number;
  rows: string[];
}

interface FitOptions {
  spineWidth: number;
  availHeight: number;
  baseFontSize: number;
  minReadable?: number;
  absoluteMin?: number;
  hPad?: number;
  vPad?: number;
}

const ROW_WIDTH_FACTOR = 1.3;
const CHAR_HEIGHT_FACTOR = 0.7;

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

  for (let fs = baseFontSize; fs >= minReadable; fs -= 0.5) {
    const result = tryFit(title, fs, widthBudget, heightBudget, "words");
    if (result) return result;
  }

  for (let fs = minReadable - 0.5; fs >= absoluteMin; fs -= 0.5) {
    const result = tryFit(title, fs, widthBudget, heightBudget, "words");
    if (result) return result;
  }

  for (let fs = baseFontSize; fs >= absoluteMin; fs -= 0.5) {
    const result = tryFit(title, fs, widthBudget, heightBudget, "chars");
    if (result) return result;
  }

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

  if (!rows) return null;
  if (rows.length * rowWidth > widthBudget) return null;
  return { fontSize: fs, rows };
}

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
