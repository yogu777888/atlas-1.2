/**
 * Sportsbook catalogue.
 *
 * IMPORTANT: welcome offers, promo codes and country availability below are
 * placeholders modelled on typical offers. Before going live, replace every
 * `bonus` / `terms` / `blockedCountries` value with the exact wording your
 * affiliate manager approves: advertising an offer that doesn't exist breaks
 * both partner T&Cs and advertising law (UK CAP code, FTC, etc.).
 */
export type Bookmaker = {
  slug: string;
  name: string;
  /** Brand colour used for the monogram tile */
  color: string;
  /** Text colour on top of `color` */
  ink: string;
  monogram: string;
  rating: number; // 0-5
  founded: number;
  license: string;
  homepage: string;
  bonus: { headline: string; detail: string; code?: string; terms: string };
  payout: string;
  minDeposit: string;
  avgMargin: number; // typical match-winner margin, e.g. 0.045 = 4.5%
  features: string[];
  pros: string[];
  cons: string[];
  /** ISO-3166 alpha-2 codes where the operator does not accept customers */
  blockedCountries: string[];
  /** Query parameter the affiliate network uses for sub-ids */
  subIdParam: string;
  /** Bookmaker key in the-odds-api.com, when it is covered there */
  oddsApiKey?: string;
};

const STANDARD_BLOCKS = ["US", "FR", "AU", "SG", "IL", "TR"];

export const bookmakers: Bookmaker[] = [
  {
    slug: "pinnacle",
    name: "Pinnacle",
    color: "#f15a22",
    ink: "#ffffff",
    monogram: "P",
    rating: 4.8,
    founded: 1998,
    license: "Curaçao / MGA",
    homepage: "https://www.pinnacle.com",
    bonus: { headline: "Best odds, no bonus", detail: "Pinnacle skips bonuses and gives you lower margins instead.", terms: "18+. No welcome offer." },
    payout: "< 24h",
    minDeposit: "$10",
    avgMargin: 0.025,
    features: ["Lowest margins", "Winners welcome", "High limits"],
    pros: ["Sharpest prices in the market", "Doesn't limit winning players", "Huge limits on major markets"],
    cons: ["No welcome bonus", "Minimal-looking app"],
    blockedCountries: [...STANDARD_BLOCKS, "GB"],
    subIdParam: "subid",
    oddsApiKey: "pinnacle",
  },
  {
    slug: "bet365",
    name: "bet365",
    color: "#027b5b",
    ink: "#ffde00",
    monogram: "365",
    rating: 4.7,
    founded: 2000,
    license: "UKGC / MGA",
    homepage: "https://www.bet365.com",
    bonus: { headline: "Bet $10, get $30 in bet credits", detail: "New customers get bet credits after qualifying bets settle.", code: "TAGBET", terms: "18+. Min deposit applies. Bet credits are not withdrawable. T&Cs apply." },
    payout: "1-2 days",
    minDeposit: "$10",
    avgMargin: 0.055,
    features: ["Live streaming", "Early payout", "Bet builder"],
    pros: ["Deepest in-play markets", "Live streaming on thousands of events", "Fast, polished app"],
    cons: ["Margins above average", "Limits winning accounts"],
    blockedCountries: STANDARD_BLOCKS,
    subIdParam: "affid",
  },
  {
    slug: "betfair",
    name: "Betfair Exchange",
    color: "#ffb80c",
    ink: "#1e1e1e",
    monogram: "BF",
    rating: 4.6,
    founded: 1999,
    license: "UKGC / MGA",
    homepage: "https://www.betfair.com",
    bonus: { headline: "Up to $100 back as a free bet", detail: "Get your first exchange bet refunded as a free bet if it loses.", terms: "18+. Commission applies. T&Cs apply." },
    payout: "< 24h",
    minDeposit: "$5",
    avgMargin: 0.02,
    features: ["Betting exchange", "Lay betting", "Cash out"],
    pros: ["Exchange prices beat most bookmakers", "Back and lay any outcome", "Doesn't limit winners"],
    cons: ["Commission on net winnings", "Liquidity thin on small leagues"],
    blockedCountries: STANDARD_BLOCKS,
    subIdParam: "pid",
    oddsApiKey: "betfair_ex_uk",
  },
  {
    slug: "william-hill",
    name: "William Hill",
    color: "#00143c",
    ink: "#ffffff",
    monogram: "WH",
    rating: 4.3,
    founded: 1934,
    license: "UKGC / Gibraltar",
    homepage: "https://www.williamhill.com",
    bonus: { headline: "Bet $10, get $40 in free bets", detail: "Four $10 free bets after your first qualifying bet.", terms: "18+. New customers only. T&Cs apply." },
    payout: "1-3 days",
    minDeposit: "$5",
    avgMargin: 0.06,
    features: ["Price boosts", "Acca insurance", "Racing"],
    pros: ["Daily price boosts", "Trusted brand for nearly a century"],
    cons: ["Higher margins on football", "App feels dated"],
    blockedCountries: STANDARD_BLOCKS,
    subIdParam: "btag",
    oddsApiKey: "williamhill",
  },
  {
    slug: "unibet",
    name: "Unibet",
    color: "#147b45",
    ink: "#ffffff",
    monogram: "U",
    rating: 4.4,
    founded: 1997,
    license: "MGA / UKGC",
    homepage: "https://www.unibet.com",
    bonus: { headline: "Money back up to $40", detail: "Get your first bet back as a bonus if it loses.", terms: "18+. Wagering requirements apply. T&Cs apply." },
    payout: "< 24h",
    minDeposit: "$10",
    avgMargin: 0.05,
    features: ["Live streaming", "Bet builder", "Casino + poker"],
    pros: ["Fast withdrawals", "Strong live streaming"],
    cons: ["Bonus carries wagering requirements"],
    blockedCountries: STANDARD_BLOCKS,
    subIdParam: "btag",
    oddsApiKey: "unibet_eu",
  },
  {
    slug: "betway",
    name: "Betway",
    color: "#111111",
    ink: "#ffffff",
    monogram: "BW",
    rating: 4.2,
    founded: 2006,
    license: "MGA / UKGC",
    homepage: "https://www.betway.com",
    bonus: { headline: "100% first deposit match up to $30", detail: "Your first deposit is matched in free bets.", terms: "18+. Min odds and wagering apply. T&Cs apply." },
    payout: "1-2 days",
    minDeposit: "$10",
    avgMargin: 0.055,
    features: ["Esports", "Cash out", "Boosts"],
    pros: ["Excellent esports coverage", "Clean, fast app"],
    cons: ["Average football margins"],
    blockedCountries: STANDARD_BLOCKS,
    subIdParam: "btag",
    oddsApiKey: "betway",
  },
  {
    slug: "888sport",
    name: "888sport",
    color: "#ff6b00",
    ink: "#ffffff",
    monogram: "888",
    rating: 4.1,
    founded: 2008,
    license: "UKGC / Gibraltar",
    homepage: "https://www.888sport.com",
    bonus: { headline: "Bet $10, get $30 in free bets", detail: "Three $10 free bets once your first bet settles.", terms: "18+. Min odds apply. T&Cs apply." },
    payout: "2-3 days",
    minDeposit: "$10",
    avgMargin: 0.06,
    features: ["Odds boosts", "Bet builder"],
    pros: ["Generous boosts on big games"],
    cons: ["Slower withdrawals", "Higher margins"],
    blockedCountries: STANDARD_BLOCKS,
    subIdParam: "sr",
    oddsApiKey: "sport888",
  },
  {
    slug: "stake",
    name: "Stake",
    color: "#1a2c38",
    ink: "#ffffff",
    monogram: "S",
    rating: 4.3,
    founded: 2017,
    license: "Curaçao",
    homepage: "https://stake.com",
    bonus: { headline: "Weekly and monthly reloads", detail: "VIP-style reloads and rakeback instead of a one-off welcome bonus.", terms: "18+. Crypto only in most regions. T&Cs apply." },
    payout: "Instant (crypto)",
    minDeposit: "Any",
    avgMargin: 0.045,
    features: ["Crypto payments", "Instant withdrawals", "Esports"],
    pros: ["Instant crypto withdrawals", "Competitive margins"],
    cons: ["Crypto-first", "Not licensed in many regulated markets"],
    blockedCountries: [...STANDARD_BLOCKS, "GB", "NL", "ES", "IT", "DE"],
    subIdParam: "c",
  },
  {
    slug: "1xbet",
    name: "1xBet",
    color: "#1a5685",
    ink: "#ffffff",
    monogram: "1X",
    rating: 3.9,
    founded: 2007,
    license: "Curaçao",
    homepage: "https://1xbet.com",
    bonus: { headline: "100% first deposit bonus up to $130", detail: "Deposit bonus with wagering on accumulators.", terms: "18+. Wagering 5x on accas. T&Cs apply." },
    payout: "1-3 days",
    minDeposit: "$1",
    avgMargin: 0.05,
    features: ["Huge market range", "Many payment methods"],
    pros: ["Covers almost every sport and league", "Very low minimum deposit"],
    cons: ["Strict bonus wagering", "Not licensed in many regulated markets"],
    blockedCountries: [...STANDARD_BLOCKS, "GB", "NL", "ES", "IT", "DE"],
    subIdParam: "tag",
    oddsApiKey: "onexbet",
  },
];

export function getBookmaker(slug: string): Bookmaker | undefined {
  return bookmakers.find((b) => b.slug === slug);
}

export function bookmakersByRating(): Bookmaker[] {
  return [...bookmakers].sort((a, b) => b.rating - a.rating);
}

export function envKeyFor(slug: string): string {
  return `AFF_${slug.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`;
}

/** Affiliate tracking URL from env, falling back to the operator's homepage. */
export function affiliateUrl(b: Bookmaker): string {
  return process.env[envKeyFor(b.slug)] || b.homepage;
}

export function isAvailableIn(b: Bookmaker, country: string | null | undefined): boolean {
  if (!country) return true;
  return !b.blockedCountries.includes(country.toUpperCase());
}

/** Internal link that goes through the click tracker. Always use this for CTAs. */
export function goLink(slug: string, source: string): string {
  return `/go/${slug}?src=${encodeURIComponent(source)}`;
}
