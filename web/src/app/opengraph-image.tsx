import { ImageResponse } from "next/og";

export const alt = "tag.bet — Every line. One tag.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "radial-gradient(ellipse at 50% -10%, #2a2466 0%, #07080a 60%)",
          color: "#f4f5f6",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 40, fontWeight: 700 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: "#c4ff3d" }} />
          <span>
            tag<span style={{ color: "#c4ff3d" }}>.</span>bet
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 104, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>Every line.</div>
          <div style={{ fontSize: 104, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>One tag.</div>
          <div style={{ marginTop: 28, fontSize: 32, color: "#8b919a" }}>Compare odds across top sportsbooks. Best price, tagged.</div>
        </div>
      </div>
    ),
    size,
  );
}
