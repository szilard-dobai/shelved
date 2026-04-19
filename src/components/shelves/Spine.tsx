import type { Book } from "@/lib/shelf/types";
import { bookSeed, darken, lighten } from "@/lib/shelf/helpers";
import { fitTitle, type TitleFit } from "@/lib/shelf/fit-title";

type SpineStyle = "wood" | "minimal" | "spines";

const textures: Record<
  SpineStyle,
  { glossOpacity: number; shadowOpacity: number; grain: boolean }
> = {
  wood: { glossOpacity: 0.18, shadowOpacity: 0.4, grain: true },
  minimal: { glossOpacity: 0.06, shadowOpacity: 0.12, grain: false },
  spines: { glossOpacity: 0.22, shadowOpacity: 0.45, grain: true },
};

export function Spine({
  book,
  height,
  width,
  style = "wood",
}: {
  book: Book;
  height: number;
  width: number;
  style?: SpineStyle;
}) {
  const seed = bookSeed(book, "s");
  const seed2 = bookSeed(book, "b");
  const tilt = (bookSeed(book, "t") - 0.5) * 1.5;
  const tx = textures[style];

  const accentColor =
    book.accent === "gold"
      ? "#d9b858"
      : book.accent === "silver"
        ? "#c8c8d0"
        : null;

  const bandVariant = Math.floor(seed2 * 4);

  const topBand = height * 0.08;
  const midBandTop = height * 0.35;
  const midBandH = height * 0.22;
  const botBand = height * 0.08;

  // Typography sizing
  const baseTitleFontSize = Math.max(9, Math.min(13, width * 0.45));
  const authorLastName = book.author.split(" ").slice(-1)[0];
  const authorFontSize = Math.max(7, width * 0.28);
  const hasAuthor = width > 26;
  // Vertical text "height" ≈ character count × roughly 70% of font size.
  const authorReserve = hasAuthor
    ? authorLastName.length * authorFontSize * 0.7 + 8
    : 0;

  // Try fitting the title inside the mid-band panel first. If that works at
  // the base font in a single row, we use the panel as a decorative title
  // frame. Otherwise fall back to the full spine height.
  const panelInnerH = midBandH - 12;
  const panelFit = fitTitle(book.title, {
    spineWidth: width - 6,
    availHeight: panelInnerH,
    baseFontSize: baseTitleFontSize,
  });
  const useTitlePanel =
    width > 28 &&
    bandVariant === 1 &&
    panelFit.rows.length === 1 &&
    panelFit.fontSize >= baseTitleFontSize - 1;

  const fullSpineTitleTop = topBand + 14;
  const fullSpineTitleAreaH = Math.max(
    20,
    height - fullSpineTitleTop - botBand - 14 - authorReserve,
  );

  let titleTop: number;
  let titleAreaH: number;
  let titleFit: TitleFit;
  if (useTitlePanel) {
    titleTop = midBandTop + 6;
    titleAreaH = panelInnerH;
    titleFit = panelFit;
  } else {
    titleTop = fullSpineTitleTop;
    titleAreaH = fullSpineTitleAreaH;
    titleFit = fitTitle(book.title, {
      spineWidth: width,
      availHeight: titleAreaH,
      baseFontSize: baseTitleFontSize,
    });
  }

  return (
    <div
      className="relative flex-shrink-0"
      style={{
        width,
        height,
        transform: `rotate(${tilt}deg) translateY(${Math.round(seed * 3)}px)`,
        transformOrigin: "bottom center",
        marginRight: style === "spines" ? -1 : 2,
      }}
    >
      <div
        className="relative w-full h-full overflow-hidden rounded-[1px]"
        style={{
          background: `linear-gradient(90deg,
            ${darken(book.spineColor, 0.22)} 0%,
            ${book.spineColor} 18%,
            ${lighten(book.spineColor, 0.08)} 50%,
            ${book.spineColor} 82%,
            ${darken(book.spineColor, 0.22)} 100%)`,
          boxShadow: `inset 0 1px 0 ${lighten(book.spineColor, 0.25)},
                      inset 0 -2px 2px ${darken(book.spineColor, 0.35)},
                      1px 0 1px rgba(0,0,0,${tx.shadowOpacity * 0.3})`,
        }}
      >
        {/* Gloss highlight */}
        <div
          className="absolute top-0 bottom-0 pointer-events-none"
          style={{
            left: "35%",
            width: "12%",
            background: `linear-gradient(90deg, transparent, rgba(255,255,255,${tx.glossOpacity}), transparent)`,
          }}
        />
        {tx.grain && (
          <div
            className="absolute inset-0 pointer-events-none mix-blend-multiply"
            style={{
              background:
                "repeating-linear-gradient(90deg, transparent 0 2px, rgba(0,0,0,0.04) 2px 3px)",
            }}
          />
        )}

        {bandVariant !== 3 && (
          <div
            className="absolute left-0 right-0 h-[3px]"
            style={{
              top: topBand,
              background: accentColor || darken(book.spineColor, 0.4),
              opacity: 0.9,
            }}
          />
        )}
        {bandVariant === 0 && (
          <div
            className="absolute left-0 right-0 h-px"
            style={{
              top: topBand + 8,
              background: accentColor || darken(book.spineColor, 0.5),
              opacity: 0.7,
            }}
          />
        )}

        {useTitlePanel && (
          <div
            className="absolute left-[3px] right-[3px]"
            style={{
              top: midBandTop,
              height: midBandH,
              background: darken(book.spineColor, 0.25),
              border: `1px solid ${accentColor || darken(book.spineColor, 0.4)}`,
            }}
          />
        )}

        {bandVariant !== 2 && (
          <div
            className="absolute left-0 right-0 h-[3px]"
            style={{
              bottom: botBand,
              background: accentColor || darken(book.spineColor, 0.4),
              opacity: 0.9,
            }}
          />
        )}

        {width >= 18 && (
          <div
            className="absolute left-0 right-0 flex items-center justify-center overflow-hidden"
            style={{ top: titleTop, height: titleAreaH }}
          >
            <div className="flex flex-row-reverse items-center gap-px">
              {titleFit.rows.map((rowText, i) => (
                <div
                  key={i}
                  className="writing-vertical whitespace-nowrap leading-none"
                  style={{
                    transform: "rotate(180deg)",
                    fontFamily:
                      seed2 > 0.6
                        ? "var(--font-cormorant), Georgia, serif"
                        : "var(--font-inter), system-ui, sans-serif",
                    fontSize: titleFit.fontSize,
                    fontWeight: seed2 > 0.5 ? 600 : 500,
                    color: book.textColor,
                    letterSpacing: seed2 > 0.6 ? "0.04em" : "0.01em",
                    textTransform: seed2 > 0.75 ? "uppercase" : "none",
                    textShadow: `0 1px 0 ${darken(book.spineColor, 0.4)}`,
                  }}
                >
                  {rowText}
                </div>
              ))}
            </div>
          </div>
        )}

        {hasAuthor && (
          <div
            className="absolute left-1/2 writing-vertical font-serif italic whitespace-nowrap"
            style={{
              bottom: botBand + 14,
              transform: "translateX(-50%) rotate(180deg)",
              fontSize: authorFontSize,
              color: book.textColor,
              opacity: 0.75,
            }}
          >
            {authorLastName}
          </div>
        )}
      </div>
    </div>
  );
}
