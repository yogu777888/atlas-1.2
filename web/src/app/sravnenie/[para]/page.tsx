import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { CompareBars } from "@/components/CompareBars";
import { HeadToHead } from "@/components/ForecastBlocks";
import { Faq, Fine, PageHead, SectionHead } from "@/components/Page";
import { Scorers } from "@/components/Scorers";
import { TeamMark } from "@/components/TeamMark";
import { featuredPairs, pairOrder, pairSlug, parsePair, tally, teamRows, verdictText } from "@/lib/compare";
import { getMatches } from "@/lib/data";
import { dayMonth, mskTime } from "@/lib/dates";
import { headToHead, toH2H, type H2HGame } from "@/lib/forecast";
import { getLeague } from "@/lib/leagues";
import { pct, plural, type Match } from "@/lib/matches";
import { paths } from "@/lib/routes";
import { findTeam, resultOf, standings, type Season, type TeamRef } from "@/lib/season";
import { site } from "@/lib/site";
import { pairStats } from "@/lib/stats-store";
import { clubLeagueOf } from "@/lib/teams";

export const revalidate = 3600;

type Props = { params: Promise<{ para: string }> };

/** Nothing at build time: each pair is rendered on its first visit and then cached. */
export function generateStaticParams() {
  return [];
}

async function load(para: string) {
  const p = parsePair(para);
  if (!p) return null;
  const [x, y] = await Promise.all(p.map((s) => findTeam(s, clubLeagueOf(s))));
  if (!x || !y || x.season.league !== y.season.league || x.team.id === y.team.id) return null;
  const [a, b] = pairOrder(x.team.name, y.team.name)[0] === x.team.name ? [x.team, y.team] : [y.team, x.team];
  return { a, b, season: x.season };
}

/** The next league game between the two, if the schedule has one. */
function nextMeeting(season: Season, a: TeamRef, b: TeamRef, now = Date.now()) {
  return season.games
    .filter((g) => !resultOf(g) && (g.dateUtc ?? 0) * 1000 > now - 2 * 3_600_000)
    .filter((g) => [Number(g.homeTeam.id), Number(g.awayTeam.id)].sort().join() === [a.id, b.id].sort().join())
    .sort((x, y) => (x.dateUtc ?? 0) - (y.dateUtc ?? 0))[0];
}

/** Indexed: the top of the table and famous clubs with each other, or a meeting within two weeks. */
function indexable(season: Season, a: TeamRef, b: TeamRef) {
  const featured = featuredPairs(season).some(([x, y]) => (x.id === a.id && y.id === b.id) || (x.id === b.id && y.id === a.id));
  const next = nextMeeting(season, a, b);
  return featured || (!!next && (next.dateUtc ?? 0) * 1000 - Date.now() < 14 * 86_400_000);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await load((await params).para);
  if (!found) return { title: "Сравнение не найдено" };
  const { a, b, season } = found;
  const l = getLeague(season.league)!;
  return {
    title: `${a.name} или ${b.name}: кто сильнее — сравнение команд в цифрах`,
    description: `${a.name} и ${b.name} в цифрах: голы, xG, удары, угловые и форма в последних матчах ${l.gen}, лучшие бомбардиры и личные встречи.`,
    alternates: { canonical: paths.pair(pairSlug(a.name, b.name)) },
    robots: indexable(season, a, b) ? undefined : { index: false, follow: true },
  };
}

export default async function PairPage({ params }: Props) {
  const { para } = await params;
  const found = await load(para);
  if (!found) notFound();
  const { a, b, season } = found;
  const canonical = pairSlug(a.name, b.name);
  if (para !== canonical) permanentRedirect(paths.pair(canonical));

  const l = getLeague(season.league)!;
  const table = standings(season.games);
  const ra = table.find((r) => r.id === a.id), rb = table.find((r) => r.id === b.id);
  const [stats, h2h, matches] = await Promise.all([
    pairStats(season.league, a.id, b.id),
    season.demo ? Promise.resolve(demoH2H(season, a, b)) : headToHead(a.id, b.id, 6),
    getMatches().catch(() => [] as Match[]),
  ]);
  const rows = stats.ok ? teamRows(stats.a.profile!, stats.b.profile!, ra, rb) : [];
  const t = tally(rows);
  const verdict = stats.ok ? verdictText(a.name, b.name, stats.a.profile!, stats.b.profile!, rows) : [];
  const meeting = nextMeeting(season, a, b);
  const forecast = meeting ? matches.find((m) => m.sstatsId === meeting.id) : undefined;
  const others = featuredPairs(season)
    .filter(([x, y]) => (x.id === a.id || y.id === a.id || x.id === b.id || y.id === b.id) && !(x.id === a.id && y.id === b.id))
    .slice(0, 10);
  const window = Math.min(stats.a.games, stats.b.games);
  const place = (r?: { id: number }) => (r ? table.findIndex((x) => x.id === r.id) + 1 : null);

  return (
    <div className="container-x">
      <PageHead
        crumbs={[
          { label: "Сравнение команд", href: paths.compare },
          { label: `${a.name} — ${b.name}`, href: paths.pair(canonical) },
        ]}
        title={
          <>
            {a.name} или {b.name}: кто сильнее
          </>
        }
        lead={
          verdict.length ? (
            <p>{verdict.join(" ")}</p>
          ) : (
            <p>
              {l.label}: {a.name} — {place(ra) ?? "—"}-е место, {b.name} — {place(rb) ?? "—"}-е. Подробная статистика по матчам ещё собирается, загляните через час.
            </p>
          )
        }
        aside={
          rows.length ? (
            <div className="grid gap-1 text-center">
              <span className="text-xs text-muted">лучше по параметрам</span>
              <span className="flex items-center gap-3">
                <TeamMark name={a.name} size={26} />
                <span className="num text-[54px] leading-none font-bold">
                  {t.left}
                  <span className="px-1 text-subtle">:</span>
                  {t.right}
                </span>
                <TeamMark name={b.name} size={26} />
              </span>
            </div>
          ) : undefined
        }
      />

      {meeting && (
        <Link
          href={forecast ? paths.match(forecast.slug) : paths.league(l.slug)}
          className="card group mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-4 transition-colors hover:border-line-strong"
        >
          <span>
            <span className="kicker">Следующая встреча</span>
            <span className="mt-1 block font-bold">
              {meeting.homeTeam.id === a.id ? `${a.name} — ${b.name}` : `${b.name} — ${a.name}`}, {dayMonth(new Date((meeting.dateUtc ?? 0) * 1000).toISOString())} в{" "}
              {mskTime(new Date((meeting.dateUtc ?? 0) * 1000).toISOString())} мск
            </span>
          </span>
          <span className="text-sm text-muted">
            {forecast?.fair ? (
              <>
                Шансы рынка: <b className="num text-base text-fg">{pct(forecast.fair.home)}</b> · <b className="num text-base text-fg">{pct(forecast.fair.draw)}</b> ·{" "}
                <b className="num text-base text-fg">{pct(forecast.fair.away)}</b>
              </>
            ) : (
              "Прогноз появится, когда букмекеры откроют линию"
            )}
            <span className="ml-2 inline-block transition group-hover:translate-x-[3px]" aria-hidden>
              →
            </span>
          </span>
        </Link>
      )}

      {rows.length > 0 && (
        <section className="mt-block">
          <SectionHead
            title="Команды в цифрах"
            sub={`Средние за последние ${window} ${plural(window, ["матч", "матча", "матчей"])} ${l.gen} у каждой команды${stats.demo ? " (демо-данные)" : ""}. Тёмная полоса — у кого показатель лучше.`}
          />
          <CompareBars left={a.name} right={b.name} rows={rows} />
          <p className="mt-3 max-w-[70ch] text-xs leading-relaxed text-subtle">
            xG — ожидаемые голы: сколько команда забила бы при средней реализации своих моментов. Лучше показывает силу атаки, чем сами голы, в которых много случайности.
          </p>
        </section>
      )}

      {stats.ok && (
        <section className="mt-block">
          <SectionHead title="Кто забивает" sub="Лучшие бомбардиры в этих матчах: голы, голы за 90 минут, удары и передачи." />
          <Scorers
            sides={[
              { team: a.name, players: stats.a.scorers, games: stats.a.games },
              { team: b.name, players: stats.b.scorers, games: stats.b.games },
            ]}
          />
        </section>
      )}

      {h2h.length > 0 && (
        <section className="mt-block">
          <SectionHead title="Личные встречи" sub="Последние матчи между командами во всех турнирах." />
          <HeadToHead games={h2h} home={a.name} />
        </section>
      )}

      {others.length > 0 && (
        <section className="mt-block">
          <SectionHead title="Другие сравнения" href={paths.compare} cta="Все пары" />
          <div className="flex flex-wrap gap-1.5">
            {others.map(([x, y]) => (
              <Link key={`${x.id}-${y.id}`} href={paths.pair(pairSlug(x.name, y.name))} className="chip">
                <TeamMark name={x.name} size={14} />
                {x.name} — {y.name}
                <TeamMark name={y.name} size={14} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {verdict.length > 0 && (
        <section className="mt-block">
          <Faq
            items={[
              { q: `Кто сильнее, ${a.name} или ${b.name}?`, a: verdict.join(" ") },
              {
                q: `Кто забивает больше, ${a.name} или ${b.name}?`,
                a: `В последних матчах ${l.gen} ${a.name} забивает ${rows.find((r) => r.label === "Забивает")?.fmt(stats.a.profile!.gf)} гола за игру, ${b.name} — ${rows.find((r) => r.label === "Забивает")?.fmt(stats.b.profile!.gf)}.${
                  stats.a.scorers[0] && stats.b.scorers[0]
                    ? ` Лучшие бомбардиры: ${stats.a.scorers[0].name} (${stats.a.scorers[0].goals}) и ${stats.b.scorers[0].name} (${stats.b.scorers[0].goals}).`
                    : ""
                }`,
              },
            ]}
          />
        </section>
      )}

      <Fine className="mt-12">
        Статистика матчей — sstats.net, обновляется после каждого тура. Сравнение описывает прошлые матчи и не гарантирует результат следующего. {site.warning}
      </Fine>
    </div>
  );
}

/** Demo head-to-head from the demo seasons, so it agrees with the table. */
function demoH2H(season: Season, a: TeamRef, b: TeamRef): H2HGame[] {
  return toH2H(
    season.games
      .filter((g) => resultOf(g) && [Number(g.homeTeam.id), Number(g.awayTeam.id)].sort().join() === [a.id, b.id].sort().join())
      .sort((x, y) => (y.dateUtc ?? 0) - (x.dateUtc ?? 0)),
  );
}

