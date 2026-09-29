import { describe, expect, it } from "vitest";
import { goalMarkets, pointsPerGame, reasonRu, toForm, toH2H } from "./forecast";
import type { SsBookmakerOdds, SsGame } from "./sstats/types";

const game = (home: [number, string], away: [number, string], hr: number, ar: number): SsGame => ({
  id: 1, date: null, dateUtc: 1_790_000_000, status: 8,
  homeTeam: { id: home[0], name: home[1] }, awayTeam: { id: away[0], name: away[1] },
  season: { year: 2026, league: null }, roundName: null, odds: null, homeResult: hr, awayResult: ar,
});

describe("form", () => {
  const zenit = 596;
  const games = [game([596, "Zenit"], [597, "Spartak Moscow"], 2, 1), game([598, "CSKA Moscow"], [596, "Zenit"], 1, 1), game([599, "Krasnodar"], [596, "Zenit"], 2, 0)];
  it("reads results from the team's side, home or away", () => {
    expect(toForm(games, zenit).map((g) => g.result)).toEqual(["W", "D", "L"]);
    expect(toForm(games, zenit)[0]).toMatchObject({ opponent: "Спартак", home: true, gf: 2, ga: 1 });
  });
  it("averages points per game", () => expect(pointsPerGame(toForm(games, zenit))).toBeCloseTo(4 / 3));
  it("skips games without a score", () => expect(toForm([{ ...games[0], homeResult: null }], zenit)).toEqual([]));
  it("keeps head-to-head scores as played", () => expect(toH2H(games)[0]).toMatchObject({ home: "Зенит", away: "Спартак", hg: 2, ag: 1 }));
});

describe("goal markets", () => {
  const book = (over: number, under: number, yes: number, no: number): SsBookmakerOdds => ({
    bookmakerId: 1, bookmakerName: "x",
    odds: [
      { marketId: 5, marketName: "Goals Over/Under", odds: [{ name: "Over 1.5", value: 1.3 }, { name: "Over 2.5", value: over }, { name: "Under 2.5", value: under }] },
      { marketId: 8, marketName: "Both Teams Score", odds: [{ name: "Yes", value: yes }, { name: "No", value: no }] },
    ],
  });
  it("turns two-way prices into margin-free chances", () => {
    const g = goalMarkets([book(1.9, 1.9, 2.0, 1.8)]);
    expect(g.over25).toBeCloseTo(0.5);
    expect(g.btts).toBeCloseTo((1 / 2) / (1 / 2 + 1 / 1.8));
    expect(g.books).toBe(1);
  });
  it("returns nulls when no book prices the market", () => expect(goalMarkets([])).toEqual({ over25: null, btts: null, books: 0 }));
});

it("translates absence reasons", () => {
  expect(reasonRu("Knee Injury")).toBe("травма");
  expect(reasonRu("Red Card")).toBe("дисквалификация");
  expect(reasonRu(null)).toBe("не сыграет");
});
