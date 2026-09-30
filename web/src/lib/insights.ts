/**
 * Season-wide facts for the home page and the league pages: what backing a
 * club all season would have done, and how honest the market's chances were.
 */
import { CLUB_LEAGUES, type ClubLeague } from "./leagues";
import { fairFromOdds, hasValue, MOVE, OUTCOMES, winner, winnerOf, type Match, type Outcome } from "./matches";
import { calibration, getSeason, resultOf, seasonLabel, seasonYear, type CalibrationBin } from "./season";
import { POPULAR, teamRu } from "./teams";
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

// ------------------------------------------------------------------ the week in numbers

export type Highlight = { kind: "favourite" | "even" | "move" | "value"; text: string; match: Match };

const pctRu = (x: number) => `${Math.round(x * 100)}%`;
const side = (m: Match, o: Outcome) => (o === "draw" ? "ничью" : o === "home" ? m.home : m.away);

/** Three or four facts about the coming week, each pointing at a match. Built only from the numbers. */
export function weekHighlights(matches: Match[]): Highlight[] {
  const priced = matches.filter((m) => m.fair && m.league.key !== "other");
  const out: Highlight[] = [];
  const top = (m: Match) => Math.max(m.fair!.home, m.fair!.away);

  const fav = [...priced].sort((a, b) => top(b) - top(a))[0];
  if (fav) {
    const o = fav.fair!.home >= fav.fair!.away ? "home" : "away";
    out.push({ kind: "favourite", match: fav, text: `Самый явный фаворит недели — ${side(fav, o)}: ${pctRu(fav.fair![o])} на победу в матче ${fav.home} — ${fav.away}.` });
  }
  const even = [...priced].sort((a, b) => Math.max(a.fair!.home, a.fair!.draw, a.fair!.away) - Math.max(b.fair!.home, b.fair!.draw, b.fair!.away))[0];
  if (even && even !== fav) {
    const f = even.fair!;
    out.push({ kind: "even", match: even, text: `Самый равный матч — ${even.home} — ${even.away}: ${pctRu(f.home)} · ${pctRu(f.draw)} · ${pctRu(f.away)}.` });
  }
  let best: { m: Match; o: Outcome; r: number } | null = null;
  for (const m of priced)
    for (const o of OUTCOMES) {
      const now = m.pari?.odds[o], open = m.pari?.open?.[o];
      if (!now || !open) continue;
      const r = now / open - 1;
      if (!best || Math.abs(r) > Math.abs(best.r)) best = { m, o, r };
    }
  if (best && Math.abs(best.r) >= MOVE) {
    const { m, o, r } = best;
    out.push({
      kind: "move",
      match: m,
      text: `Сильнее всего сдвинулась линия на ${m.home} — ${m.away}: коэффициент на ${o === "draw" ? "ничью" : o === "home" ? "победу хозяев" : "победу гостей"} ${r < 0 ? "упал" : "вырос"} с ${m.pari!.open![o].toFixed(2)} до ${m.pari!.odds[o].toFixed(2)}${r < 0 ? ", на этот исход активно ставят" : ""}.`,
    });
  }
  const value = priced.filter(hasValue);
  if (value.length) out.push({ kind: "value", match: value[0], text: `Коэффициентов выше честной цены на неделе: ${value.length}. Ближайший — в матче ${value[0].home} — ${value[0].away}.` });
  return out;
}

export type WeekRecap = { days: number; games: number; favWon: number; favExpected: number; upset: { home: string; away: string; score: string; chance: number; id: number } | null; demo: boolean };

/** How last week went in the six club leagues: how often favourites won against what the market expected, and the biggest upset. */
export async function weekRecap(now = Date.now()): Promise<WeekRecap | null> {
  const seasons = await Promise.all(CLUB_LEAGUES.map((l) => getSeason(l).catch(() => null)));
  const all = seasons.flatMap((s) => s?.games ?? []);
  for (const days of [7, 14, 21]) {
    const from = now - days * 86_400_000;
    const games = all.filter((g) => (g.dateUtc ?? 0) * 1000 >= from && (g.dateUtc ?? 0) * 1000 < now && resultOf(g) && winner(g.odds));
    if (games.length < 8) continue;
    let won = 0, expected = 0;
    let upset: WeekRecap["upset"] = null;
    for (const g of games) {
      const f = fairFromOdds(winner(g.odds)!);
      const fo: Outcome = f.home >= f.away ? "home" : "away";
      const w = winnerOf(resultOf(g)!);
      expected += f[fo];
      if (w === fo) won++;
      if (!upset || f[w] < upset.chance) {
        const s = resultOf(g)!;
        upset = { home: teamRu(g.homeTeam.name), away: teamRu(g.awayTeam.name), score: `${s.home}:${s.away}`, chance: f[w], id: g.id };
      }
    }
    return { days, games: games.length, favWon: won / games.length, favExpected: expected / games.length, upset, demo: seasons.some((s) => s?.demo) };
  }
  return null;
}
