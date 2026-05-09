import { ImageResponse } from "next/og";

export const alt = "Shelved — your bookshelf, beautifully";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TEXT_SUBSET =
  "Your bookshelf, beautifully.Shelved.YOUR READING LOG · VISUALISED";

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

const SPINES: Array<{
  width: number;
  height: number;
  body: string;
  accent: string;
}> = [
  { width: 44, height: 360, body: "#5a342a", accent: "#d9b858" },
  { width: 52, height: 420, body: "#f4ead4", accent: "#a88230" },
  { width: 46, height: 384, body: "#3d4a5e", accent: "#d9b858" },
  { width: 56, height: 446, body: "#d9b858", accent: "#1a5e08" },
  { width: 48, height: 402, body: "#8b3a3a", accent: "#d9b858" },
  { width: 50, height: 372, body: "#2c4a3a", accent: "#d9b858" },
  { width: 44, height: 414, body: "#f4ead4", accent: "#a88230" },
];

export default async function OpengraphImage() {
  const [cormorant500, cormorant600, inter500] = await Promise.all([
    loadGoogleFont("Cormorant+Garamond", "ital,wght@1,500", TEXT_SUBSET),
    loadGoogleFont("Cormorant+Garamond", "ital,wght@1,600", TEXT_SUBSET),
    loadGoogleFont("Inter", "wght@500", TEXT_SUBSET),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#140a06",
          backgroundImage:
            "radial-gradient(ellipse 70% 60% at 80% 50%, rgba(217,184,88,0.10), transparent 60%)",
          padding: "72px 80px",
          fontFamily: "Cormorant",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flex: 1,
            paddingRight: 48,
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
            Your reading log · visualised
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontFamily: "Cormorant",
              fontStyle: "italic",
              fontWeight: 500,
              fontSize: 112,
              color: "#f4ead4",
              lineHeight: 0.98,
              letterSpacing: "-0.03em",
            }}
          >
            <div style={{ display: "flex" }}>Your bookshelf,</div>
            <div style={{ display: "flex" }}>beautifully.</div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              fontFamily: "Cormorant",
              fontStyle: "italic",
              fontWeight: 600,
              fontSize: 44,
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
            alignItems: "flex-end",
            gap: 4,
          }}
        >
          {SPINES.map((s, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                width: s.width,
                height: s.height,
                background: s.body,
                borderTop: `8px solid ${s.accent}`,
                borderBottom: `8px solid ${s.accent}`,
              }}
            >
              <div
                style={{
                  marginTop: 28,
                  width: "100%",
                  height: 3,
                  background: s.accent,
                  opacity: 0.7,
                }}
              />
              <div
                style={{
                  marginBottom: 28,
                  width: "100%",
                  height: 3,
                  background: s.accent,
                  opacity: 0.7,
                }}
              />
            </div>
          ))}
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
