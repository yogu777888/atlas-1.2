import { classifyLeague, getLeague, leagues } from "./leagues";
import { consensus, OUTCOMES, type Match, type Odds1x2 } from "./matches";
import { mockEvents } from "./odds/mock";
import { findPariLine, pariLines } from "./pari";
import { sstats } from "./sstats/client";
import type { SsBookmakerOdds, SsGame, SsGlicko } from "./sstats/types";

export type DataSource = "live" | "demo";

const DAYS_AHEAD = 4;

/** YYYY-MM-DD in Moscow time, `plusDays` from today. */
function moscowDate(plusDays = 0): string {
  const d = new Date(Date.now() + plusDays * 86_400_000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Moscow" }).format(d);
}

const winner = (bets: { marketId: number; odds: { name: string; value: number }[] }[] | null | undefined): Odds1x2 | null => {
  const m = bets?.find((b) => b.marketId === 1);
  if (!m) return null;
  const get = (n: string) => m.odds.find((o) => o.name === n)?.value;
  const h = get("Home"), d = get("Draw"), a = get("Away");
  return h && d && a && h > 1 && d > 1 && a > 1 ? { home: h, draw: d, away: a } : null;
};

// ------------------------------------------------------------------ live (sstats.net + PARI)

async function liveMatches(): Promise<Match[]> {
  const from = moscowDate(0), to = moscowDate(DAYS_AHEAD);
  const games = await sstats<SsGame[]>("/Games/list", { Upcoming: true, From: from, To: to, TimeZone: 3, Limit: 1000 }, 1800);

  let lines: Awaited<ReturnType<typeof pariLines>> = [];
  try {
    lines = await pariLines(from, to);
  } catch (err) {
    console.error("[data] PARI unavailable", err);
  }

  const now = Date.now();
  const out: Match[] = [];
  for (const g of games) {
    const league = classifyLeague(g.season?.league ?? null);
    if (!league || !g.dateUtc) continue;
    const start = g.dateUtc * 1000;
    if (start < now) continue;
    const market = winner(g.odds);
    const line = findPariLine(lines, start, g.homeTeam.name, g.awayTeam.name);
    out.push({
      id: `ss-${g.id}`,
      sstatsId: g.id,
      league,
      home: g.homeTeam.name,
      away: g.awayTeam.name,
      commenceTime: new Date(start).toISOString(),
      market,
      fair: market ? consensus([market]) : null,
      pari: line?.odds ? { odds: line.odds, url: line.url, updatedAt: line.updatedAt } : null,
    });
  }
  return out;
}

// ------------------------------------------------------------------ demo fallback

const DEMO_LEAGUE: Record<string, string> = { "РПЛ": "rpl", "АПЛ": "epl", "Лига чемпионов": "ucl" };

function demoMatches(): Match[] {
  return mockEvents()
    .filter((e) => e.sport === "soccer" && e.outcomes.length === 3)
    .map((e) => {
      const books = e.books.map((b) => b.prices).filter((p): p is Odds1x2 => OUTCOMES.every((o) => !!p[o])) as Odds1x2[];
      const avg = (o: keyof Odds1x2) => books.reduce((s, b) => s + b[o], 0) / books.length;
      const market = books.length ? { home: avg("home"), draw: avg("draw"), away: avg("away") } : null;
      const pariBook = e.books.find((b) => b.bookmaker === "pari")?.prices;
      return {
        id: e.id,
        sstatsId: null,
        league: getLeague(DEMO_LEAGUE[e.league] ?? "rpl") ?? leagues[0],
        home: e.home,
        away: e.away,
        commenceTime: e.commenceTime,
        market,
        fair: consensus(books),
        pari: pariBook && OUTCOMES.every((o) => pariBook[o]) ? { odds: pariBook as Odds1x2, url: null, updatedAt: null } : null,
      };
    });
}

// ------------------------------------------------------------------ public API

let lastSource: DataSource = "demo";
export const dataSource = () => lastSource;

export async function getMatches(leagueKey?: string): Promise<Match[]> {
  let all: Match[];
  try {
    all = await liveMatches();
    lastSource = "live";
  } catch (err) {
    console.error("[data] sstats unavailable, serving demo data", err);
    all = demoMatches();
    lastSource = "demo";
  }
  return all
    .filter((m) => new Date(m.commenceTime).getTime() > Date.now())
    .filter((m) => !leagueKey || m.league.key === leagueKey)
    .sort((a, b) => a.commenceTime.localeCompare(b.commenceTime));
}

export async function getMatch(id: string): Promise<Match | null> {
  return (await getMatches()).find((m) => m.id === id) ?? null;
}

export type MatchDetail = {
  /** Consensus of individual international books (names are not shown on the site) */
  worldBooks: number;
  world: ReturnType<typeof consensus>;
  bestWorldMargin: number | null;
  /** Rating-based win chances; `draw` is null when the model doesn't price a draw */
  glicko: { home: number; draw: number | null; away: number; homeXg: number | null; awayXg: number | null } | null;
};

/** Extra data for the match page: per-book world market and Glicko rating forecast. */
export async function getMatchDetail(m: Match): Promise<MatchDetail> {
  if (!m.sstatsId) {
    return { worldBooks: 0, world: m.fair, bestWorldMargin: null, glicko: null };
  }
  const [books, glicko] = await Promise.all([
    sstats<SsBookmakerOdds[]>(`/Odds/${m.sstatsId}`, {}, 1800).catch(() => [] as SsBookmakerOdds[]),
    sstats<{ glicko: SsGlicko }>(`/Games/glicko/${m.sstatsId}`, {}, 21_600).catch(() => null),
  ]);
  const prices = books.map((b) => winner(b.odds)).filter((x): x is Odds1x2 => x !== null);
  const margins = prices.map((p) => OUTCOMES.reduce((s, o) => s + 1 / p[o], 0) - 1);
  const g = glicko?.glicko;
  // Probabilities may come as 0..1 or as percents
  const asProb = (x: number | null | undefined) => (x === null || x === undefined ? null : x > 1 ? x / 100 : x);
  const hw = asProb(g?.homeWinProbability), aw = asProb(g?.awayWinProbability);
  return {
    worldBooks: prices.length,
    world: consensus(prices) ?? m.fair,
    bestWorldMargin: margins.length ? Math.min(...margins) : null,
    glicko:
      hw !== null && aw !== null
        ? { home: hw, away: aw, draw: hw + aw < 0.97 ? 1 - hw - aw : null, homeXg: g?.homeXg ?? null, awayXg: g?.awayXg ?? null }
        : null,
  };
}
