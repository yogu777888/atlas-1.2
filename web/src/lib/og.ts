import { readFile } from "node:fs/promises";
import path from "node:path";

/** Onest for Open Graph images: the default OG font has no Cyrillic. */
export async function ogFonts() {
  const dir = path.join(process.cwd(), "src/assets/fonts");
  const [medium, bold] = await Promise.all([readFile(path.join(dir, "Onest-Medium.ttf")), readFile(path.join(dir, "Onest-ExtraBold.ttf"))]);
  return [
    { name: "Onest", data: medium, weight: 500 as const, style: "normal" as const },
    { name: "Onest", data: bold, weight: 800 as const, style: "normal" as const },
  ];
}

/** The site's palette for share cards: paper, white sheets, ink, the highlighter and the probability greens. */
export const OG = { bg: "#f3f5f0", sheet: "#ffffff", line: "#dde2da", fg: "#111512", muted: "#5b635d", hi: "#ffd84a", p2: "#cfe5d6", p3: "#a3cfb1", p4: "#2e8555" } as const;
