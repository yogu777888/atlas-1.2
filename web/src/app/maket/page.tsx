import type { Metadata } from "next";
import Link from "next/link";
import { BoardLegend } from "@/components/Board";
import { BoardFilter } from "@/components/BoardFilter";
import { BookLogo } from "@/components/BookLogo";
import { BoardV2 } from "@/components/v2/BoardV2";
import { MatchTile } from "@/components/v2/MatchTile";
import { badgeOf } from "@/lib/badges";
import { bookmakersByRating } from "@/lib/bookmakers";
import { dataSource, getMatches } from "@/lib/data";
import { mskTime } from "@/lib/dates";
import { isClubTop, leagues } from "@/lib/leagues";
import { hasValue, type Match } from "@/lib/matches";
import { paths } from "@/lib/routes";
import { POPULAR } from "@/lib/teams";

export const revalidate = 300;

// A draft of the new home page, not for search
export const metadata: Metadata = { title: "Макет главной", robots: { index: false, follow: false } };

/** The headline matches: top leagues, famous clubs, a bookmaker line, soonest first among equals. */
function headline(matches: Match[], n = 6): Match[] {
  const known = (m: Match) => [m.home, m.away].every((t) => !("initial" in badgeOf(t)));
  const score = (m: Match) => (isClubTop(m.league.key) ? 4 : 0) + (known(m) ? 3 : -5) + (m.pari ? 2 : 0) + (hasValue(m) ? 1 : 0) + (POPULAR.includes(m.home) || POPULAR.includes(m.away) ? 3 : 0);
  return matches
    .filter((m) => m.fair && Date.parse(m.commenceTime) > Date.now())
    .sort((a, b) => score(b) - score(a) || a.commenceTime.localeCompare(b.commenceTime))
    .slice(0, n)
    .sort((a, b) => a.commenceTime.localeCompare(b.commenceTime));
}

export default async function Draft() {
  const matches = await getMatches();
  const live = dataSource() === "live";
  const main = matches.filter((m) => m.league.key !== "other");
  const top = headline(main.length ? main : matches);
  const board = main.filter((m) => m.fair || m.pari).slice(0, 24);
  const value = matches.filter(hasValue).length;
  const chips = leagues
    .map((l) => ({ key: l.key, short: l.short, label: `Все прогнозы на ${l.acc}`, href: paths.league(l.slug), count: board.filter((m) => m.league.key === l.key).length }))
    .filter((l) => l.count > 0);
  const books = bookmakersByRating().slice(0, 4);

  return (
    <div className="container-x">
      <header className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4 pt-8 pb-6 sm:pt-10">
        <div className="min-w-0">
          <h1 className="font-display text-[clamp(26px,3.6vw,44px)] leading-[1.05] font-bold tracking-[-0.03em] text-balance">Футбол по цифрам</h1>
          <p className="mt-2 max-w-[56ch] text-[15px] text-pretty text-muted">
            Шансы на матчи по коэффициентам мировых букмекеров. <span className="rounded bg-hi px-1 font-semibold">Жёлтым</span> — где легальный букмекер платит больше честного.
          </p>
        </div>
        <p className="flex items-center gap-2 text-sm text-muted">
          {live && <span className="inline-block size-2 animate-pulse-dot rounded-full bg-win" />}
          <span className="num text-base font-semibold text-fg">{matches.length}</span> матчей на неделе ·
          <span className="num text-base font-semibold text-fg">{value}</span> выше честной цены
          {live && <> · {mskTime(new Date().toISOString())}</>}
        </p>
      </header>

      <section aria-labelledby="top-title">
        <h2 id="top-title" className="sr-only">
          Главные матчи
        </h2>
        <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3 [&>*]:w-[82%] [&>*]:shrink-0 sm:[&>*]:w-auto">
          {top.map((m) => (
            <MatchTile key={m.id} m={m} />
          ))}
        </div>
      </section>

      <section className="mt-14" aria-labelledby="week-title">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 id="week-title" className="font-display text-[clamp(20px,2.4vw,28px)] font-semibold tracking-[-0.02em]">
            Все матчи недели
          </h2>
          <Link href={paths.forecasts} className="link-more">
            Все прогнозы <span aria-hidden>→</span>
          </Link>
        </div>
        <BoardFilter chips={chips} legend={<BoardLegend odds={board.some((m) => m.pari)} />}>
          <BoardV2 matches={board} />
        </BoardFilter>
      </section>

      <section className="mt-14" aria-labelledby="books-title">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 id="books-title" className="font-display text-[clamp(20px,2.4vw,28px)] font-semibold tracking-[-0.02em]">
            Где ставить
          </h2>
          <Link href={paths.bookmakers} className="link-more">
            Весь рейтинг <span aria-hidden>→</span>
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {books.map((b) => (
            <Link key={b.slug} href={paths.bookmaker(b.slug)} className="group flex items-center gap-3 rounded-2xl bg-surface p-4 ring-1 ring-line transition hover:ring-line-strong">
              <BookLogo slug={b.slug} />
              <span className="min-w-0 flex-1">
                <b className="block font-semibold">{b.name}</b>
                <small className="block truncate text-xs text-muted">{b.bonus.headline}</small>
              </span>
              <span className="num text-2xl font-bold">{b.rating.toFixed(1)}</span>
            </Link>
          ))}
        </div>
        <p className="mt-2 text-xs text-subtle">Только букмекеры с лицензией ФНС России.</p>
      </section>
    </div>
  );
}
