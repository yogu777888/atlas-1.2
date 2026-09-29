import { describe, expect, it } from "vitest";
import type { SsGame } from "./sstats/types";
import { leagueTable, ledger, toPlayed } from "./whatif";

const g = (id: number, day: number, home: [number, string], away: [number, string], hr: number, ar: number, o: [number, number, number]): SsGame => ({
  id, date: null, dateUtc: 1_780_000_000 + day * 86_400, status: 8,
  homeTeam: { id: home[0], name: home[1] }, awayTeam: { id: away[0], name: away[1] },
  season: { year: 2025, league: null }, roundName: null, homeResult: hr, awayResult: ar,
  odds: [{ marketId: 1, marketName: "Match Winner", odds: [{ name: "Home", value: o[0] }, { name: "Draw", value: o[1] }, { name: "Away", value: o[2] }] }],
});

const Z: [number, string] = [1, "Zenit"], S: [number, string] = [2, "Spartak Moscow"], C: [number, string] = [3, "CSKA Moscow"];
// Zenit wins at 1.80, draws, loses at 2.50 away; one game has no odds and is skipped.
const season = toPlayed([
  g(3, 3, C, Z, 1, 0, [2.8, 3.3, 2.5]),
  g(1, 1, Z, S, 2, 1, [1.8, 3.6, 4.5]),
  g(2, 2, S, Z, 1, 1, [3.0, 3.4, 2.3]),
  { ...g(4, 4, Z, C, 3, 0, [1.5, 4, 6]), odds: null },
]);

describe("what if", () => {
  it("keeps finished games with odds, oldest first", () => expect(season.map((x) => x.id)).toEqual([1, 2, 3]));
  it("replays backing a team to win", () => {
    const l = ledger(season, 1);
    expect(l.steps.map((s) => s.bank)).toEqual([80, -20, -120]);
    expect(l).toMatchObject({ profit: -120, staked: 300, wins: 1 });
    expect(l.roi).toBeCloseTo(-0.4);
  });
  it("replays betting against it and on the draw", () => {
    expect(ledger(season, 1, "lose").profit).toBe(-100 - 100 + 180); // CSKA won at 2.80
    expect(ledger(season, 1, "draw").profit).toBe(-100 + 240 - 100);
  });
  it("ranks the league by profit", () => {
    const t = leagueTable(season);
    expect(t[0]).toMatchObject({ name: "ЦСКА", profit: 180 });
    expect(t.map((r) => [r.name, r.profit])).toEqual([["ЦСКА", 180], ["Зенит", -120], ["Спартак", -200]]);
  });
});
