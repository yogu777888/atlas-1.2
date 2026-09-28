import type { BestPrice, BookPrices, EventSummary, OddsEvent, OutcomeKey } from "./types";

export const outcomeLabel = (e: Pick<OddsEvent, "home" | "away">, o: OutcomeKey) =>
  o === "home" ? e.home : o === "away" ? e.away : "Draw";

export const shortLabel: Record<OutcomeKey, string> = { home: "1", draw: "X", away: "2" };

export function impliedProbability(decimal: number): number {
  return 1 / decimal;
}

/** Bookmaker overround: sum of implied probabilities minus 1. */
export function margin(prices: number[]): number {
  return prices.reduce((sum, p) => sum + 1 / p, 0) - 1;
}

export function bookMargin(book: BookPrices, outcomes: OutcomeKey[]): number | null {
  const prices = outcomes.map((o) => book.prices[o]);
  if (prices.some((p) => !p)) return null;
  return margin(prices as number[]);
}

export function bestPrices(event: OddsEvent): BestPrice[] {
  return event.outcomes.flatMap((outcome) => {
    let best: BestPrice | null = null;
    for (const book of event.books) {
      const price = book.prices[outcome];
      if (price && (!best || price > best.price)) best = { outcome, price, bookmaker: book.bookmaker };
    }
    return best ? [best] : [];
  });
}

/**
 * Fair (margin-free) probabilities: average each book's normalised implied
 * probabilities, so no single book skews the consensus.
 */
export function fairProbabilities(event: OddsEvent): Partial<Record<OutcomeKey, number>> {
  const totals: Partial<Record<OutcomeKey, number>> = {};
  let n = 0;
  for (const book of event.books) {
    const prices = event.outcomes.map((o) => book.prices[o]);
    if (prices.some((p) => !p)) continue;
    const overround = margin(prices as number[]) + 1;
    event.outcomes.forEach((o, i) => {
      totals[o] = (totals[o] ?? 0) + 1 / prices[i]! / overround;
    });
    n++;
  }
  if (n === 0) return {};
  return Object.fromEntries(event.outcomes.map((o) => [o, totals[o]! / n]));
}

/** Expected value of a 1-unit stake at `price` given a fair probability. */
export function edge(price: number, fairProb: number): number {
  return price * fairProb - 1;
}

/**
 * Stakes that return the same payout on every outcome (for sure bets or
 * hedging). Returns stakes that sum to `total`.
 */
export function splitStakes(prices: number[], total: number): number[] {
  const inv = prices.map((p) => 1 / p);
  const sum = inv.reduce((a, b) => a + b, 0);
  return inv.map((x) => (x / sum) * total);
}

export function summarize(event: OddsEvent): EventSummary {
  const best = bestPrices(event);
  return {
    ...event,
    best,
    bestMargin: best.length === event.outcomes.length ? margin(best.map((b) => b.price)) : Infinity,
    fair: fairProbabilities(event),
  };
}

export function formatOdds(decimal: number): string {
  return decimal.toFixed(2);
}

export function formatPct(x: number, digits = 1): string {
  return `${(x * 100).toFixed(digits)}%`;
}
