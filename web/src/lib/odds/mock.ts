import { bookmakers } from "../bookmakers";
import type { SportKey } from "../sports";
import type { BookPrices, OddsEvent, OutcomeKey } from "./types";

/**
 * Deterministic demo odds so the product looks alive without an API key.
 * Prices shift every few hours and kick-off times roll forward with the clock.
 */
type Fixture = {
  sport: SportKey;
  league: string;
  home: string;
  away: string;
  /** Hours from the current anchor until kick-off */
  inHours: number;
  /** True probabilities for home / draw / away (draw omitted for 2-way sports) */
  p: [number, number, number?];
};

const fixtures: Fixture[] = [
  { sport: "soccer", league: "Premier League", home: "Arsenal", away: "Chelsea", inHours: 3, p: [0.52, 0.25, 0.23] },
  { sport: "soccer", league: "Premier League", home: "Liverpool", away: "Manchester City", inHours: 5, p: [0.4, 0.26, 0.34] },
  { sport: "soccer", league: "Premier League", home: "Tottenham", away: "Newcastle", inHours: 26, p: [0.43, 0.26, 0.31] },
  { sport: "soccer", league: "Champions League", home: "Real Madrid", away: "Bayern Munich", inHours: 29, p: [0.45, 0.25, 0.3] },
  { sport: "soccer", league: "Champions League", home: "Inter", away: "PSG", inHours: 30, p: [0.36, 0.29, 0.35] },
  { sport: "soccer", league: "La Liga", home: "Barcelona", away: "Atlético Madrid", inHours: 50, p: [0.55, 0.24, 0.21] },
  { sport: "basketball", league: "NBA", home: "Boston Celtics", away: "Denver Nuggets", inHours: 8, p: [0.61, 0.39] },
  { sport: "basketball", league: "NBA", home: "Los Angeles Lakers", away: "Golden State Warriors", inHours: 10, p: [0.48, 0.52] },
  { sport: "basketball", league: "NBA", home: "New York Knicks", away: "Milwaukee Bucks", inHours: 32, p: [0.55, 0.45] },
  { sport: "basketball", league: "EuroLeague", home: "Real Madrid", away: "Olympiacos", inHours: 28, p: [0.63, 0.37] },
  { sport: "tennis", league: "ATP Tour", home: "Carlos Alcaraz", away: "Jannik Sinner", inHours: 6, p: [0.49, 0.51] },
  { sport: "tennis", league: "ATP Tour", home: "Novak Djokovic", away: "Alexander Zverev", inHours: 7, p: [0.58, 0.42] },
  { sport: "tennis", league: "WTA Tour", home: "Aryna Sabalenka", away: "Iga Świątek", inHours: 9, p: [0.5, 0.5] },
  { sport: "mma", league: "UFC", home: "Islam Makhachev", away: "Arman Tsarukyan", inHours: 54, p: [0.68, 0.32] },
  { sport: "mma", league: "UFC", home: "Alex Pereira", away: "Magomed Ankalaev", inHours: 55, p: [0.47, 0.53] },
  { sport: "football", league: "NFL", home: "Kansas City Chiefs", away: "Buffalo Bills", inHours: 44, p: [0.54, 0.46] },
  { sport: "football", league: "NFL", home: "Philadelphia Eagles", away: "Dallas Cowboys", inHours: 47, p: [0.62, 0.38] },
  { sport: "football", league: "NFL", home: "Detroit Lions", away: "San Francisco 49ers", inHours: 48, p: [0.51, 0.49] },
];

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// mulberry32 seeded with a string hash
function rng(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round2 = (x: number) => Math.max(1.01, Math.round(x * 100) / 100);

export function mockEvents(now = new Date()): OddsEvent[] {
  // Anchor to the start of the current 6-hour block so times are stable between requests
  const block = 6 * 3600_000;
  const anchor = Math.floor(now.getTime() / block) * block;
  const priceEpoch = Math.floor(now.getTime() / (3 * 3600_000));

  return fixtures.map((f, index) => {
    const id = `${f.sport}-${slugify(f.home)}-vs-${slugify(f.away)}`;
    const outcomes: OutcomeKey[] = f.p.length === 3 && f.p[2] !== undefined ? ["home", "draw", "away"] : ["home", "away"];
    const probs = outcomes.length === 3 ? [f.p[0], f.p[1], f.p[2]!] : [f.p[0], f.p[1]];
    const updatedAt = new Date(now.getTime() - 60_000 * (1 + (index % 4))).toISOString();

    const books: BookPrices[] = bookmakers
      .filter((_, i) => (i + index) % 7 !== 3) // not every book prices every event
      .map((b) => {
        const r = rng(`${id}:${b.slug}:${priceEpoch}`);
        const m = b.avgMargin * (0.8 + r() * 0.4);
        const prices: BookPrices["prices"] = {};
        outcomes.forEach((o, i) => {
          const noise = 1 + (r() - 0.5) * 0.06;
          prices[o] = round2((1 / (probs[i] * (1 + m))) * noise);
        });
        return { bookmaker: b.slug, prices, updatedAt };
      });

    return {
      id,
      sport: f.sport,
      league: f.league,
      home: f.home,
      away: f.away,
      commenceTime: new Date(anchor + f.inHours * 3600_000).toISOString(),
      outcomes,
      books,
    };
  });
}
