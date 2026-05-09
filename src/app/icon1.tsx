import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
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
          paddingBottom: 42,
          gap: 16,
        }}
      >
        <div style={{ width: 112, height: 384, background: "#f4ead4" }} />
        <div style={{ width: 112, height: 432, background: "#d9b858" }} />
        <div style={{ width: 112, height: 352, background: "#f4ead4" }} />
      </div>
    ),
    { ...size },
  );
}
