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

export const OG = { bg: "#0b0b09", tile: "#1a1915", line: "#26251f", fg: "#f4f1e6", muted: "#9a978a", accent: "#ffc629" } as const;
