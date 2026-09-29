import Link from "next/link";
import { dayHeading, mskDay, mskTime } from "@/lib/dates";
import { isValue, odds, OUTCOMES, outcomeLabel, plural, probClass, type Match } from "@/lib/matches";
import { paths } from "@/lib/routes";
import { Teams } from "./TeamMark";

const n = (k: number) => `${k} ${plural(k, ["матч", "матча", "матчей"])}`;

/**
 * The forecasts table: one row per match, grouped by day. The three chances
 * are coloured on the probability scale; a bookmaker price above fair gets the
 * yellow highlighter. Rows fade in and colour up as they scroll into view.
 */
export function Board({ matches, empty, showLeague = true }: { matches: Match[]; empty?: React.ReactNode; showLeague?: boolean }) {
  if (!matches.length) {
    return <div className="card px-5 py-10 text-center text-sm text-muted">{empty ?? "На ближайшую неделю матчей нет."}</div>;
  }
  const days = new Map<string, Match[]>();
  for (const m of matches) {
    const k = mskDay(m.commenceTime);
    days.set(k, [...(days.get(k) ?? []), m]);
  }
  const hasOdds = matches.some((m) => m.pari);
  let i = 0;
  return (
    <div className="card overflow-hidden">
      <div className="hidden grid-cols-[3.2rem_minmax(0,1fr)_auto_1rem] items-end gap-3.5 border-b border-line bg-surface-2 px-4 py-2 text-[11px] text-subtle sm:grid" aria-hidden>
        <span>Время</span>
        <span>Матч</span>
        <span className="flex gap-3.5">
          <Cols title="шансы, %" />
          {hasOdds && <Cols title="коэффициенты" />}
        </span>
        <span />
      </div>
      {[...days.values()].map((list) => {
        const h = dayHeading(list[0].commenceTime);
        return (
          <section key={mskDay(list[0].commenceTime)} className="border-t border-line first-of-type:border-t-0" aria-label={`${h.name}, ${h.sub}`}>
            <div className="flex items-baseline gap-3 px-4 pt-4 pb-1.5">
              <span className="num text-[40px] leading-[0.8] font-bold">{h.num}</span>
              <span className="font-bold">
                {h.name}
                <small className="block text-xs font-normal text-muted">{h.sub}</small>
              </span>
              <span className="ml-auto text-xs text-subtle">{n(list.length)}</span>
            </div>
            {list.map((m) => (
              <Row key={m.id} m={m} i={i++} showLeague={showLeague} hasOdds={hasOdds} />
            ))}
          </section>
        );
      })}
    </div>
  );
}

function Cols({ title }: { title: string }) {
  return (
    <span className="grid gap-0.5 text-center">
      <span>{title}</span>
      <span className="grid auto-cols-[3.1rem] grid-flow-col gap-[3px] font-semibold text-muted">
        <span>П1</span>
        <span>X</span>
        <span>П2</span>
      </span>
    </span>
  );
}

function Row({ m, i, showLeague, hasOdds }: { m: Match; i: number; showLeague: boolean; hasOdds: boolean }) {
  const fair = m.fair;
  const chances = fair ? OUTCOMES.map((o) => `${outcomeLabel(m, o)} ${Math.round(fair[o] * 100)}%`).join(", ") : "шансов пока нет";
  return (
    <Link
      href={paths.match(m.slug)}
      data-reveal
      style={{ transitionDelay: `${(i % 8) * 60}ms` }}
      className="group grid grid-cols-[2.8rem_minmax(0,1fr)_1rem] items-center gap-x-3.5 gap-y-2 border-t border-[#eef1ec] px-4 py-2.5 transition-colors hover:bg-surface-2 sm:grid-cols-[3.2rem_minmax(0,1fr)_auto_1rem]"
    >
      <span className="num text-lg font-semibold text-fg-2">{mskTime(m.commenceTime)}</span>
      <span className="min-w-0">
        <Teams home={m.home} away={m.away} className="font-semibold" />
        {showLeague && <small className="block truncate text-xs text-muted">{m.league.short === m.league.label ? m.league.label : m.league.label.replace(" УЕФА", "")}</small>}
      </span>
      <span className="col-span-3 flex gap-2.5 sm:col-span-1 sm:gap-3.5">
        <span className="sr-only">Шансы: {chances}.</span>
        <span className="grid auto-cols-[2.6rem] grid-flow-col gap-[3px] text-center sm:auto-cols-[3.1rem]" aria-hidden>
          {OUTCOMES.map((o, j) =>
            fair ? (
              <span key={o} className={`pc num rounded-[5px] py-1 text-base font-semibold sm:text-lg ${probClass(fair[o])}`} style={{ transitionDelay: `${120 + j * 90}ms` }}>
                {Math.round(fair[o] * 100)}
              </span>
            ) : (
              <span key={o} className="num py-1 text-base text-subtle sm:text-lg">
                —
              </span>
            ),
          )}
        </span>
        {hasOdds && (
          <span className="grid auto-cols-[2.6rem] grid-flow-col gap-[3px] text-center sm:auto-cols-[3.1rem]">
            {OUTCOMES.map((o) => {
              const price = m.pari?.odds[o];
              const good = !!price && !!fair && isValue(price, fair[o]);
              return (
                <span
                  key={o}
                  className={`num rounded-[3px] py-1 text-base sm:text-lg ${good ? "hl font-semibold text-fg" : "font-medium text-fg-2"}`}
                  style={good ? { transitionDelay: "600ms" } : undefined}
                >
                  {price ? odds(price) : "—"}
                  {good && <span className="sr-only"> — выше честной цены</span>}
                </span>
              );
            })}
          </span>
        )}
      </span>
      <span className="col-start-3 row-start-1 text-subtle transition group-hover:translate-x-[3px] group-hover:text-fg sm:col-start-4" aria-hidden>
        →
      </span>
    </Link>
  );
}

/** Colour scale and highlighter explained in one line above the table. */
export function BoardLegend({ odds: withOdds = true }: { odds?: boolean }) {
  return (
    <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
      <span className="inline-flex items-center gap-1.5">
        <i className="inline-block h-2.5 w-9 rounded-sm bg-[linear-gradient(90deg,var(--color-p1),var(--color-p2),var(--color-p3),var(--color-p4),var(--color-p5))]" aria-hidden />
        цвет — шанс исхода
      </span>
      {withOdds && (
        <span className="inline-flex items-center gap-1.5">
          <b className="num rounded-sm bg-hi px-1 text-[13px] font-semibold text-fg">2.25</b>
          коэффициент выше честной цены
        </span>
      )}
    </p>
  );
}
