export const site = {
  name: "tag.bet",
  tagline: "Лучший коэффициент — с одного взгляда.",
  description:
    "tag.bet сравнивает коэффициенты легальных российских букмекеров, отмечает лучшую цену на каждый исход и собирает бонусы с понятными условиями.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://tag.bet").replace(/\/$/, ""),
  supportEmail: "hello@tag.bet",
  /** Required by Russian advertising law next to gambling content */
  warning: "18+. Азартные игры могут вызывать зависимость. Играйте ответственно.",
} as const;

export const nav = [
  { href: "/odds", label: "Коэффициенты" },
  { href: "/bookmakers", label: "Букмекеры" },
  { href: "/bonuses", label: "Бонусы" },
  { href: "/responsible-gambling", label: "Ответственная игра" },
] as const;
