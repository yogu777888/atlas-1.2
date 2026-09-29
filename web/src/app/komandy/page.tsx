import type { Metadata } from "next";
import Link from "next/link";
import { PageHead, SectionHead } from "@/components/Page";
import { CLUB_LEAGUES, getLeague } from "@/lib/leagues";
import { paths } from "@/lib/routes";
import { getSeason, leagueGames, teamsOf } from "@/lib/season";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Команды РПЛ и топ-лиг Европы: прогнозы, форма, статистика",
  description:
    "Страницы клубов РПЛ, АПЛ, Ла Лиги, Серии А, Бундеслиги и Лиги 1: прогноз на следующий матч, форма, место в таблице и итог ставок на команду за сезон.",
  alternates: { canonical: paths.teams },
};

export default async function TeamsPage() {
  const seasons = await Promise.all(CLUB_LEAGUES.map((l) => getSeason(l).catch(() => null)));
  return (
    <div className="container-x">
      <PageHead
        crumbs={[{ label: "Команды", href: paths.teams }]}
        title="Команды"
        animate
        lead="Клубы РПЛ и пяти главных лиг Европы. На странице команды — прогноз на её следующий матч, форма, место в таблице и сколько принесли бы ставки на неё с начала сезона."
      />
      <div className="mt-8 grid gap-10 md:grid-cols-2">
        {CLUB_LEAGUES.map((key, i) => {
          const s = seasons[i];
          const l = getLeague(key)!;
          const teams = s ? teamsOf(leagueGames(s.games)) : [];
          if (!teams.length) return null;
          return (
            <section key={key} data-reveal>
              <SectionHead title={l.label} level={3} href={paths.league(l.slug)} cta="Прогнозы и таблица" />
              <nav aria-label={`Команды: ${l.label}`} className="flex flex-wrap gap-1.5">
                {teams.map((t) => (
                  <Link key={t.id} href={paths.team(t.slug)} className="chip">
                    {t.name}
                  </Link>
                ))}
              </nav>
            </section>
          );
        })}
      </div>
    </div>
  );
}
