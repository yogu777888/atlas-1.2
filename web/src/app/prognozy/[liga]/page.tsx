import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Board, BoardLegend } from "@/components/Board";
import { Fine, PageHead, SectionHead, Stats } from "@/components/Page";
import { Results } from "@/components/Results";
import { Standings } from "@/components/Standings";
import { getMatches } from "@/lib/data";
import { dateRange } from "@/lib/dates";
import { CLUB_LEAGUES, leagueBySlug, leagues, otherLeague, type ClubLeague, type League } from "@/lib/leagues";
import { hasValue, plural } from "@/lib/matches";
import { paths } from "@/lib/routes";
import { getSeason, leagueGames, seasonLabel, standings, teamsOf, type Season } from "@/lib/season";
import { site } from "@/lib/site";

export const revalidate = 300;

type Props = { params: Promise<{ liga: string }> };

export function generateStaticParams() {
  return [...leagues, otherLeague].map((l) => ({ liga: l.slug }));
}

const isClub = (key: string): key is ClubLeague => (CLUB_LEAGUES as readonly string[]).includes(key);

function titleFor(l: League) {
  if (l.key === "intl") return { title: "Прогнозы на матчи сборных", seo: "Прогнозы на матчи сборных: шансы и коэффициенты" };
  if (l.key === "other") return { title: "Прогнозы на другие турниры", seo: "Прогнозы на матчи других турниров" };
  return { title: `Прогнозы на ${l.acc}`, seo: `Прогнозы на ${l.acc}: шансы на матчи тура и таблица` };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const l = leagueBySlug((await params).liga);
  if (!l) return { title: "Турнир не найден" };
  const t = titleFor(l);
  const table = isClub(l.key) ? ` Таблица ${l.gen}, форма команд и результаты тура.` : l.key === "intl" ? " Лига наций, отборочные турниры и товарищеские матчи." : "";
  return {
    title: t.seo,
    description: `${t.title}: шансы на ближайшие матчи по коэффициентам мировых букмекеров без маржи.${table}`,
    alternates: { canonical: paths.league(l.slug) },
  };
}

export default async function LeaguePage({ params }: Props) {
  const l = leagueBySlug((await params).liga);
  if (!l) notFound();
  const [matches, season] = await Promise.all([getMatches(l.key), isClub(l.key) ? getSeason(l.key).catch(() => null) : Promise.resolve(null)]);
  const t = titleFor(l);
  const table = season ? standings(season.games) : [];
  const played = table.length ? Math.max(...table.map((r) => r.played)) : 0;
  const leader = played > 0 ? table[0] : null;
  const valueCount = matches.filter(hasValue).length;

  const lead = [
    matches.length
      ? `${matches.length} ${plural(matches.length, ["матч", "матча", "матчей"])} на ближайшую неделю, ${dateRange(matches[0].commenceTime, matches.at(-1)!.commenceTime)}.`
      : "На ближайшую неделю матчей нет: прогнозы появятся, когда букмекеры откроют линию.",
    leader ? `Лидер после ${played} ${plural(played, ["тура", "туров", "туров"])} — ${leader.name}, ${leader.points} ${plural(leader.points, ["очко", "очка", "очков"])}.` : "",
    "Шансы посчитаны по коэффициентам мировых букмекеров без маржи.",
  ].filter(Boolean).join(" ");

  return (
    <div className="container-x">
      <PageHead
        crumbs={[
          { label: "Прогнозы", href: paths.forecasts },
          { label: l.key === "intl" ? "Сборные" : l.short, href: paths.league(l.slug) },
        ]}
        title={t.title}
        animate
        lead={lead}
        aside={
          <Stats
            items={[
              { label: "Матчей на неделе", value: matches.length },
              { label: "Выше честной цены", value: valueCount },
              ...(season ? [{ label: "Сезон", value: seasonLabel(season.year) }] : []),
            ]}
          />
        }
      />

      <div className="mt-6 mb-3.5 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Другие турниры" className="hidden flex-wrap gap-1.5 sm:flex">
          {leagues.map((x) => (
            <Link key={x.key} href={paths.league(x.slug)} className="chip" aria-current={x.key === l.key ? "page" : undefined}>
              {x.short}
            </Link>
          ))}
        </nav>
        <BoardLegend odds={matches.some((m) => m.pari)} />
      </div>
      <Board matches={matches} showLeague={l.key === "intl" || l.key === "other"} empty={`На ближайшую неделю матчей нет. Прогнозы на ${l.acc} появятся, когда букмекеры откроют линию.`} />

      {season && table.length > 0 && <SeasonBlocks l={l} season={season} />}

      {l.format && (
        <section className="mt-block grid gap-8 border-t border-line pt-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <h2 className="text-xl font-extrabold tracking-tight">О турнире</h2>
          <div className="max-w-[68ch] space-y-3 text-muted prose-links">
            <p>{l.format}</p>
            <p>
              Прогноз на каждый матч — это шансы по мировому рынку, форма команд, личные встречи и список тех, кто не сыграет. Как мы получаем
              шансы из коэффициентов, рассказываем в разделе <Link href={paths.method}>«Как мы считаем»</Link>.
            </p>
          </div>
        </section>
      )}

      <Fine className="mt-12">Коэффициенты меняются. Перед ставкой проверьте итоговый коэффициент в купоне букмекера. {site.warning}</Fine>
    </div>
  );
}

function SeasonBlocks({ l, season }: { l: League; season: Season }) {
  const games = leagueGames(season.games);
  const table = standings(season.games);
  const teams = teamsOf(games);
  return (
    <>
      <div className="mt-block grid items-start gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <section>
          <SectionHead
            title={`Таблица ${l.gen} ${seasonLabel(season.year)}`}
            sub={`Посчитана по результатам матчей: очки, затем разница мячей.${season.demo ? " Сейчас показаны демо-данные." : ""}`}
          />
          <Standings rows={table} />
        </section>
        <section>
          <SectionHead title="Последние результаты" sub="И какой шанс рынок давал тому, что случилось." />
          <Results games={games} limit={10} />
        </section>
      </div>
      <section className="mt-block">
        <SectionHead title={`Команды ${l.gen}`} sub="Прогноз на следующий матч, форма и что было бы, если ставить на команду весь сезон." />
        <nav aria-label={`Команды ${l.gen}`} className="flex flex-wrap gap-1.5">
          {teams.map((t) => (
            <Link key={t.id} href={paths.team(t.slug)} className="chip">
              {t.name}
            </Link>
          ))}
        </nav>
      </section>
    </>
  );
}
