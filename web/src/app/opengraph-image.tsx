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
          background: "#0b0b09",
          color: "#f4f1e6",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", fontSize: 72, fontWeight: 800, letterSpacing: -3 }}>
          <span>tag</span>
          <div style={{ width: 22, height: 22, borderRadius: 4, background: "#ffc629", margin: "0 4px 16px 6px" }} />
          <span>bet</span>
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
                background: o.best ? "rgba(255,198,41,0.12)" : "#1a1915",
                border: o.best ? "3px solid rgba(255,198,41,0.5)" : "3px solid #26251f",
                color: o.best ? "#ffc629" : "#9a978a",
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
