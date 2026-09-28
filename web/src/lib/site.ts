export const site = {
  name: "tag.bet",
  tagline: "Every line. One tag.",
  description:
    "tag.bet compares live odds across the world's top sportsbooks, tags the best price on every outcome and surfaces the welcome offers worth taking.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://tag.bet").replace(/\/$/, ""),
  appStoreUrl: process.env.NEXT_PUBLIC_APP_STORE_URL || null,
  twitter: "@tagbet",
  supportEmail: "hello@tag.bet",
} as const;

export const nav = [
  { href: "/odds", label: "Odds" },
  { href: "/bookmakers", label: "Bookmakers" },
  { href: "/bonuses", label: "Bonuses" },
  { href: "/#app", label: "App" },
] as const;
