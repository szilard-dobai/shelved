import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const SPINES: Array<{
  width: number;
  height: number;
  body: string;
  accent: string;
}> = [
  { width: 22, height: 122, body: "#5a342a", accent: "#d9b858" },
  { width: 26, height: 138, body: "#f4ead4", accent: "#a88230" },
  { width: 24, height: 130, body: "#3d4a5e", accent: "#d9b858" },
  { width: 28, height: 146, body: "#d9b858", accent: "#1a0e08" },
  { width: 24, height: 134, body: "#8b3a3a", accent: "#d9b858" },
  { width: 26, height: 126, body: "#f4ead4", accent: "#a88230" },
];

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          background: "#140a06",
          backgroundImage:
            "radial-gradient(ellipse 70% 60% at 50% 70%, rgba(217,184,88,0.14), transparent 65%)",
          paddingBottom: 14,
          gap: 2,
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
              borderTop: `4px solid ${s.accent}`,
              borderBottom: `4px solid ${s.accent}`,
            }}
          >
            <div
              style={{
                marginTop: 14,
                width: "100%",
                height: 2,
                background: s.accent,
                opacity: 0.7,
              }}
            />
            <div
              style={{
                marginBottom: 14,
                width: "100%",
                height: 2,
                background: s.accent,
                opacity: 0.7,
              }}
            />
          </div>
        ))}
      </div>
    ),
    { ...size },
  );
}
