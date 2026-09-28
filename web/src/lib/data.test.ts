import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Real responses from api.sstats.net (trimmed), captured 2026-09-28
const games = {
  status: "OK",
  data: [
    {
      id: 1632014, date: "2026-09-29T01:00:00+03:00", dateUtc: 1790632800, status: 2,
      homeTeam: { id: 1179, name: "Libertad Asuncion" }, awayTeam: { id: 1182, name: "Olimpia" },
      season: { year: 2026, league: { id: 252, name: "Division Profesional - Clausura", country: { code: "PY", name: "Paraguay" } } },
      roundName: "Clausura - 12",
      odds: [{ marketId: 1, marketName: null, odds: [{ name: "Home", value: 2.38 }, { name: "Away", value: 2.7 }, { name: "Draw", value: 3.2 }] }],
    },
    {
      id: 1640285, date: "2026-09-29T01:00:00+03:00", dateUtc: 1790632800, status: 2,
      homeTeam: { id: 19410, name: "Paysandu" }, awayTeam: { id: 2374, name: "Tacuarembo" },
      season: { year: 2026, league: { id: 269, name: "Segunda División", country: { code: "UY", name: "Uruguay" } } },
      roundName: "2nd Phase - 20", odds: [],
    },
  ],
};
const pariMatches = {
  status: "OK", TotalCount: 1,
  data: [{
    matchInfo: {
      eventId: 68306856, startDate: "2026-09-29T01:00:00+03:00", status: "NotStarted",
      tournament: { id: 15088, name: "Paraguay. Premier League", url: null },
      homeTeam: { id: 422917, name: "Libertad Asuncion" }, awayTeam: { id: 422918, name: "Olimpia Asuncion" },
      url: "https://pari.ru/sports/football/15088/145433", lastUpdate: "2026-09-29T00:55:01+03:00",
    },
    currentOdds: [{ id: 101, value: 2.45 }, { id: 102, value: 3.3 }, { id: 103, value: 2.8 }, { id: 8250, value: 2.6 }],
  }],
};
// Assumed shape of the dictionary (ids are illustrative)
const markets = {
  status: "OK",
  data: [
    { id: 5, name: "Total", description: null, hasParameter: true, outcomes: [{ id: 1, name: "Больше", period: "FullTime", parameter: 2.5 }] },
    { id: 1, name: "1X2", description: "Исход", hasParameter: false, outcomes: [
      { id: 101, name: "П1", period: "FullTime", parameter: null },
      { id: 102, name: "X", period: "FullTime", parameter: null },
      { id: 103, name: "П2", period: "FullTime", parameter: null },
    ] },
  ],
};
const bookOdds = {
  status: "OK",
  data: [
    { bookmakerId: 4, bookmakerName: "Pinnacle", odds: [{ marketId: 1, marketName: "Match Winner", odds: [{ name: "Home", value: 2.55 }, { name: "Draw", value: 3.27 }, { name: "Away", value: 2.85 }] }] },
    { bookmakerId: 8, bookmakerName: "Bet365", odds: [{ marketId: 1, marketName: "Match Winner", odds: [{ name: "Home", value: 2.38 }, { name: "Draw", value: 3.2 }, { name: "Away", value: 2.7 }] }] },
  ],
};

beforeEach(() => {
  vi.stubEnv("SSTATS_LEAGUE_IDS", "252");
  vi.useFakeTimers({ now: new Date("2026-09-28T20:00:00Z"), toFake: ["Date"] });
  vi.stubGlobal("fetch", vi.fn(async (url: URL) => {
    const p = url.pathname.toLowerCase();
    const body = p === "/games/list" ? games : p === "/pari/matches" ? pariMatches : p === "/pari/odds/market-types" ? markets : p.startsWith("/odds/") ? bookOdds : p.startsWith("/games/glicko/") ? { status: "OK", data: { glicko: { homeWinProbability: 0.55, awayWinProbability: 0.45, homeXg: 1.4, awayXg: 1.1 } } } : { status: "ERR", data: null };
    return new Response(JSON.stringify(body), { status: 200 });
  }));
  vi.resetModules();
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe("live data pipeline", () => {
  it("builds matches from sstats games and attaches PARI odds", async () => {
    const { getMatches, dataSource } = await import("./data");
    const list = await getMatches();
    expect(dataSource()).toBe("live");
    expect(list).toHaveLength(1); // the Uruguay game is not in a covered league
    const m = list[0];
    expect(m.id).toBe("ss-1632014");
    expect(m.market).toEqual({ home: 2.38, draw: 3.2, away: 2.7 });
    expect(m.fair!.home + m.fair!.draw + m.fair!.away).toBeCloseTo(1, 10);
    expect(m.pari?.odds).toEqual({ home: 2.45, draw: 3.3, away: 2.8 });
  });

  it("adds the per-book market and the rating forecast on the match page", async () => {
    const { getMatches, getMatchDetail } = await import("./data");
    const [m] = await getMatches();
    const d = await getMatchDetail(m);
    expect(d.worldBooks).toBe(2);
    expect(d.glicko).toMatchObject({ home: 0.55, away: 0.45, draw: null });
  });
});
