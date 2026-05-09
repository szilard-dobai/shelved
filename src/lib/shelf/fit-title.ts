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
    absoluteMin = 6,
    hPad = 5,
    vPad = 4,
  } = opts;

  const widthBudget = Math.max(0, spineWidth - hPad);
  const heightBudget = Math.max(0, availHeight - vPad);

  for (let fs = baseFontSize; fs >= absoluteMin; fs -= 0.5) {
    const charsPerRow = Math.max(
      1,
      Math.floor(heightBudget / (fs * CHAR_HEIGHT_FACTOR)),
    );
    const rows = packByWords(title, charsPerRow);
    const longestRow = rows.reduce((m, r) => Math.max(m, r.length), 0);
    const heightOk = longestRow * fs * CHAR_HEIGHT_FACTOR <= heightBudget;
    const widthOk = rows.length * fs * ROW_WIDTH_FACTOR <= widthBudget;
    if (heightOk && widthOk) {
      return { fontSize: fs, rows };
    }
  }

  const fs = absoluteMin;
  const charsPerRow = Math.max(
    1,
    Math.floor(heightBudget / (fs * CHAR_HEIGHT_FACTOR)),
  );
  return { fontSize: fs, rows: packByWords(title, charsPerRow) };
}

export function packByWords(title: string, charsPerRow: number): string[] {
  const words = title.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [title];

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
