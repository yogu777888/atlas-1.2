import { paths } from "./routes";

export const site = {
  name: "tag.bet",
  tagline: "Прогнозы на футбол по цифрам",
  description:
    "Прогнозы на футбол по цифрам: шансы по коэффициентам мировых букмекеров без маржи, форма команд, личные встречи и составы. РПЛ, АПЛ, Лига чемпионов.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://tag.bet").replace(/\/$/, ""),
  supportEmail: "hello@tag.bet",
  /** Required by Russian advertising law next to gambling content */
  warning: "18+. Азартные игры могут вызывать зависимость. Играйте ответственно.",
} as const;

/** Main sections. `match` lists extra path prefixes that belong to the section. */
export const nav = [
  { href: paths.forecasts, label: "Прогнозы", match: ["/prognoz/"] },
  { href: paths.teams, label: "Команды", match: [paths.whatIf] },
  { href: paths.bookmakers, label: "Букмекеры", match: [] },
  { href: paths.bonuses, label: "Бонусы", match: [] },
  { href: paths.articles, label: "Статьи", match: [paths.tools] },
] as const;
