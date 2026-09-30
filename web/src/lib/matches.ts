import type { League } from "./leagues";
import { teamSlug } from "./teams";

export type Outcome = "home" | "draw" | "away";
export const OUTCOMES: Outcome[] = ["home", "draw", "away"];
export type Odds1x2 = Record<Outcome, number>;
export type Probs1x2 = Record<Outcome, number>;

/** scheduled → live → finished; "off" is postponed, cancelled or abandoned */
export type MatchStatus = "scheduled" | "live" | "finished" | "off";

export type Match = {
  /** "ss-<sstats id>" for live data, "demo-<n>" for demo data */
  id: string;
  /** URL segment of the forecast page: "zenit-spartak-1632014" (demo: "zenit-spartak-d5") */
  slug: string;
  sstatsId: number | null;
  /** sstats team ids, for form and head-to-head (live data only) */
  homeId?: number;
  awayId?: number;
  league: League;
  home: string;
  away: string;
  commenceTime: string; // ISO
  status: MatchStatus;
  /** Final (or current) score once the match has started */
  score: { home: number; away: number } | null;
  /** World market consensus (average of international books), margin included */
  market: Odds1x2 | null;
  /** Margin-free probabilities from the world market */
  fair: Probs1x2 | null;
  /** Live PARI prices (legal Russian bookmaker) */
  pari: { odds: Odds1x2; url: string | null; updatedAt: string | null; eventId?: number; open?: Odds1x2 | null } | null;
};

/** "zenit-spartak-1632014": teams for people, the id at the end for us. */
export const matchSlug = (home: string, away: string, ref: string | number) => `${teamSlug(home)}-${teamSlug(away)}-${ref}`;

/** The id at the end of a forecast URL: a live sstats id, or a demo match number ("d5"). */
export function parseMatchRef(slug: string): { live: number } | { demo: number } | null {
  const m = slug.match(/-(d?)(\d+)$/) ?? slug.match(/^(d?)(\d+)$/);
  if (!m) return null;
  return m[1] ? { demo: Number(m[2]) } : { live: Number(m[2]) };
}

/** sstats status codes (see /Games/{id} in the API docs). */
export function statusFromCode(code: number | string | null | undefined, startMs: number, now = Date.now()): MatchStatus {
  const c = code === null || code === undefined || code === "" ? null : Number(code);
  if (c !== null && [8, 9, 10, 17, 18].includes(c)) return "finished";
  if (c !== null && [3, 4, 5, 6, 7, 11, 19].includes(c)) return "live";
  if (c !== null && [12, 13, 14, 15].includes(c)) return "off";
  return startMs > now ? "scheduled" : "live";
}

export const winnerOf = (s: { home: number; away: number }): Outcome => (s.home > s.away ? "home" : s.home < s.away ? "away" : "draw");

/** A result the market gave less than this is called an upset (a typical draw sits at 22–30%, so it rarely qualifies). */
export const UPSET = 0.18;

export const outcomeShort: Record<Outcome, string> = { home: "П1", draw: "X", away: "П2" };
export const outcomeLabel = (m: Pick<Match, "home" | "away">, o: Outcome) => (o === "home" ? m.home : o === "away" ? m.away : "Ничья");

/** Match-result prices from an sstats odds list (market 1: Home / Draw / Away). */
export const winner = (bets: { marketId: number; odds: { name: string; value: number }[] }[] | null | undefined): Odds1x2 | null => {
  const m = bets?.find((b) => b.marketId === 1);
  if (!m) return null;
  const get = (n: string) => m.odds.find((o) => o.name === n)?.value;
  const h = get("Home"), d = get("Draw"), a = get("Away");
  return h && d && a && h > 1 && d > 1 && a > 1 ? { home: h, draw: d, away: a } : null;
};

/** Remove the bookmaker margin proportionally: 1/odds normalised to sum to 1. */
export function fairFromOdds(o: Odds1x2): Probs1x2 {
  const inv = OUTCOMES.map((k) => 1 / o[k]);
  const sum = inv.reduce((a, b) => a + b, 0);
  return { home: inv[0] / sum, draw: inv[1] / sum, away: inv[2] / sum };
}

/** Average of several books' fair probabilities — the market consensus. */
export function consensus(books: Odds1x2[]): Probs1x2 | null {
  if (!books.length) return null;
  const acc = { home: 0, draw: 0, away: 0 };
  for (const b of books) {
    const f = fairFromOdds(b);
    for (const k of OUTCOMES) acc[k] += f[k] / books.length;
  }
  return acc;
}

export function margin(o: Odds1x2): number {
  return OUTCOMES.reduce((s, k) => s + 1 / o[k], 0) - 1;
}

/** Expected return of a 1-unit bet at `price` if `prob` is the true chance. */
export function edge(price: number, prob: number): number {
  return price * prob - 1;
}

/**
 * Real edges against a sharp market are small. Anything above this is far more
 * likely a stale line or a mismatched game than a gift, so it is not flagged.
 */
export const MAX_CREDIBLE_EDGE = 0.12;

/** Worth flagging: priced above fair, but not so far above that the data is suspect. */
export function isValue(price: number, prob: number): boolean {
  const e = edge(price, prob);
  return e > 0 && e <= MAX_CREDIBLE_EDGE;
}

export const isSuspect = (price: number, prob: number) => edge(price, prob) > MAX_CREDIBLE_EDGE;

export const pct = (x: number, digits = 0) => `${(x * 100).toFixed(digits).replace(".", ",")}%`;

/** Colour step of a chance on the probability scale (1 = unlikely … 5 = strong favourite). */
export const probLevel = (p: number) => (p >= 0.65 ? 5 : p >= 0.5 ? 4 : p >= 0.35 ? 3 : p >= 0.2 ? 2 : 1);

/** Background and text for each step; the two darkest carry white text. */
export const PROB_CLASS = ["", "bg-p1 text-fg", "bg-p2 text-fg", "bg-p3 text-fg", "bg-p4 text-on-strong", "bg-p5 text-on-strong"] as const;
export const probClass = (p: number) => PROB_CLASS[probLevel(p)];
export const odds = (x: number) => x.toFixed(2);

/** Short plain-language verdict for the match header. */
export function verdict(m: Match): string | null {
  if (!m.fair) return null;
  const { home, draw, away } = m.fair;
  const max = Math.max(home, draw, away);
  if (max < 0.4) return "Равный матч: у рынка нет явного фаворита.";
  const fav = home === max ? m.home : away === max ? m.away : null;
  if (!fav) return `Рынок ждёт ничью (${pct(draw)}).`;
  return `Фаворит — ${fav}: шанс победы ${pct(max)}.`;
}

/** True when PARI prices at least one outcome above its fair chance. */
export function hasValue(m: Match): boolean {
  const { pari, fair } = m;
  return !!pari && !!fair && OUTCOMES.some((o) => isValue(pari.odds[o], fair[o]));
}

/** Russian plural: plural(5, ["матч", "матча", "матчей"]) → "матчей". */
export function plural(n: number, [one, few, many]: [string, string, string]): string {
  const d = n % 10, dd = n % 100;
  if (d === 1 && dd !== 11) return one;
  if (d >= 2 && d <= 4 && (dd < 12 || dd > 14)) return few;
  return many;
}

/** A price that moved at least this much since the line opened gets an arrow. */
export const MOVE = 0.03;

/** +1 when the price went up since opening (better for the bettor), −1 when it went down, 0 otherwise. */
export function moved(now: number, open: number | undefined | null): -1 | 0 | 1 {
  if (!open) return 0;
  const r = now / open - 1;
  return r >= MOVE ? 1 : r <= -MOVE ? -1 : 0;
}
