/**
 * "What if you had bet on your team": replays a finished season with the
 * closing 1X2 odds sstats stores for every game. Pure functions take plain
 * games so they can be tested; `seasonGames` does the (cached) fetching.
 */
import { winner } from "./data";
import { sstats } from "./sstats/client";
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
    const hg = Number(g.homeResult), ag = Number(g.awayResult);
    const odds = winner(g.odds);
    if (g.homeResult == null || g.awayResult == null || Number.isNaN(hg) || Number.isNaN(ag) || !odds) continue;
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

/** Seasons offered on the page; sstats keys a season by the year it starts. */
export const SEASONS = [
  { year: 2025, label: "2025/26" },
  { year: 2026, label: "2026/27" },
] as const;

export async function seasonGames(leagueId: number, year: number): Promise<Played[]> {
  const games = await sstats<SsGame[]>("/Games/list", { LeagueId: leagueId, Year: year, Ended: true, Limit: 1000 }, 43_200);
  return toPlayed(games);
}

/** A made-up but plausible season for demo mode (no API access). */
export function demoSeason(): Played[] {
  const teams = ["Зенит", "Краснодар", "Спартак", "Локомотив", "ЦСКА", "Динамо", "Ростов", "Рубин"];
  const strength = [0.8, 0.7, 0.62, 0.6, 0.58, 0.5, 0.42, 0.38];
  const out: Played[] = [];
  let id = 1, seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let round = 0; round < 2; round++)
    for (let h = 0; h < teams.length; h++)
      for (let a = 0; a < teams.length; a++) {
        if (h === a) continue;
        const ph = Math.min(0.75, Math.max(0.15, 0.45 + (strength[h] - strength[a]) * 0.8)), pd = 0.26, pa = 1 - ph - pd;
        const r = rnd(), m = 1.06;
        const res = r < ph ? [2, 1] : r < ph + pd ? [1, 1] : [0, 1];
        out.push({ id: id++, date: new Date(Date.UTC(2025, 7, 1 + id)).toISOString(), homeId: h + 1, awayId: a + 1, home: teams[h], away: teams[a], hg: res[0], ag: res[1],
          odds: { home: +(1 / (ph * m)).toFixed(2), draw: +(1 / (pd * m)).toFixed(2), away: +(1 / (pa * m)).toFixed(2) } });
      }
  return out;
}
