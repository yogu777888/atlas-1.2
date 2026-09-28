import { getBookmaker } from "@/lib/bookmakers";

export function BookLogo({ slug, size = "md" }: { slug: string; size?: "sm" | "md" | "lg" }) {
  const b = getBookmaker(slug);
  if (!b) return null;
  const dims = { sm: "size-5 rounded-md text-[8px]", md: "size-9 rounded-xl text-[11px]", lg: "size-14 rounded-2xl text-base" }[size];
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
