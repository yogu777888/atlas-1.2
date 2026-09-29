/**
 * Leagues shown on tag.bet. sstats uses the widely used API-Football league
 * ids (e.g. 39 = Premier League, 42 = League Two, 45 = FA Cup), so each entry
 * matches on id first and on country + name as a fallback. Extra leagues can be
 * added with SSTATS_LEAGUE_IDS (comma separated ids).
 */
export type League = {
  key: string;
  /** URL segment: /prognozy/<slug> */
  slug: string;
  label: string;
  short: string;
  /** "Прогнозы на …" (accusative) */
  acc: string;
  /** "таблица …", "лидер …" (genitive) */
  gen: string;
  /** One factual line about the format, for the league page */
  format?: string;
};

type Rule = League & { ids: number[]; country: RegExp; name: RegExp; exclude?: RegExp };

const WORLD = /^(world|europe|ww|eu)$/i;
const YOUTH_OR_WOMEN = /women|u-?\d{2}|youth|olympic/i;

const RULES: Rule[] = [
  { key: "rpl", slug: "rpl", label: "Российская Премьер-лига", short: "РПЛ", acc: "РПЛ", gen: "РПЛ", format: "16 команд, 30 туров: каждая команда играет с каждой дома и в гостях.", ids: [235], country: /^(russia|ru)$/i, name: /^premier league$/i },
  { key: "epl", slug: "apl", label: "Английская Премьер-лига", short: "АПЛ", acc: "АПЛ", gen: "АПЛ", format: "20 команд, 38 туров. Три последние команды вылетают в Чемпионшип.", ids: [39], country: /^(england|gb-eng|en|eng)$/i, name: /^premier league$/i },
  { key: "ucl", slug: "liga-chempionov", label: "Лига чемпионов УЕФА", short: "ЛЧ", acc: "Лигу чемпионов", gen: "Лиги чемпионов", format: "36 клубов в общем этапе, у каждого восемь матчей с разными соперниками. Первая восьмёрка выходит в 1/8 финала напрямую.", ids: [2], country: WORLD, name: /^(uefa )?champions league$/i },
  { key: "laliga", slug: "la-liga", label: "Ла Лига", short: "Ла Лига", acc: "Ла Лигу", gen: "Ла Лиги", format: "20 команд, 38 туров.", ids: [140], country: /^(spain|es)$/i, name: /^(la ?liga|primera divisi[oó]n)$/i },
  { key: "seriea", slug: "seriya-a", label: "Серия А", short: "Серия А", acc: "Серию А", gen: "Серии А", format: "20 команд, 38 туров.", ids: [135], country: /^(italy|it)$/i, name: /^serie a$/i },
  { key: "bundesliga", slug: "bundesliga", label: "Бундеслига", short: "Бундеслига", acc: "Бундеслигу", gen: "Бундеслиги", format: "18 команд, 34 тура.", ids: [78], country: /^(germany|de)$/i, name: /^bundesliga$/i },
  { key: "ligue1", slug: "liga-1", label: "Лига 1", short: "Лига 1", acc: "Лигу 1", gen: "Лиги 1", format: "18 команд, 34 тура.", ids: [61], country: /^(france|fr)$/i, name: /^ligue 1$/i },
  { key: "uel", slug: "liga-evropy", label: "Лига Европы УЕФА", short: "ЛЕ", acc: "Лигу Европы", gen: "Лиги Европы", format: "36 клубов в общем этапе, у каждого восемь матчей.", ids: [3], country: WORLD, name: /^(uefa )?europa league$/i },
  {
    // National teams: the only football that matters during international breaks
    key: "intl",
    slug: "sbornye",
    label: "Матчи сборных",
    short: "Сборные",
    acc: "матчи сборных",
    gen: "сборных",
    ids: [5, 10, 29, 30, 31, 32, 34, 536, 960],
    country: WORLD,
    name: /nations league|world cup - qualification|euro championship - qualification|^friendlies$/i,
    exclude: YOUTH_OR_WOMEN,
  },
];

export const leagues: League[] = RULES.map(({ key, slug, label, short, acc, gen, format }) => ({ key, slug, label, short, acc, gen, format }));

/** Tab for games outside the top leagues */
export const otherLeague: League = { key: "other", slug: "drugie", label: "Другие турниры", short: "Другие", acc: "другие турниры", gen: "других турниров" };

/** Club leagues with a season table and team pages, in the order they are listed */
export const CLUB_LEAGUES = ["rpl", "epl", "laliga", "seriea", "bundesliga", "ligue1"] as const;
export type ClubLeague = (typeof CLUB_LEAGUES)[number];

export function getLeague(key: string | null | undefined): League | undefined {
  if (key === otherLeague.key) return otherLeague;
  return leagues.find((l) => l.key === key);
}

export function leagueBySlug(slug: string): League | undefined {
  if (slug === otherLeague.slug) return otherLeague;
  return leagues.find((l) => l.slug === slug);
}

const idOverride = (process.env.SSTATS_LEAGUE_IDS ?? "")
  .split(",")
  .map((s) => Number(s.trim()))
  .filter(Boolean);

/** Our league for an sstats league, or undefined when it isn't one we cover. */
export function classifyLeague(l: { id: number; name: string; country: { code: string; name: string } | null } | null): League | undefined {
  if (!l) return undefined;
  const country = l.country ? [l.country.name, l.country.code] : [];
  const rule =
    RULES.find((r) => r.ids.includes(l.id)) ??
    RULES.find((r) => r.name.test(l.name) && !r.exclude?.test(l.name) && country.some((c) => r.country.test(c)));
  if (rule) return getLeague(rule.key);
  if (idOverride.includes(l.id)) return { key: `l${l.id}`, slug: `l${l.id}`, label: l.name, short: l.name, acc: l.name, gen: l.name };
  return undefined;
}

/** Club competitions (everything we cover except national teams). */
export const isClubTop = (key: string) => key !== "other" && key !== "intl";

/** Primary sstats id of one of our leagues (club leagues only have one). */
export const leagueSourceId = (key: string) => RULES.find((r) => r.key === key)?.ids[0];
