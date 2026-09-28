import { ImageResponse } from "next/og";

// Language-neutral card: the default OG font has no Cyrillic, so it shows the brand and a tagged odds row.
export const alt = "tag.bet";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const odds = [
  { v: "2.10", best: true },
  { v: "3.40", best: false },
  { v: "3.65", best: true },
];

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
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 44, fontWeight: 700 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: "#c4ff3d" }} />
          <span>
            tag<span style={{ color: "#c4ff3d" }}>.</span>bet
          </span>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {odds.map((o, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                padding: "28px 44px",
                borderRadius: 28,
                fontSize: 88,
                fontWeight: 700,
                background: o.best ? "rgba(196,255,61,0.12)" : "#14171b",
                border: o.best ? "3px solid rgba(196,255,61,0.5)" : "3px solid #262b1e",
                color: o.best ? "#c4ff3d" : "#8b919a",
              }}
            >
              {o.v}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
