import type { Metadata } from "next";
import Link from "next/link";
import { ComparePicker } from "@/components/ComparePicker";
import { Fine, PageHead, SectionHead } from "@/components/Page";
import { TeamMark } from "@/components/TeamMark";
import { featuredPairs, pairSlug } from "@/lib/compare";
import { CLUB_LEAGUES, getLeague } from "@/lib/leagues";
import { paths } from "@/lib/routes";
import { getSeason, leagueGames, teamsOf } from "@/lib/season";
import { site } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Сравнение футбольных команд в цифрах: кто сильнее",
  description: "Сравните любые две команды РПЛ и топ-лиг Европы: голы, xG, удары, угловые, форма, бомбардиры и личные встречи — на одной странице с понятными графиками.",
  alternates: { canonical: paths.compare },
};

export default async function ComparePage() {
  const seasons = await Promise.all(CLUB_LEAGUES.map((l) => getSeason(l)));
  const leagues = seasons.map((s) => ({ key: s.league, label: getLeague(s.league)!.label, teams: teamsOf(leagueGames(s.games)).map((t) => ({ name: t.name, slug: t.slug })) }));

  return (
    <div className="container-x">
      <PageHead
        crumbs={[{ label: "Сравнение команд", href: paths.compare }]}
        title="Сравнение команд"
        animate
        lead="Две команды рядом, параметр за параметром: голы, качество моментов (xG), удары, угловые, форма и лучшие бомбардиры. Выделенная полоса — у кого показатель лучше."
      />
      <div className="mt-6">
        <ComparePicker leagues={leagues} />
      </div>

      {seasons.map((s) => {
        const l = getLeague(s.league)!;
        const pairs = featuredPairs(s);
        if (!pairs.length) return null;
        return (
          <section key={s.league} className="mt-block">
            <SectionHead title={l.label} level={3} href={paths.league(l.slug)} cta="Прогнозы и таблица" />
            <div className="flex flex-wrap gap-1.5">
              {pairs.map(([x, y]) => (
                <Link key={`${x.id}-${y.id}`} href={paths.pair(pairSlug(x.name, y.name))} className="chip">
                  <TeamMark name={x.name} size={14} />
                  {x.name} — {y.name}
                  <TeamMark name={y.name} size={14} />
                </Link>
              ))}
            </div>
          </section>
        );
      })}
      <Fine className="mt-12">Статистика матчей — sstats.net, обновляется после каждого тура. {site.warning}</Fine>
    </div>
  );
}
