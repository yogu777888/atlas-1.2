export const site = {
  name: "tag.bet",
  tagline: "Разбор матча за 30 секунд.",
  description:
    "tag.bet показывает реальные шансы команд по мировому рынку, сравнивает их с коэффициентами легальных букмекеров и собирает бонусы с понятными условиями.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://tag.bet").replace(/\/$/, ""),
  supportEmail: "hello@tag.bet",
  /** Required by Russian advertising law next to gambling content */
  warning: "18+. Азартные игры могут вызывать зависимость. Играйте ответственно.",
} as const;

export const nav = [
  { href: "/matches", label: "Матчи" },
  { href: "/bookmakers", label: "Букмекеры" },
  { href: "/bonuses", label: "Бонусы" },
  { href: "/articles", label: "Статьи" },
  { href: "/tools", label: "Калькуляторы" },
] as const;
