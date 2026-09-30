import Link from "next/link";
import { dayHeading, mskDay } from "@/lib/dates";
import { isValue, moved, odds, OUTCOMES, plural, type Match } from "@/lib/matches";
import { paths } from "@/lib/routes";
import { LocalClock } from "../LocalClock";
import { TeamMark } from "../TeamMark";
import { ChanceBar } from "./ChanceBar";

const priced = (m: Match) => !!m.fair || !!m.pari;
const n = (k: number) => `${k} ${plural(k, ["матч", "матча", "матчей"])}`;

/**
 * The week's table without boxes: day headings, then one line per match —
 * time, the two teams stacked with crests, the chance bar, the bookmaker's
 * prices with the yellow one where it beats fair.
 */
export function BoardV2({ matches, showLeague = true }: { matches: Match[]; showLeague?: boolean }) {
  const days = new Map<string, Match[]>();
  for (const m of matches) days.set(mskDay(m.commenceTime), [...(days.get(mskDay(m.commenceTime)) ?? []), m]);
  const hasOdds = matches.some((m) => m.pari);
  return (
    <div>
      {[...days.values()].map((list) => {
        const h = dayHeading(list[0].commenceTime);
        const shown = list.filter(priced), rest = list.filter((m) => !priced(m));
        return (
          <section key={mskDay(list[0].commenceTime)} data-lgs={[...new Set(list.map((m) => m.league.key))].join(" ")} className="mb-8 last:mb-0">
            <div className="flex items-baseline gap-3 border-b border-line-strong pb-2">
              <span className="font-display text-lg font-semibold tracking-[-0.01em]">{h.name}</span>
              <span className="text-sm text-muted">{h.sub}</span>
              <span data-count className="ml-auto text-xs text-subtle">{n(list.length)}</span>
            </div>
            {hasOdds && (
              <div className="bd-detail hidden grid-cols-[3.4rem_minmax(0,1fr)_17rem_9.5rem_1rem] gap-5 pt-2 text-[11px] text-subtle sm:grid" aria-hidden>
                <span />
                <span />
                <span className="flex justify-between">
                  <span>П1</span>
                  <span>шансы, %</span>
                  <span>П2</span>
                </span>
                <span className="grid grid-cols-3 text-center">
                  <span>П1</span>
                  <span>X</span>
                  <span>П2</span>
                </span>
                <span />
              </div>
            )}
            {shown.map((m) => (
              <Row key={m.id} m={m} showLeague={showLeague} hasOdds={hasOdds} />
            ))}
            {rest.length > 0 && (
              <p className="border-b border-row py-3 text-xs text-subtle">
                Ещё {n(rest.length)} без линии: {rest.map((m) => `${m.home} — ${m.away}`).join(", ")}
              </p>
            )}
          </section>
        );
      })}
    </div>
  );
}

function Row({ m, showLeague, hasOdds }: { m: Match; showLeague: boolean; hasOdds: boolean }) {
  return (
    <Link
      href={paths.match(m.slug)}
      data-lg={m.league.key}
      data-reveal
      className="group grid grid-cols-[3rem_minmax(0,1fr)_1rem] items-center gap-x-4 gap-y-3 border-b border-row py-3.5 transition-colors hover:bg-surface/60 sm:grid-cols-[3.4rem_minmax(0,1fr)_17rem_9.5rem_1rem] sm:gap-x-5"
    >
      <span className="self-start pt-0.5">
        <LocalClock iso={m.commenceTime} className="num block text-lg leading-none font-semibold" />
        {showLeague && <small className="mt-1 block truncate text-[11px] text-subtle">{m.league.short}</small>}
      </span>
      <span className="grid min-w-0 gap-1.5">
        {[m.home, m.away].map((t) => (
          <span key={t} className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-5 shrink-0 place-items-center">
              <TeamMark name={t} size={18} />
            </span>
            <span className="truncate font-semibold">{t}</span>
          </span>
        ))}
      </span>
      <span className="col-span-3 sm:col-span-1">
        <ChanceBar m={m} size="sm" />
      </span>
      {hasOdds ? (
        <span className="bd-detail col-span-2 grid grid-cols-3 text-center sm:col-span-1">
          {OUTCOMES.map((o) => {
            const price = m.pari?.odds[o];
            const good = !!price && !!m.fair && isValue(price, m.fair[o]);
            const move = price ? moved(price, m.pari?.open?.[o]) : 0;
            return (
              <span key={o} className={`num relative mx-auto rounded px-1.5 py-0.5 text-base ${good ? "bg-hi font-bold" : "font-medium text-fg-2"}`}>
                {price ? odds(price) : "—"}
                {move !== 0 && <i className={`absolute -top-1 -right-1.5 text-[8px] not-italic ${move > 0 ? "text-win" : "text-loss"}`}>{move > 0 ? "▲" : "▼"}</i>}
              </span>
            );
          })}
        </span>
      ) : (
        <span className="hidden sm:block" />
      )}
      <span className="col-start-3 row-start-1 self-center text-subtle transition group-hover:translate-x-[3px] group-hover:text-fg sm:col-start-5" aria-hidden>
        →
      </span>
    </Link>
  );
}
