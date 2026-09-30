import { describe, expect, it } from "vitest";
import { tally, teamRows, pairSlug, parsePair } from "./compare";
import { fromFull, playerTable, teamProfile, topScorers, type GameStats } from "./stats";
import type { SsGameFull } from "./sstats/types";

const full = (id: number, t: number, hs: number, as: number, scorer?: number): SsGameFull => ({
  game: { id, date: null, dateUtc: t, status: 8, homeTeam: { id: 1, name: "Zenit" }, awayTeam: { id: 2, name: "Spartak" }, season: { year: 2026, league: null }, roundName: null, odds: null, homeResult: hs, awayResult: String(as) },
  statistics: { expectedGoalsHome: "1.8", expectedGoalsAway: 0.6, totalShotsHome: 15, totalShotsAway: 7, cornerKicksHome: 6, cornerKicksAway: 3, ballPossessionHome: "58", ballPossessionAway: 42, otherStatsHome: {} },
  lineupPlayers: [
    { teamId: 1, playerId: 10, playerName: "J. Cordoba", position: "F", startXI: true },
    { teamId: 2, playerId: 20, playerName: "A. Sobolev", position: "F", startXI: true },
  ],
  playerStats: [
    { playerId: 10, minutes: 90, shotsTotal: 4, shotsOn: 2, goalsTotal: scorer === 10 ? hs : 0, goalsAssists: null, passesKey: 1, cardsYellow: 0, cardsRed: 0, penaltyScored: 0, rating: "7.4" },
    { playerId: 20, minutes: "80", shotsTotal: 2, shotsOn: 1, goalsTotal: as, goalsAssists: 0, passesKey: 0, cardsYellow: 1, cardsRed: 0, penaltyScored: 0, rating: null },
    { playerId: 99, minutes: 0, shotsTotal: 0, shotsOn: 0, goalsTotal: 0, goalsAssists: 0, passesKey: 0, cardsYellow: 0, cardsRed: 0, penaltyScored: 0, rating: null },
  ],
  events: [],
});

describe("game stats", () => {
  const g = fromFull(full(1, 100, 2, 1, 10))!;

  it("reduces a full game and puts players on their side", () => {
    expect(g.home.name).toBe("Зенит");
    expect(g.teams[0]).toMatchObject({ goals: 2, xg: 1.8, shots: 15, corners: 6, poss: 58 });
    expect(g.players.map((p) => [p.id, p.side, p.goals])).toEqual([
      [10, 0, 2],
      [20, 1, 1],
    ]);
  });

  it("returns null without a result", () => {
    const f = full(2, 100, 0, 0);
    f.game.homeResult = null;
    expect(fromFull(f)).toBeNull();
  });

  it("averages per game and counts form over the last five", () => {
    const games: GameStats[] = [fromFull(full(1, 100, 2, 1, 10))!, fromFull(full(2, 200, 0, 0))!, fromFull(full(3, 300, 0, 3))!];
    const z = teamProfile(games, 1)!;
    expect(z.games).toBe(3);
    expect(z.gf).toBeCloseTo(2 / 3);
    expect(z.ga).toBeCloseTo(4 / 3);
    expect(z.cleanSheets).toBeCloseTo(1 / 3);
    expect(z.form).toBeCloseTo(4 / 3);
    const s = teamProfile(games, 2)!;
    expect(s.xg).toBeCloseTo(0.6);
    expect(s.luck).toBeCloseTo(4 - 1.8);
  });

  it("builds the scorers table with recent goals and team share", () => {
    const games = [fromFull(full(1, 100, 2, 1, 10))!, fromFull(full(2, 200, 1, 0, 10))!];
    const [p] = playerTable(games, 1);
    expect(p).toMatchObject({ id: 10, apps: 2, goals: 3, recent: 3, share: 1, min: 180 });
    expect(p.rating).toBeCloseTo(7.4);
    expect(topScorers(games, 2).map((x) => x.id)).toEqual([20]);
  });
});

describe("comparison", () => {
  it("has one address per pair", () => {
    expect(pairSlug("Спартак", "Зенит")).toBe(pairSlug("Зенит", "Спартак"));
    expect(parsePair(pairSlug("Зенит", "Спартак"))).toHaveLength(2);
    expect(parsePair("zenit-vs-zenit")).toBeNull();
  });

  it("scores rows by the better side, lower-is-better included", () => {
    const g = [fromFull(full(1, 100, 3, 0, 10))!];
    const rows = teamRows(teamProfile(g, 1)!, teamProfile(g, 2)!);
    const t = tally(rows);
    expect(t.left).toBeGreaterThan(t.right);
    expect(rows.find((r) => r.label === "Владение мячом")?.neutral).toBe(true);
  });
});
