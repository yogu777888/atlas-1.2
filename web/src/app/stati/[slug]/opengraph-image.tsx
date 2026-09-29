import { ImageResponse } from "next/og";
import { articles, getArticle } from "@/content/articles";
import { OG, ogFonts } from "@/lib/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Статья tag.bet";

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

/** Share card: the article's key number on the highlighter, its title and the brand. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const a = getArticle((await params).slug);
  const title = a?.title ?? "Статьи о ставках";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: OG.bg, color: OG.fg, fontFamily: "Onest" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "flex-end", fontSize: 44, fontWeight: 800, letterSpacing: -2 }}>
            <span>tag</span>
            <div style={{ width: 15, height: 15, borderRadius: 3, background: OG.hi, margin: "0 3px 9px 5px" }} />
            <span>bet</span>
          </div>
          {a && <span style={{ fontSize: 26, color: OG.muted, fontWeight: 500 }}>{`${a.category} · ${a.minutes} мин`}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 48 }}>
          <div style={{ display: "flex", fontSize: 62, fontWeight: 800, lineHeight: 1.06, letterSpacing: -2, maxWidth: 680 }}>{title}</div>
          {a && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", padding: "28px 34px", borderRadius: 20, background: OG.sheet, border: `2px solid ${OG.line}` }}>
              <span style={{ fontSize: 76, fontWeight: 800, letterSpacing: -3, background: OG.hi, padding: "0 10px" }}>{a.cover.figure}</span>
              <span style={{ marginTop: 10, fontSize: 20, color: OG.muted, fontWeight: 500, maxWidth: 300, textAlign: "right" }}>{a.cover.caption}</span>
            </div>
          )}
        </div>
      </div>
    ),
    { ...size, fonts: await ogFonts() },
  );
}
