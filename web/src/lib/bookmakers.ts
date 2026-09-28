/**
 * Legal Russian sportsbooks (licensed by the Federal Tax Service).
 *
 * BEFORE LAUNCH:
 *  - check every operator against the current FNS licence register;
 *  - replace ratings, margins, pros/cons and bonus wording with verified facts
 *    (the values below are editorial placeholders);
 *  - never add offshore operators — one link to an unlicensed bookmaker is
 *    enough for Roskomnadzor to block the whole domain.
 *
 * Advertising (38-ФЗ, art. 18.1): every outbound partner link is an ad and must
 * carry an erid token and the advertiser's details. CTAs are only rendered for
 * bookmakers whose AFF_/ERID_/ADV_ variables are all set (see .env.example).
 */
export type BonusKind = "freebet" | "deposit" | "welcome";

/**
 * Welcome offer. The four key terms are shown as tiles on every card; leave a
 * term out until you have the current value from the partner programme — the
 * card then says "уточняется" instead of guessing.
 */
export type Bonus = {
  kind: BonusKind;
  headline: string;
  detail: string;
  /** e.g. "до 15 000 ₽" */
  amount?: string;
  /** e.g. "×1" or "без отыгрыша" */
  wager?: string;
  /** e.g. "от 1.80" */
  minOdds?: string;
  /** e.g. "14 дней" */
  expires?: string;
  /** Operator-specific fine print; the general 18+ line is shown once per page */
  terms?: string;
};

export type Bookmaker = {
  slug: string;
  name: string;
  /** Brand colour for the monogram tile */
  color: string;
  /** Text colour on top of `color` */
  ink: string;
  monogram: string;
  rating: number; // 0-5, editorial
  homepage: string;
  bonus: Bonus;
  payout: string;
  minDeposit: string;
  avgMargin: number; // typical match-winner margin, e.g. 0.05 = 5%
  features: string[];
  pros: string[];
  cons: string[];
  /** Query parameter the partner programme uses for sub-ids */
  subIdParam: string;
};

/** Shown once under bonus lists and on reviews when an offer has no terms of its own */
export const BONUS_TERMS = "18+. Для новых игроков. Размер бонуса, сроки и условия отыгрыша — на сайте букмекера.";

export const bookmakers: Bookmaker[] = [
  {
    slug: "fonbet",
    name: "Фонбет",
    color: "#e4002b",
    ink: "#ffffff",
    monogram: "Ф",
    rating: 4.7,
    homepage: "https://www.fon.bet",
    bonus: { kind: "freebet", headline: "Фрибет новым игрокам", detail: "Бесплатная ставка после регистрации и подтверждения личности." },
    payout: "до 1 дня",
    minDeposit: "100 ₽",
    avgMargin: 0.055,
    features: ["Экспрессы", "Кэшаут", "Трансляции"],
    pros: ["Одна из самых широких линий в России", "Быстрые выплаты", "Удобное приложение"],
    cons: ["Маржа выше, чем у лидеров по коэффициентам"],
    subIdParam: "subid",
  },
  {
    slug: "winline",
    name: "Winline",
    color: "#ff6600",
    ink: "#111111",
    monogram: "W",
    rating: 4.6,
    homepage: "https://winline.ru",
    bonus: { kind: "freebet", headline: "Фрибет за регистрацию", detail: "Бонус начисляется после первой ставки." },
    payout: "до 1 дня",
    minDeposit: "100 ₽",
    avgMargin: 0.05,
    features: ["Лайв", "Статистика", "Акции"],
    pros: ["Высокие коэффициенты на топ-матчи", "Много регулярных акций"],
    cons: ["Меньше экзотических рынков"],
    subIdParam: "subid",
  },
  {
    slug: "pari",
    name: "PARI",
    color: "#111111",
    ink: "#ffd400",
    monogram: "P",
    rating: 4.5,
    homepage: "https://www.pari.ru",
    bonus: { kind: "deposit", headline: "Бонус на первый депозит", detail: "Дополнительные средства для ставок после пополнения." },
    payout: "до 1 дня",
    minDeposit: "100 ₽",
    avgMargin: 0.05,
    features: ["Лайв", "Конструктор ставок", "Кэшаут"],
    pros: ["Сильная лайв-линия", "Понятный интерфейс"],
    cons: ["Отыгрыш бонусов с условиями"],
    subIdParam: "subid",
  },
  {
    slug: "betboom",
    name: "BetBoom",
    color: "#6b1ee6",
    ink: "#ffffff",
    monogram: "BB",
    rating: 4.4,
    homepage: "https://betboom.ru",
    bonus: { kind: "freebet", headline: "Фрибет для новых игроков", detail: "Бесплатная ставка после регистрации." },
    payout: "до 1 дня",
    minDeposit: "50 ₽",
    avgMargin: 0.055,
    features: ["Киберспорт", "Лайв", "Акции"],
    pros: ["Отличный выбор киберспорта", "Низкий минимальный депозит"],
    cons: ["Маржа на футбол выше средней"],
    subIdParam: "subid",
  },
  {
    slug: "ligastavok",
    name: "Лига Ставок",
    color: "#0f3b7a",
    ink: "#ffffff",
    monogram: "ЛС",
    rating: 4.3,
    homepage: "https://www.ligastavok.ru",
    bonus: { kind: "welcome", headline: "Приветственный бонус", detail: "Бонус для новых клиентов после регистрации." },
    payout: "1–2 дня",
    minDeposit: "50 ₽",
    avgMargin: 0.06,
    features: ["Экспрессы", "Статистика", "Лайв"],
    pros: ["Удобная статистика по матчам", "Много способов пополнения"],
    cons: ["Коэффициенты уступают лидерам"],
    subIdParam: "subid",
  },
  {
    slug: "marathon",
    name: "Марафон",
    color: "#1b3f8f",
    ink: "#ffffff",
    monogram: "М",
    rating: 4.4,
    homepage: "https://www.marathonbet.ru",
    bonus: { kind: "welcome", headline: "Бонус новым игрокам", detail: "Приветственное предложение после первой ставки." },
    payout: "до 1 дня",
    minDeposit: "100 ₽",
    avgMargin: 0.04,
    features: ["Низкая маржа", "Большие лимиты"],
    pros: ["Одни из лучших коэффициентов на топ-события", "Высокие лимиты"],
    cons: ["Интерфейс проще, чем у конкурентов"],
    subIdParam: "subid",
  },
  {
    slug: "olimpbet",
    name: "Олимпбет",
    color: "#ff7a00",
    ink: "#0b1d3a",
    monogram: "О",
    rating: 4.1,
    homepage: "https://www.olimp.bet",
    bonus: { kind: "freebet", headline: "Фрибет за регистрацию", detail: "Бесплатная ставка для новых клиентов." },
    payout: "1–2 дня",
    minDeposit: "50 ₽",
    avgMargin: 0.06,
    features: ["Лайв", "Акции"],
    pros: ["Регулярные акции"],
    cons: ["Маржа выше средней"],
    subIdParam: "subid",
  },
  {
    slug: "betcity",
    name: "Бетсити",
    color: "#0a6b3d",
    ink: "#ffffff",
    monogram: "БС",
    rating: 4.0,
    homepage: "https://betcity.ru",
    bonus: { kind: "welcome", headline: "Приветственный бонус", detail: "Бонус для новых игроков." },
    payout: "1–2 дня",
    minDeposit: "100 ₽",
    avgMargin: 0.055,
    features: ["Роспись на топ-матчи", "Лайв"],
    pros: ["Широкая роспись на популярные матчи"],
    cons: ["Сайт выглядит устаревшим"],
    subIdParam: "subid",
  },
];

export function getBookmaker(slug: string): Bookmaker | undefined {
  return bookmakers.find((b) => b.slug === slug);
}

export function bookmakersByRating(): Bookmaker[] {
  return [...bookmakers].sort((a, b) => b.rating - a.rating);
}

const envKey = (prefix: string, slug: string) => `${prefix}_${slug.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`;
export const envKeyFor = (slug: string) => envKey("AFF", slug);

export type AdInfo = { url: string; erid: string; advertiser: string };

/**
 * Partner link plus the mandatory ad marking. Returns null until all three
 * are configured, so the site never shows an unmarked ad.
 */
export function adInfo(b: Bookmaker): AdInfo | null {
  const url = process.env[envKey("AFF", b.slug)];
  const erid = process.env[envKey("ERID", b.slug)];
  const advertiser = process.env[envKey("ADV", b.slug)];
  return url && erid && advertiser ? { url, erid, advertiser } : null;
}

export function canAdvertise(b: Bookmaker): boolean {
  return adInfo(b) !== null;
}

/** Internal link that goes through the click tracker. Always use this for CTAs. */
export function goLink(slug: string, source: string): string {
  return `/go/${slug}?src=${encodeURIComponent(source)}`;
}

export const bonusTerms = (b: Bookmaker) => b.bonus.terms ?? BONUS_TERMS;

export const BONUS_KINDS: { key: BonusKind; label: string }[] = [
  { key: "freebet", label: "Фрибеты" },
  { key: "deposit", label: "За депозит" },
  { key: "welcome", label: "Приветственные" },
];
