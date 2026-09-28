import { ImageResponse } from "next/og";

// Home-screen icon: the yellow flip, full-bleed (iOS rounds the corners itself).
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#ffc629" }}>
        <div style={{ flex: 1 }} />
        <div style={{ height: 8, background: "#0b0b09" }} />
        <div style={{ flex: 1 }} />
      </div>
    ),
    size,
  );
}
