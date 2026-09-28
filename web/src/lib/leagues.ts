/**
 * Leagues shown on tag.bet. sstats names leagues in English, so each entry
 * matches on country + league name. Override with SSTATS_LEAGUE_IDS (comma
 * separated sstats league ids) once you know the exact ids.
 */
export type League = { key: string; label: string; short: string };

type Rule = League & { country: RegExp; name: RegExp };

const RULES: Rule[] = [
  { key: "rpl", label: "Российская Премьер-лига", short: "РПЛ", country: /^(russia|ru)$/i, name: /premier/i },
  { key: "ucl", label: "Лига чемпионов УЕФА", short: "ЛЧ", country: /^(world|europe|ww|eu)$/i, name: /^(uefa )?champions league$/i },
  { key: "epl", label: "Английская Премьер-лига", short: "АПЛ", country: /^(england|gb-eng|en|eng)$/i, name: /^premier league$/i },
  { key: "laliga", label: "Ла Лига", short: "Ла Лига", country: /^(spain|es)$/i, name: /^(la ?liga|primera division)$/i },
  { key: "seriea", label: "Серия А", short: "Серия А", country: /^(italy|it)$/i, name: /^serie a$/i },
  { key: "bundesliga", label: "Бундеслига", short: "Бундеслига", country: /^(germany|de)$/i, name: /^bundesliga$/i },
  { key: "ligue1", label: "Лига 1", short: "Лига 1", country: /^(france|fr)$/i, name: /^ligue 1$/i },
  { key: "uel", label: "Лига Европы УЕФА", short: "ЛЕ", country: /^(world|europe|ww|eu)$/i, name: /^(uefa )?europa league$/i },
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
  const rule = RULES.find((r) => r.name.test(l.name) && country.some((c) => r.country.test(c)));
  if (rule) return { key: rule.key, label: rule.label, short: rule.short };
  if (idOverride.includes(l.id)) return { key: `l${l.id}`, label: l.name, short: l.name };
  return undefined;
}
