import Link from "next/link";
import { goLink, type Bookmaker } from "@/lib/bookmakers";
import { BookLogo } from "./BookLogo";
import { Rating } from "./Rating";

export function BookmakerRow({ b, rank, source }: { b: Bookmaker; rank: number; source: string }) {
  return (
    <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3 px-5 py-4 transition hover:bg-white/[0.02] sm:grid-cols-[2rem_auto_1fr_auto_auto]">
      <span className="hidden font-mono text-sm text-subtle sm:block">{String(rank).padStart(2, "0")}</span>
      <BookLogo slug={b.slug} />
      <div className="min-w-0">
        <Link href={`/bookmakers/${b.slug}`} className="font-medium hover:underline">
          {b.name}
        </Link>
        <p className="truncate text-sm text-muted">{b.bonus.headline}</p>
      </div>
      <div className="col-span-2 flex items-center justify-between gap-4 sm:col-span-1 sm:justify-end">
        <Rating value={b.rating} />
        <span className="font-mono text-xs text-subtle">~{(b.avgMargin * 100).toFixed(1)}% margin</span>
      </div>
      <a href={goLink(b.slug, source)} rel="sponsored nofollow noopener" target="_blank" className="btn-primary col-span-2 h-9 sm:col-span-1">
        Visit {b.name.split(" ")[0]}
      </a>
    </div>
  );
}
