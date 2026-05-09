import { ImageResponse } from "next/og";
import { getSharesCollection } from "@/lib/mongodb";
import type { ShareDoc } from "@/lib/shelf/share";
import type { Book } from "@/lib/shelf/types";

export const alt = "A bookshelf on Shelved";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadGoogleFont(family: string, axis: string, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${family}:${axis}&text=${encodeURIComponent(text)}`;
  const css = await (
    await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko",
      },
    })
  ).text();
  const match = css.match(/src: url\((.+?)\) format\(/);
  if (!match) throw new Error(`Could not parse Google Font CSS for ${family}`);
  const fontRes = await fetch(match[1]);
  if (!fontRes.ok) throw new Error(`Failed to fetch font file for ${family}`);
  return fontRes.arrayBuffer();
}

async function loadShare(slug: string): Promise<ShareDoc | null> {
  const collection = await getSharesCollection();
  return collection.findOne<ShareDoc>(
    { slug },
    { projection: { editKeyHash: 0, _id: 0 } },
  );
}

const FALLBACK_TITLE = "A reader's bookshelf";
const FALLBACK_BOOKS: Pick<Book, "spineColor" | "accent" | "pages">[] = [
  { spineColor: "#5a342a", accent: "gold", pages: 320 },
  { spineColor: "#f4ead4", accent: "none", pages: 280 },
  { spineColor: "#3d4a5e", accent: "gold", pages: 360 },
  { spineColor: "#d9b858", accent: "none", pages: 240 },
  { spineColor: "#8b3a3a", accent: "gold", pages: 300 },
  { spineColor: "#2c4a3a", accent: "gold", pages: 340 },
  { spineColor: "#f4ead4", accent: "none", pages: 220 },
  { spineColor: "#7a2838", accent: "gold", pages: 380 },
  { spineColor: "#1a2847", accent: "gold", pages: 260 },
  { spineColor: "#c9b87a", accent: "none", pages: 300 },
];

function sampleSpines(books: Book[], count: number) {
  if (books.length === 0) return FALLBACK_BOOKS;
  if (books.length <= count) return books;
  const step = books.length / count;
  return Array.from({ length: count }, (_, i) =>
    books[Math.floor(i * step)],
  );
}

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = await loadShare(slug);

  const userTitle = doc?.userTitle?.trim() || FALLBACK_TITLE;
  const visible = doc
    ? doc.yearFilter != null &&
      doc.books.some((b) => b.year === doc.yearFilter)
      ? doc.books.filter((b) => b.year === doc.yearFilter)
      : doc.books
    : [];
  const bookCount = visible.length;
  const eyebrow = "A bookshelf on Shelved";
  const stat = doc
    ? `${bookCount} ${bookCount === 1 ? "book" : "books"}`
    : "Make yours at shelved.ink";

  const titleFontSize =
    userTitle.length > 60 ? 64 : userTitle.length > 30 ? 84 : 104;

  const charSubset = `${userTitle}${eyebrow}${stat}Shelved.0123456789`;

  const [cormorant500, cormorant600, inter500] = await Promise.all([
    loadGoogleFont("Cormorant+Garamond", "ital,wght@1,500", charSubset),
    loadGoogleFont("Cormorant+Garamond", "ital,wght@1,600", charSubset),
    loadGoogleFont("Inter", "wght@500", charSubset),
  ]);

  const spines = sampleSpines(visible, 14);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#140a06",
          backgroundImage:
            "radial-gradient(ellipse 70% 60% at 80% 50%, rgba(217,184,88,0.10), transparent 60%)",
          padding: "60px 80px",
          fontFamily: "Cormorant",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <div
            style={{
              fontFamily: "Inter",
              fontSize: 18,
              color: "rgba(244,234,212,0.5)",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              fontFamily: "Cormorant",
              fontStyle: "italic",
              fontWeight: 600,
              fontSize: 36,
              color: "#f4ead4",
              letterSpacing: "-0.02em",
            }}
          >
            <span>Shelved</span>
            <span style={{ color: "#d9b858", marginLeft: 2 }}>.</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            paddingTop: 16,
            paddingBottom: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              maxWidth: 1040,
              fontFamily: "Cormorant",
              fontStyle: "italic",
              fontWeight: 500,
              fontSize: titleFontSize,
              color: "#f4ead4",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            {userTitle}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 14,
              fontFamily: "Cormorant",
              fontStyle: "italic",
              fontSize: 32,
              color: "#d9b858",
              letterSpacing: "-0.01em",
            }}
          >
            {stat}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 4,
            height: 200,
          }}
        >
          {spines.map((b, i) => {
            const accent =
              b.accent === "gold"
                ? "#d9b858"
                : b.accent === "silver"
                  ? "#c0c4c8"
                  : null;
            const baseHeight = 150;
            const variance = b.pages ? Math.min(50, b.pages / 10) : 30;
            const height = Math.round(baseHeight + variance);
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  width: 46,
                  height,
                  background: b.spineColor,
                  ...(accent
                    ? {
                        borderTop: `6px solid ${accent}`,
                        borderBottom: `6px solid ${accent}`,
                      }
                    : {}),
                }}
              />
            );
          })}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Cormorant",
          data: cormorant500,
          style: "italic",
          weight: 500,
        },
        {
          name: "Cormorant",
          data: cormorant600,
          style: "italic",
          weight: 600,
        },
        { name: "Inter", data: inter500, style: "normal", weight: 500 },
      ],
    },
  );
}
