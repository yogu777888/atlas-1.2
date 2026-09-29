export const site = {
  name: "tag.bet",
  tagline: "Прогнозы на футбол по цифрам.",
  description:
    "tag.bet — прогнозы на футбол по цифрам: шансы по мировому рынку, форма команд, личные встречи и кто не сыграет. Без «экспертов» и обещаний выигрыша.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://tag.bet").replace(/\/$/, ""),
  supportEmail: "hello@tag.bet",
  /** Required by Russian advertising law next to gambling content */
  warning: "18+. Азартные игры могут вызывать зависимость. Играйте ответственно.",
} as const;

export const nav = [
  { href: "/matches", label: "Прогнозы" },
  { href: "/bookmakers", label: "Букмекеры" },
  { href: "/bonuses", label: "Бонусы" },
  { href: "/articles", label: "Статьи" },
  { href: "/tools", label: "Калькуляторы" },
] as const;
