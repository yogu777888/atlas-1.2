import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BankChart } from "@/components/BankChart";
import { FormColumn } from "@/components/ForecastBlocks";
import { MatchCard } from "@/components/MatchCard";
import { Fine, PageHead, SectionHead, Stats } from "@/components/Page";
import { Standings } from "@/components/Standings";
import { getMatchDetail, getMatches, teamRecent, toMatch } from "@/lib/data";
import { dayMonth, mskTime, shortDay } from "@/lib/dates";
import { getLeague } from "@/lib/leagues";
import { plural, type Match } from "@/lib/matches";
import { paths } from "@/lib/routes";
import { findTeam, seasonLabel, teamSeason } from "@/lib/season";
import { site } from "@/lib/site";
import { clubLeagueOf, teamRu } from "@/lib/teams";
import { ledger, STAKE, toPlayed } from "@/lib/whatif";

export const revalidate = 1800;

type Props = { params: Promise<{ team: string }> };

/** Nothing at build time: each team page is rendered on its first visit and then cached. */
export function generateStaticParams() {
  return [];
}

const load = async (slug: string) => findTeam(slug, clubLeagueOf(slug));
const rub = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toLocaleString("ru-RU")} ₽`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).team;
  const found = await load(slug);
  if (!found) return { title: "Команда не найдена" };
  const { team, season } = found;
  const l = getLeague(season.league)!;
  const ts = teamSeason(season, team.id);
  const place = ts.place && ts.row?.played ? `${ts.place}-е место в таблице, ` : "";
  return {
    title: `${team.name}: прогноз на следующий матч, форма, ставки`,
    description: `${team.name} (${l.label}): прогноз на следующий матч, форма в последних играх, ${place}итог ставок на команду в сезоне ${seasonLabel(season.year)}.`,
    alternates: { canonical: paths.team(slug) },
  };
}

export default async function TeamPage({ params }: Props) {
  const slug = (await params).team;
  const found = await load(slug);
  if (!found) notFound();
  const { team, season } = found;
  const l = getLeague(season.league)!;
  const ts = teamSeason(season, team.id);
  const [upcoming, recent] = await Promise.all([getMatches().catch(() => [] as Match[]), teamRecent(team.id, season)]);

  // Next match: from the week's forecasts when it's there (with a bookmaker line), else from the season schedule
  const mine = upcoming.find((m) => m.homeId === team.id || m.awayId === team.id);
  const next = mine ?? (ts.upcoming[0] ? toMatch(ts.upcoming[0], l, null, season.demo) : null);
  const detail = mine ? await getMatchDetail(mine).catch(() => null) : null;

  const played = toPlayed(season.games);
  const back = ledger(played, team.id);
  const against = ledger(played, team.id, "lose");
  const draw = ledger(played, team.id, "draw");
  const row = ts.row;

  const leadParts = [
    row && row.played > 0
      ? `${ts.place}-е место в таблице ${l.gen}: ${row.points} ${plural(row.points, ["очко", "очка", "очков"])} после ${row.played} ${plural(row.played, ["матча", "матчей", "матчей"])}.`
      : `${l.label}, сезон ${seasonLabel(season.year)}.`,
    next ? `Следующий матч: ${next.home} — ${next.away}, ${dayMonth(next.commenceTime)} в ${mskTime(next.commenceTime)} мск.` : "",
  ];

  return (
    <div className="container-x">
      <PageHead
        crumbs={[
          { label: "Команды", href: paths.teams },
          { label: team.name, href: paths.team(slug) },
        ]}
        title={team.name}
        lead={leadParts.filter(Boolean).join(" ")}
        aside={
          row && row.played > 0 ? (
            <Stats
              items={[
                { label: "Место", value: ts.place ?? "—" },
                { label: "Очки", value: row.points },
                { label: "В · Н · П", value: `${row.won}·${row.drawn}·${row.lost}` },
                { label: "Мячи", value: `${row.gf}:${row.ga}` },
              ]}
            />
          ) : undefined
        }
      />

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-12">
          {recent.length > 0 && (
            <section>
              <SectionHead title="Форма" sub={season.demo ? "Последние матчи сезона (демо-данные)." : "Последние матчи во всех турнирах."} />
              <FormColumn team={team.name} games={recent} />
            </section>
          )}

          {back.steps.length >= 3 && (
            <section>
              <SectionHead
                title="А что, если ставить на команду весь сезон"
                sub={`По ${STAKE} ₽ на каждый матч ${l.gen} сезона ${seasonLabel(season.year)} по коэффициентам закрытия линии.`}
              />
              <div className="card p-5 sm:p-6">
                <p className="text-sm text-muted">
                  На победу в каждом из {back.steps.length} {plural(back.steps.length, ["матча", "матчей", "матчей"])}:
                </p>
                <p className={`num mt-1 text-[56px] leading-none font-bold ${back.profit >= 0 ? "text-win" : "text-loss"}`}>{rub(back.profit)}</p>
                <div className="mt-4">
                  <BankChart steps={back.steps} />
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                  <Fact k="Выиграно ставок" v={`${back.wins} из ${back.steps.length}`} />
                  <Fact k="Средний коэффициент" v={back.avgPrice.toFixed(2)} />
                  <Fact k="Если ставить против" v={rub(against.profit)} tone={against.profit} />
                  <Fact k="Если на ничью" v={rub(draw.profit)} tone={draw.profit} />
                </dl>
                <p className="mt-4 text-sm text-muted">
                  Прошлые результаты не подсказывают будущие: коэффициенты уже учитывают силу команды.{" "}
                  <Link href={`${paths.whatIf}?league=${season.league}&season=${season.year}&team=${team.id}`} className="font-semibold text-fg underline decoration-hi decoration-2 underline-offset-4">
                    Подробный разбор по матчам
                  </Link>
                </p>
              </div>
            </section>
          )}

          <section>
            <SectionHead title={`Таблица ${l.gen} ${seasonLabel(season.year)}`} href={paths.league(l.slug)} cta={`Прогнозы на ${l.acc}`} />
            <Standings rows={ts.table} highlight={team.id} />
          </section>
        </div>

        <aside className="grid gap-5 lg:sticky lg:top-20">
          {next && next.fair ? (
            <MatchCard m={next} d={detail} kicker="Следующий матч" />
          ) : next ? (
            <article className="card p-5">
              <span className="kicker">Следующий матч</span>
              <h3 className="mt-2.5 text-xl font-extrabold tracking-tight">
                {next.home} — {next.away}
              </h3>
              <p className="mt-1 text-sm text-muted">
                {dayMonth(next.commenceTime)}, {mskTime(next.commenceTime)} мск. Прогноз появится, когда букмекеры откроют линию.
              </p>
            </article>
          ) : null}
          {ts.upcoming.length > 1 && (
            <article className="card p-5">
              <span className="kicker">Календарь {l.short}</span>
              <ul className="mt-2 divide-y divide-line text-sm">
                {ts.upcoming.slice(0, 6).map((g) => {
                  const home = Number(g.homeTeam.id) === team.id;
                  const opp = teamRu(home ? g.awayTeam.name : g.homeTeam.name);
                  const iso = new Date((g.dateUtc ?? 0) * 1000).toISOString();
                  const hasForecast = upcoming.find((m) => m.sstatsId === g.id);
                  return (
                    <li key={g.id} className="flex items-center justify-between gap-3 py-2">
                      <span className="min-w-0 truncate">
                        <span className="text-subtle">{shortDay(iso)}</span> · {home ? "дома" : "в гостях"} ·{" "}
                        {hasForecast ? (
                          <Link href={paths.match(hasForecast.slug)} className="font-semibold underline decoration-hi decoration-2 underline-offset-4">
                            {opp}
                          </Link>
                        ) : (
                          opp
                        )}
                      </span>
                      <span className="num shrink-0 text-muted">{mskTime(iso)}</span>
                    </li>
                  );
                })}
              </ul>
            </article>
          )}
        </aside>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SportsTeam",
            name: team.name,
            sport: "Football",
            memberOf: { "@type": "SportsOrganization", name: l.label },
            url: `${site.url}${paths.team(slug)}`,
          }),
        }}
      />
      <Fine className="mt-10">
        Прогнозы — оценка шансов по рынку, а не гарантия результата. {site.warning}
      </Fine>
    </div>
  );
}

function Fact({ k, v, tone }: { k: string; v: string; tone?: number }) {
  return (
    <div className="rounded-lg bg-surface-2 p-3 ring-1 ring-line">
      <dt className="text-xs text-subtle">{k}</dt>
      <dd className={`num mt-0.5 text-lg font-bold ${tone === undefined ? "" : tone >= 0 ? "text-win" : "text-loss"}`}>{v}</dd>
    </div>
  );
}
