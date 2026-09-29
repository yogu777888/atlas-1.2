/**
 * Season-wide facts for the home page and the league pages: what backing a
 * club all season would have done, and how honest the market's chances were.
 */
import { CLUB_LEAGUES, type ClubLeague } from "./leagues";
import { calibration, getSeason, seasonLabel, seasonYear, type CalibrationBin } from "./season";
import { POPULAR } from "./teams";
import { leagueTable, ledger, toPlayed, type Ledger } from "./whatif";

export type WhatIfFact = { team: { id: number; name: string }; league: ClubLeague; season: string; year: number; ledger: Ledger; demo: boolean };

/**
 * The most striking popular club of a league: 100 ₽ on it to win every game
 * this season (last season while the new one is only a few rounds old).
 */
export async function whatIfFact(league: ClubLeague = "rpl"): Promise<WhatIfFact | null> {
  let year = seasonYear();
  let season = await getSeason(league, year);
  let played = toPlayed(season.games);
  if (played.length < 40) {
    year -= 1;
    season = await getSeason(league, year);
    played = toPlayed(season.games);
  }
  const table = leagueTable(played).filter((r) => r.played >= 5);
  const pick = table.filter((r) => POPULAR.includes(r.name)).sort((a, b) => Math.abs(b.profit) - Math.abs(a.profit))[0] ?? table.at(-1);
  if (!pick) return null;
  return { team: { id: pick.id, name: pick.name }, league, season: seasonLabel(year), year, ledger: ledger(played, pick.id), demo: season.demo };
}

export type MarketCheck = { bins: CalibrationBin[]; games: number; season: string; demo: boolean; near60: CalibrationBin | null };

/** Last season in the six club leagues: the chances the closing odds gave against what happened. */
export async function marketCheck(): Promise<MarketCheck | null> {
  const year = seasonYear() - 1;
  const seasons = await Promise.all(CLUB_LEAGUES.map((l) => getSeason(l, year)));
  const games = seasons.flatMap((s) => s.games);
  const bins = calibration(games).filter((b) => b.n >= 30);
  const n = toPlayed(games).length;
  if (n < 200 || bins.length < 4) return null;
  return { bins, games: n, season: seasonLabel(year), demo: seasons.some((s) => s.demo), near60: bins.find((b) => b.from >= 0.55 && b.from < 0.65) ?? null };
}
