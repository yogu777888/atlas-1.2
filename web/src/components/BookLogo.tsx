import { existsSync } from "node:fs";
import path from "node:path";
import { getBookmaker } from "@/lib/bookmakers";

const EXTS = ["svg", "png", "webp"] as const;
const found = new Map<string, string | null>();

/** Official logo dropped into public/bookmakers/<slug>.<ext>, if any (checked once per slug). */
function logoFile(slug: string): string | null {
  if (!found.has(slug)) {
    const dir = path.join(process.cwd(), "public", "bookmakers");
    const ext = EXTS.find((e) => existsSync(path.join(dir, `${slug}.${e}`)));
    found.set(slug, ext ? `/bookmakers/${slug}.${ext}` : null);
  }
  return found.get(slug)!;
}

export function BookLogo({ slug, size = "md" }: { slug: string; size?: "sm" | "md" | "lg" }) {
  const b = getBookmaker(slug);
  if (!b) return null;
  const dims = { sm: "size-5 rounded-md text-[8px]", md: "size-9 rounded-xl text-[11px]", lg: "size-14 rounded-2xl text-base" }[size];
  const src = logoFile(slug);
  if (src) {
    return <img src={src} alt={b.name} className={`shrink-0 object-cover ring-1 ring-white/10 ${dims}`} />;
  }
  return (
    <span
      title={b.name}
      className={`inline-flex shrink-0 items-center justify-center font-bold tracking-tight ring-1 ring-white/10 ${dims}`}
      style={{ background: b.color, color: b.ink }}
    >
      {b.monogram}
    </span>
  );
}
