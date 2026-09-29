/**
 * Every internal URL in one place. Paths are Russian transliteration, so a link
 * reads like what it points to: /prognozy/rpl, /prognoz/zenit-spartak-1632014.
 */
export const paths = {
  home: "/",
  forecasts: "/prognozy",
  valueBets: "/prognozy/vygodnye",
  league: (slug: string) => `/prognozy/${slug}`,
  match: (slug: string) => `/prognoz/${slug}`,
  teams: "/komandy",
  team: (slug: string) => `/komandy/${slug}`,
  bookmakers: "/bukmekery",
  bookmaker: (slug: string) => `/bukmekery/${slug}`,
  bonuses: "/bonusy",
  articles: "/stati",
  article: (slug: string) => `/stati/${slug}`,
  tools: "/kalkulyatory",
  tool: (slug: string) => `/kalkulyatory/${slug}`,
  whatIf: "/chto-esli",
  method: "/metodika",
  about: "/o-redakcii",
  responsible: "/otvetstvennaya-igra",
  disclosure: "/reklama",
  privacy: "/konfidencialnost",
  terms: "/usloviya",
} as const;
