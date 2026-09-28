import type { League } from "./leagues";

export type Outcome = "home" | "draw" | "away";
export const OUTCOMES: Outcome[] = ["home", "draw", "away"];
export type Odds1x2 = Record<Outcome, number>;
export type Probs1x2 = Record<Outcome, number>;

export type Match = {
  /** URL id: "ss-<sstats id>" for live data, a slug for demo data */
  id: string;
  sstatsId: number | null;
  league: League;
  home: string;
  away: string;
  commenceTime: string; // ISO
  /** World market consensus (average of international books), margin included */
  market: Odds1x2 | null;
  /** Margin-free probabilities from the world market */
  fair: Probs1x2 | null;
  /** Live PARI prices (legal Russian bookmaker) */
  pari: { odds: Odds1x2; url: string | null; updatedAt: string | null } | null;
};

export const outcomeShort: Record<Outcome, string> = { home: "П1", draw: "X", away: "П2" };
export const outcomeLabel = (m: Pick<Match, "home" | "away">, o: Outcome) => (o === "home" ? m.home : o === "away" ? m.away : "Ничья");

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

export const pct = (x: number, digits = 0) => `${(x * 100).toFixed(digits)}%`;
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
