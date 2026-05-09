import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          paddingBottom: 2,
          gap: 1,
        }}
      >
        <div style={{ width: 7, height: 24, background: "#f4ead4" }} />
        <div style={{ width: 7, height: 27, background: "#d9b858" }} />
        <div style={{ width: 7, height: 22, background: "#f4ead4" }} />
      </div>
    ),
    { ...size },
  );
}
