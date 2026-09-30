import type { MetadataRoute } from "next";
import { articles } from "@/content/articles";
import { bookmakers } from "@/lib/bookmakers";
import { getMatches } from "@/lib/data";
import { CLUB_LEAGUES, leagues } from "@/lib/leagues";
import { paths } from "@/lib/routes";
import { featuredPairs, pairSlug } from "@/lib/compare";
import { getSeason, leagueGames, teamsOf } from "@/lib/season";
import { site } from "@/lib/site";
import { tools } from "@/lib/tools";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const url = (p: string) => `${site.url}${p === "/" ? "" : p}`;
  const [matches, seasons] = await Promise.all([getMatches().catch(() => []), Promise.all(CLUB_LEAGUES.map((l) => getSeason(l).catch(() => null)))]);
  const teams = seasons.flatMap((s) => (s && !s.demo ? teamsOf(leagueGames(s.games)) : []));
  const pairs = seasons.flatMap((s) => (s && !s.demo ? featuredPairs(s) : []));
  const pages = [paths.home, paths.forecasts, paths.valueBets, paths.teams, paths.compare, paths.bookmakers, paths.bonuses, paths.articles, paths.tools, paths.whatIf, paths.method, paths.about, paths.responsible, paths.disclosure, paths.privacy, paths.terms];
  return [
    ...pages.map((p) => ({ url: url(p), lastModified: now, changeFrequency: "daily" as const, priority: p === "/" ? 1 : 0.6 })),
    ...leagues.map((l) => ({ url: url(paths.league(l.slug)), lastModified: now, changeFrequency: "hourly" as const, priority: 0.8 })),
    ...teams.map((t) => ({ url: url(paths.team(t.slug)), lastModified: now, changeFrequency: "daily" as const, priority: 0.6 })),
    ...pairs.map(([a, b]) => ({ url: url(paths.pair(pairSlug(a.name, b.name))), lastModified: now, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...bookmakers.map((b) => ({ url: url(paths.bookmaker(b.slug)), lastModified: now, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...articles.map((a) => ({ url: url(paths.article(a.slug)), lastModified: new Date(a.updated), changeFrequency: "monthly" as const, priority: 0.7 })),
    ...tools.map((t) => ({ url: url(paths.tool(t.slug)), lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...matches.filter((m) => !m.id.startsWith("demo-")).map((m) => ({ url: url(paths.match(m.slug)), lastModified: now, changeFrequency: "hourly" as const, priority: 0.7 })),
  ];
}
