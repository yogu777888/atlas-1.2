import { describe, expect, it } from "vitest";
import { bestPrices, edge, fairProbabilities, margin, splitStakes, summarize } from "./math";
import type { OddsEvent } from "./types";

const event: OddsEvent = {
  id: "e1",
  sport: "soccer",
  league: "Test League",
  home: "Home FC",
  away: "Away FC",
  commenceTime: "2030-01-01T00:00:00Z",
  outcomes: ["home", "draw", "away"],
  books: [
    { bookmaker: "a", prices: { home: 2.0, draw: 3.4, away: 3.8 }, updatedAt: "" },
    { bookmaker: "b", prices: { home: 2.1, draw: 3.3, away: 3.6 }, updatedAt: "" },
    { bookmaker: "c", prices: { home: 1.95, draw: 3.6, away: 4.0 }, updatedAt: "" },
  ],
};

describe("odds math", () => {
  it("computes overround", () => {
    expect(margin([2, 2])).toBeCloseTo(0);
    expect(margin([1.9, 1.9])).toBeCloseTo(0.0526, 3);
  });

  it("tags the best price per outcome", () => {
    expect(bestPrices(event)).toEqual([
      { outcome: "home", price: 2.1, bookmaker: "b" },
      { outcome: "draw", price: 3.6, bookmaker: "c" },
      { outcome: "away", price: 4.0, bookmaker: "c" },
    ]);
  });

  it("detects a sure bet when best prices sum below 100%", () => {
    const s = summarize(event);
    // 1/2.1 + 1/3.6 + 1/4.0 = 1.0040 -> not a sure bet
    expect(s.bestMargin).toBeCloseTo(0.004, 3);
    const arb = summarize({
      ...event,
      books: [...event.books, { bookmaker: "d", prices: { home: 2.3, draw: 3.0, away: 3.0 }, updatedAt: "" }],
    });
    expect(arb.bestMargin).toBeLessThan(0);
  });

  it("fair probabilities sum to 1", () => {
    const fair = fairProbabilities(event);
    const sum = Object.values(fair).reduce((a, b) => a + b!, 0);
    expect(sum).toBeCloseTo(1, 10);
  });

  it("edge is positive only above fair price", () => {
    expect(edge(2.2, 0.5)).toBeCloseTo(0.1);
    expect(edge(1.8, 0.5)).toBeCloseTo(-0.1);
  });

  it("splits stakes for an equal payout", () => {
    const prices = [2.3, 3.6, 4.0];
    const stakes = splitStakes(prices, 100);
    expect(stakes.reduce((a, b) => a + b, 0)).toBeCloseTo(100);
    const payouts = stakes.map((s, i) => s * prices[i]);
    expect(payouts[0]).toBeCloseTo(payouts[1]);
    expect(payouts[1]).toBeCloseTo(payouts[2]);
  });
});
