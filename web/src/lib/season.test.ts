import { describe, expect, it } from "vitest";
import { demoSeasonGames } from "./demo";
import { matchSlug, parseMatchRef, statusFromCode } from "./matches";
import { calibration, leagueGames, resultOf, seasonLabel, seasonYear, standings, teamsOf } from "./season";
import type { SsGame } from "./sstats/types";

const g = (id: number, home: [number, string], away: [number, string], hr: number | null, ar: number | null, round = "Regular Season - 1", status = 8): SsGame => ({
  id, date: null, dateUtc: 1_780_000_000 + id * 86_400, status,
  homeTeam: { id: home[0], name: home[1] }, awayTeam: { id: away[0], name: away[1] },
  season: { year: 2026, league: null }, roundName: round, homeResult: hr, awayResult: ar,
  odds: [{ marketId: 1, marketName: "Match Winner", odds: [{ name: "Home", value: 2 }, { name: "Draw", value: 3.4 }, { name: "Away", value: 3.9 }] }],
});
const Z: [number, string] = [1, "Zenit"], S: [number, string] = [2, "Spartak Moscow"], C: [number, string] = [3, "CSKA Moscow"];

describe("season", () => {
  it("names seasons by the year they start", () => {
    expect(seasonYear(Date.UTC(2026, 8, 29))).toBe(2026);
    expect(seasonYear(Date.UTC(2027, 2, 1))).toBe(2026);
    expect(seasonLabel(2026)).toBe("2026/27");
  });

  it("builds the table from finished league games", () => {
    const games = [g(1, Z, S, 2, 1), g(2, S, C, 1, 1), g(3, C, Z, 0, 3), g(4, Z, C, null, null, "Regular Season - 2", 2), g(5, Z, S, 5, 0, "Qualifying Round")];
    const t = standings(games);
    expect(t.map((r) => [r.name, r.points, r.played])).toEqual([["Зенит", 6, 2], ["Спартак", 1, 2], ["ЦСКА", 1, 2]]);
    expect(t[0]).toMatchObject({ gf: 5, ga: 1, won: 2, form: ["W", "W"] });
    expect(leagueGames(games)).toHaveLength(4);
  });

  it("ignores scores of games that are not over", () => expect(resultOf(g(9, Z, S, 1, 0, "x", 3))).toBeNull());

  it("lists teams with Russian names and slugs", () => {
    expect(teamsOf([g(1, Z, S, 2, 1)]).map((t) => t.slug)).toEqual(["zenit", "spartak"]);
  });

  it("checks the market's chances against results", () => {
    const bins = calibration([g(1, Z, S, 2, 1), g(2, S, C, 0, 1)]);
    const total = bins.reduce((s, b) => s + b.n, 0);
    expect(total).toBe(6);
    expect(bins.every((b) => b.actual >= 0 && b.actual <= 1 && b.expected >= b.from && b.expected < b.to)).toBe(true);
  });
});

describe("match urls", () => {
  it("puts team names first and the id last", () => {
    expect(matchSlug("Зенит", "Спартак", 1632014)).toBe("zenit-spartak-1632014");
    expect(parseMatchRef("zenit-spartak-1632014")).toEqual({ live: 1632014 });
    expect(parseMatchRef("1632014")).toEqual({ live: 1632014 });
    expect(parseMatchRef("zenit-spartak")).toBeNull();
  });
  it("reads sstats statuses", () => {
    expect(statusFromCode(8, 0)).toBe("finished");
    expect(statusFromCode(2, Date.now() + 1e6)).toBe("scheduled");
    expect(statusFromCode(4, 0)).toBe("live");
    expect(statusFromCode(14, 0)).toBe("off");
  });
});

describe("demo season", () => {
  const now = Date.UTC(2026, 8, 29, 12);
  const games = demoSeasonGames("rpl", 2026, now);
  it("is a full double round-robin", () => {
    expect(games).toHaveLength(16 * 15);
    const pairs = new Set(games.map((x) => `${x.homeTeam.id}-${x.awayTeam.id}`));
    expect(pairs.size).toBe(240);
  });
  it("has results up to today and odds for every game", () => {
    const done = games.filter((x) => resultOf(x));
    expect(done.length).toBeGreaterThan(50);
    expect(done.every((x) => x.dateUtc! * 1000 < now)).toBe(true);
    expect(games.every((x) => x.odds?.[0].odds.length === 3)).toBe(true);
  });
  it("is the same every time", () => expect(demoSeasonGames("rpl", 2026, now).map((x) => x.homeResult)).toEqual(games.map((x) => x.homeResult)));
});
