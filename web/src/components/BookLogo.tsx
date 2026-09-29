import { statSync } from "node:fs";
import path from "node:path";
import { getBookmaker } from "@/lib/bookmakers";

const EXTS = ["svg", "png", "webp", "jpg"] as const;
const found = new Map<string, string | null>();

/**
 * Official logo dropped into public/bookmakers/<slug>.<ext>, if any. Cached in
 * production only, so files added while `npm run dev` runs show up on reload.
 * Tiny files are ignored: they are usually an error page, not an image.
 */
function logoFile(slug: string): string | null {
  const cache = process.env.NODE_ENV === "production";
  if (cache && found.has(slug)) return found.get(slug)!;
  const dir = path.join(process.cwd(), "public", "bookmakers");
  const ext = EXTS.find((e) => {
    try {
      return statSync(path.join(dir, `${slug}.${e}`)).size > 400;
    } catch {
      return false;
    }
  });
  const src = ext ? `/bookmakers/${slug}.${ext}` : null;
  if (cache) found.set(slug, src);
  return src;
}

export function BookLogo({ slug, size = "md" }: { slug: string; size?: "sm" | "md" | "lg" }) {
  const b = getBookmaker(slug);
  if (!b) return null;
  const dims = { sm: "size-5 rounded-md text-[8px]", md: "size-9 rounded-lg text-[11px]", lg: "size-14 rounded-xl text-base" }[size];
  const src = logoFile(slug);
  if (src) {
    return <img src={src} alt={b.name} className={`shrink-0 object-cover ring-1 ring-fg/10 ${dims}`} />;
  }
  return (
    <span
      title={b.name}
      className={`inline-flex shrink-0 items-center justify-center font-bold tracking-tight ring-1 ring-fg/10 ${dims}`}
      style={{ background: b.color, color: b.ink }}
    >
      {b.monogram}
    </span>
  );
}
