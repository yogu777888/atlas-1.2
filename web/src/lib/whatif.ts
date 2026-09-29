/**
 * "What if you had bet on your team": replays a finished season with the
 * closing 1X2 odds sstats stores for every game. Pure functions take plain
 * games so they can be tested; `getSeason` in season.ts does the fetching.
 */
import { winner } from "./matches";
import { resultOf, seasonLabel, seasonYear } from "./season";
import type { SsGame } from "./sstats/types";
import { teamRu } from "./teams";

export const STAKE = 100;

export type Played = {
  id: number;
  date: string;
  homeId: number;
  awayId: number;
  home: string;
  away: string;
  hg: number;
  ag: number;
  odds: { home: number; draw: number; away: number };
};

export type Bet = "win" | "lose" | "draw";
export type Step = { date: string; opponent: string; home: boolean; score: string; price: number; won: boolean; bank: number };
export type Ledger = { steps: Step[]; profit: number; staked: number; wins: number; roi: number; avgPrice: number };

/** Games that finished and have closing odds, oldest first. */
export function toPlayed(games: SsGame[]): Played[] {
  const out: Played[] = [];
  for (const g of games) {
    const r = resultOf(g);
    const odds = winner(g.odds);
    if (!r || !odds) continue;
    const hg = r.home, ag = r.away;
    out.push({
      id: g.id,
      date: g.dateUtc ? new Date(g.dateUtc * 1000).toISOString() : g.date ?? "",
      homeId: Number(g.homeTeam.id),
      awayId: Number(g.awayTeam.id),
      home: teamRu(g.homeTeam.name),
      away: teamRu(g.awayTeam.name),
      hg,
      ag,
      odds,
    });
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Stake STAKE on every game of `teamId`: on it to win, against it (its
 * opponent to win) or on the draw. Bank starts at zero.
 */
export function ledger(games: Played[], teamId: number, bet: Bet = "win"): Ledger {
  let bank = 0, wins = 0, priceSum = 0;
  const steps: Step[] = [];
  for (const g of games) {
    const home = g.homeId === teamId;
    if (!home && g.awayId !== teamId) continue;
    const gf = home ? g.hg : g.ag, ga = home ? g.ag : g.hg;
    const price = bet === "draw" ? g.odds.draw : (bet === "win") === home ? g.odds.home : g.odds.away;
    const won = bet === "draw" ? gf === ga : bet === "win" ? gf > ga : gf < ga;
    bank += won ? STAKE * (price - 1) : -STAKE;
    wins += won ? 1 : 0;
    priceSum += price;
    steps.push({ date: g.date, opponent: home ? g.away : g.home, home, score: `${gf}:${ga}`, price, won, bank: Math.round(bank) });
  }
  const staked = steps.length * STAKE;
  return { steps, profit: Math.round(bank), staked, wins, roi: staked ? bank / staked : 0, avgPrice: steps.length ? priceSum / steps.length : 0 };
}

export type TeamRow = { id: number; name: string; played: number; profit: number; roi: number };

/** Every team's result for backing it to win in every game, best first. */
export function leagueTable(games: Played[]): TeamRow[] {
  const names = new Map<number, string>();
  for (const g of games) {
    names.set(g.homeId, g.home);
    names.set(g.awayId, g.away);
  }
  return [...names]
    .map(([id, name]) => {
      const l = ledger(games, id);
      return { id, name, played: l.steps.length, profit: l.profit, roi: l.roi };
    })
    .filter((r) => r.played > 0)
    .sort((a, b) => b.profit - a.profit);
}

/** Seasons offered on the page: the current one and the one before. */
export function seasons(now = Date.now()) {
  const y = seasonYear(now);
  return [y, y - 1].map((year) => ({ year, label: seasonLabel(year) }));
}
