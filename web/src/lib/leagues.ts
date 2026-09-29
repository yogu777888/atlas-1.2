/**
 * Leagues shown on tag.bet. sstats uses the widely used API-Football league
 * ids (e.g. 39 = Premier League, 42 = League Two, 45 = FA Cup), so each entry
 * matches on id first and on country + name as a fallback. Extra leagues can be
 * added with SSTATS_LEAGUE_IDS (comma separated ids).
 */
export type League = { key: string; label: string; short: string };

type Rule = League & { ids: number[]; country: RegExp; name: RegExp; exclude?: RegExp };

const WORLD = /^(world|europe|ww|eu)$/i;
const YOUTH_OR_WOMEN = /women|u-?\d{2}|youth|olympic/i;

const RULES: Rule[] = [
  { key: "rpl", label: "Российская Премьер-лига", short: "РПЛ", ids: [235], country: /^(russia|ru)$/i, name: /^premier league$/i },
  { key: "ucl", label: "Лига чемпионов УЕФА", short: "ЛЧ", ids: [2], country: WORLD, name: /^(uefa )?champions league$/i },
  { key: "epl", label: "Английская Премьер-лига", short: "АПЛ", ids: [39], country: /^(england|gb-eng|en|eng)$/i, name: /^premier league$/i },
  { key: "laliga", label: "Ла Лига", short: "Ла Лига", ids: [140], country: /^(spain|es)$/i, name: /^(la ?liga|primera divisi[oó]n)$/i },
  { key: "seriea", label: "Серия А", short: "Серия А", ids: [135], country: /^(italy|it)$/i, name: /^serie a$/i },
  { key: "bundesliga", label: "Бундеслига", short: "Бундеслига", ids: [78], country: /^(germany|de)$/i, name: /^bundesliga$/i },
  { key: "ligue1", label: "Лига 1", short: "Лига 1", ids: [61], country: /^(france|fr)$/i, name: /^ligue 1$/i },
  { key: "uel", label: "Лига Европы УЕФА", short: "ЛЕ", ids: [3], country: WORLD, name: /^(uefa )?europa league$/i },
  {
    // National teams: the only football that matters during international breaks
    key: "intl",
    label: "Матчи сборных",
    short: "Сборные",
    ids: [5, 10, 29, 30, 31, 32, 34, 536, 960],
    country: WORLD,
    name: /nations league|world cup - qualification|euro championship - qualification|^friendlies$/i,
    exclude: YOUTH_OR_WOMEN,
  },
];

export const leagues: League[] = RULES.map(({ key, label, short }) => ({ key, label, short }));

/** Tab for games outside the top leagues */
export const otherLeague: League = { key: "other", label: "Другие турниры", short: "Другие" };

export function getLeague(key: string | null | undefined): League | undefined {
  if (key === otherLeague.key) return otherLeague;
  return leagues.find((l) => l.key === key);
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
  if (rule) return { key: rule.key, label: rule.label, short: rule.short };
  if (idOverride.includes(l.id)) return { key: `l${l.id}`, label: l.name, short: l.name };
  return undefined;
}

/** Club competitions (everything we cover except national teams). */
export const isClubTop = (key: string) => key !== "other" && key !== "intl";

/** Primary sstats id of one of our leagues (club leagues only have one). */
export const leagueSourceId = (key: string) => RULES.find((r) => r.key === key)?.ids[0];
