import type { SportKey } from "../sports";

export type OutcomeKey = "home" | "draw" | "away";

export type BookPrices = {
  bookmaker: string; // bookmaker slug
  prices: Partial<Record<OutcomeKey, number>>; // decimal odds
  updatedAt: string;
};

export type OddsEvent = {
  id: string;
  sport: SportKey;
  league: string;
  home: string;
  away: string;
  commenceTime: string; // ISO
  outcomes: OutcomeKey[];
  books: BookPrices[];
};

export type BestPrice = { outcome: OutcomeKey; price: number; bookmaker: string };

export type EventSummary = OddsEvent & {
  best: BestPrice[];
  /** Overround when backing the best price on every outcome. Negative = sure bet. */
  bestMargin: number;
  /** Margin-free probabilities from the market consensus */
  fair: Partial<Record<OutcomeKey, number>>;
};
