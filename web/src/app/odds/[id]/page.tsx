import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookLogo } from "@/components/BookLogo";
import { LocalTime } from "@/components/LocalTime";
import { getBookmaker, goLink } from "@/lib/bookmakers";
import { bookMargin, edge, formatOdds, formatPct, outcomeLabel } from "@/lib/odds/math";
import { getEvent } from "@/lib/odds/provider";
import { getSport } from "@/lib/sports";
import { StakeSplitter } from "./StakeSplitter";

export const revalidate = 120;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const e = await getEvent((await params).id);
  if (!e) return { title: "Match not found" };
  return {
    title: `${e.home} vs ${e.away} odds`,
    description: `Compare ${e.home} vs ${e.away} odds (${e.league}) across ${e.books.length} bookmakers. Best price tagged on every outcome.`,
    alternates: { canonical: `/odds/${e.id}` },
  };
}

export default async function EventPage({ params }: Props) {
  const e = await getEvent((await params).id);
  if (!e) notFound();
  const sport = getSport(e.sport);
  const sure = e.bestMargin < 0;
  const books = [...e.books].sort((a, b) => (bookMargin(a, e.outcomes) ?? 1) - (bookMargin(b, e.outcomes) ?? 1));

  return (
    <div className="container-x pt-12">
      <Link href={`/odds?sport=${e.sport}`} className="text-sm text-muted hover:text-fg">
        ← {sport?.label} odds
      </Link>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="flex items-center gap-2 text-sm text-subtle">
            <span aria-hidden>{sport?.emoji}</span> {e.league} · <LocalTime iso={e.commenceTime} />
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {e.home} <span className="text-subtle">vs</span> {e.away}
          </h1>
        </div>
        {sure && <span className="rounded-full bg-accent px-3 py-1 font-mono text-xs font-bold text-accent-ink">SURE BET · {formatPct(-e.bestMargin, 2)} return</span>}
      </div>

      {/* Best prices */}
      <div className={`mt-10 grid gap-4 ${e.outcomes.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
        {e.best.map((b) => {
          const book = getBookmaker(b.bookmaker)!;
          const fair = e.fair[b.outcome];
          return (
            <div key={b.outcome} className="card p-5">
              <p className="text-sm text-muted">{outcomeLabel(e, b.outcome)}</p>
              <p className="mt-2 font-mono text-4xl font-semibold text-accent tabular-nums">{formatOdds(b.price)}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-subtle">
                <span className="flex items-center gap-1.5">
                  <BookLogo slug={book.slug} size="sm" /> {book.name}
                </span>
                {fair && <span>Fair {formatOdds(1 / fair)}</span>}
              </div>
              <a href={goLink(book.slug, `event-${e.id}`)} target="_blank" rel="sponsored nofollow noopener" className="btn-primary mt-5 h-9 w-full">
                Bet at {book.name.split(" ")[0]}
              </a>
            </div>
          );
        })}
      </div>

      {/* Full comparison */}
      <h2 className="mt-14 mb-4 text-xl font-semibold tracking-tight">All bookmakers</h2>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-line text-left font-mono text-[11px] tracking-wider text-subtle uppercase">
              <th className="px-5 py-3 font-normal">Bookmaker</th>
              {e.outcomes.map((o) => (
                <th key={o} className="px-3 py-3 text-center font-normal">
                  {outcomeLabel(e, o)}
                </th>
              ))}
              <th className="px-5 py-3 text-right font-normal">Margin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {books.map((book) => {
              const b = getBookmaker(book.bookmaker)!;
              const m = bookMargin(book, e.outcomes);
              return (
                <tr key={book.bookmaker} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-3">
                    <a href={goLink(b.slug, `event-table-${e.id}`)} target="_blank" rel="sponsored nofollow noopener" className="flex items-center gap-3 hover:underline">
                      <BookLogo slug={b.slug} size="sm" /> {b.name}
                    </a>
                  </td>
                  {e.outcomes.map((o) => {
                    const price = book.prices[o];
                    const isBest = e.best.find((x) => x.outcome === o)?.price === price;
                    const ev = price && e.fair[o] ? edge(price, e.fair[o]!) : null;
                    return (
                      <td key={o} className="px-3 py-3 text-center">
                        <span className={`odds-pill ${isBest ? "odds-pill-best" : ""}`} title={ev !== null ? `Edge vs fair: ${formatPct(ev)}` : undefined}>
                          {price ? formatOdds(price) : "—"}
                        </span>
                      </td>
                    );
                  })}
                  <td className="px-5 py-3 text-right font-mono text-muted tabular-nums">{m !== null ? formatPct(m) : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {sure && (
        <div className="mt-10 max-w-xl">
          <StakeSplitter
            legs={e.best.map((b) => ({ label: outcomeLabel(e, b.outcome), price: b.price, book: getBookmaker(b.bookmaker)!.name }))}
          />
        </div>
      )}

      <p className="mt-8 text-xs text-subtle">
        Prices can change at any moment. Always check the final odds on the bookmaker&apos;s bet slip. 18+ · Bet responsibly.
      </p>
    </div>
  );
}
