import { ImageResponse } from "next/og";
import { OG, ogFonts } from "@/lib/og";

export const alt = "tag.bet — прогнозы на футбол по цифрам";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// A row of the forecasts table: the three chances on the green scale and a price on the highlighter
const cells = [
  { v: "52", bg: OG.p4, fg: "#ffffff" },
  { v: "26", bg: OG.p2, fg: OG.fg },
  { v: "22", bg: OG.p2, fg: OG.fg },
];

export default async function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 80, background: OG.bg, color: OG.fg, fontFamily: "Onest" }}>
        <div style={{ display: "flex", alignItems: "flex-end", fontSize: 64, fontWeight: 800, letterSpacing: -3 }}>
          <span>tag</span>
          <div style={{ width: 20, height: 20, borderRadius: 4, background: OG.hi, margin: "0 4px 14px 6px" }} />
          <span>bet</span>
        </div>
        <div style={{ display: "flex", fontSize: 76, fontWeight: 800, letterSpacing: -3, lineHeight: 1.02, maxWidth: 900 }}>Прогнозы на футбол по цифрам</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {cells.map((c, i) => (
            <div key={i} style={{ display: "flex", width: 132, justifyContent: "center", padding: "14px 0", borderRadius: 14, fontSize: 60, fontWeight: 800, background: c.bg, color: c.fg }}>
              {c.v}
            </div>
          ))}
          <div style={{ display: "flex", marginLeft: 26, padding: "4px 14px", fontSize: 60, fontWeight: 800, background: OG.hi }}>2.10</div>
          <span style={{ marginLeft: 18, fontSize: 26, color: OG.muted, fontWeight: 500, maxWidth: 300 }}>коэффициент выше честной цены</span>
        </div>
      </div>
    ),
    { ...size, fonts: await ogFonts() },
  );
}
