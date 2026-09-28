import Link from "next/link";
import { goLink, type Bookmaker } from "@/lib/bookmakers";
import { BookLogo } from "./BookLogo";

export function BonusCard({ b, source }: { b: Bookmaker; source: string }) {
  return (
    <article className="card group relative flex flex-col overflow-hidden p-5 transition hover:border-line-strong">
      <div
        className="pointer-events-none absolute -top-24 -right-24 size-48 rounded-full opacity-20 blur-3xl transition group-hover:opacity-35"
        style={{ background: b.color }}
      />
      <div className="mb-5 flex items-center gap-3">
        <BookLogo slug={b.slug} />
        <div>
          <Link href={`/bookmakers/${b.slug}`} className="font-medium hover:underline">
            {b.name}
          </Link>
          <p className="text-xs text-subtle">{b.license}</p>
        </div>
      </div>
      <h3 className="text-lg leading-snug font-semibold tracking-tight text-balance">{b.bonus.headline}</h3>
      <p className="mt-2 text-sm text-muted">{b.bonus.detail}</p>
      {b.bonus.code && (
        <p className="mt-4 inline-flex w-fit items-center gap-2 rounded-lg border border-dashed border-line-strong px-3 py-1.5 font-mono text-xs">
          <span className="text-subtle">CODE</span> {b.bonus.code}
        </p>
      )}
      <div className="mt-auto pt-6">
        <a href={goLink(b.slug, source)} rel="sponsored nofollow noopener" target="_blank" className="btn-primary w-full">
          Claim offer
        </a>
        <p className="mt-3 text-[11px] leading-snug text-subtle">{b.bonus.terms}</p>
      </div>
    </article>
  );
}
