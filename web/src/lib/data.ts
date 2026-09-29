import { demoGame, demoPrice, demoSeasonGames, demoUpcoming, poissonChances } from "./demo";
import { goalMarkets, headToHead, missingPlayers, teamForm, toForm, toH2H, type FormGame, type GoalMarkets, type H2HGame, type Missing } from "./forecast";
import { classifyLeague, CLUB_LEAGUES, otherLeague, type League } from "./leagues";
import { consensus, matchSlug, OUTCOMES, statusFromCode, winner, type Match, type Odds1x2 } from "./matches";
import { findPariLine, pariLines, type PariLine } from "./pari";
import { resultOf, seasonYear } from "./season";
import { sstats } from "./sstats/client";
import type { SsBookmakerOdds, SsGame, SsGlicko } from "./sstats/types";
import { teamRu } from "./teams";

export { winner };
export type DataSource = "live" | "demo";

const DAYS_AHEAD = 7;
/** Other leagues' games shown when the top leagues are quiet (midweek, international breaks) */
const MIN_TOP_MATCHES = 12;
const OTHER_LIMIT = 30;

/** YYYY-MM-DD in Moscow time, `plusDays` from today. */
function moscowDate(plusDays = 0): string {
  const d = new Date(Date.now() + plusDays * 86_400_000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Moscow" }).format(d);
}

const num = (x: unknown) => (x === null || x === undefined || x === "" ? null : Number(x));

/** Our league for a game: one we cover, or "other" labelled with its own name. */
function leagueOf(g: SsGame): League {
  const l = g.season?.league ?? null;
  return classifyLeague(l) ?? (l ? { ...otherLeague, label: `${l.name}${l.country ? ` (${l.country.name})` : ""}`, short: l.name } : otherLeague);
}

/** One sstats game as a tag.bet match. */
export function toMatch(g: SsGame, league: League, line?: PariLine | null, demo = false): Match {
  const start = (g.dateUtc ?? 0) * 1000;
  const home = teamRu(g.homeTeam.name), away = teamRu(g.awayTeam.name);
  const market = winner(g.odds);
  const status = statusFromCode(g.status, start);
  const h = num(g.homeResult), a = num(g.awayResult);
  return {
    id: `${demo ? "demo" : "ss"}-${g.id}`,
    slug: matchSlug(home, away, g.id),
    sstatsId: g.id,
    league,
    homeId: Number(g.homeTeam.id),
    awayId: Number(g.awayTeam.id),
    home,
    away,
    commenceTime: new Date(start).toISOString(),
    status,
    score: status !== "scheduled" && h !== null && a !== null && !Number.isNaN(h) && !Number.isNaN(a) ? { home: h, away: a } : null,
    market,
    fair: market ? consensus([market]) : null,
    pari: line?.odds ? { odds: line.odds, url: line.url, updatedAt: line.updatedAt } : null,
  };
}

// ------------------------------------------------------------------ live (sstats.net + PARI)

/** All upcoming games in the window. The API returns at most 1000 per call, and a few days hold several thousand. */
export async function upcomingGames(from: string, to: string): Promise<SsGame[]> {
  const all: SsGame[] = [];
  const limit = 1000;
  for (let page = 0; page < 10; page++) {
    const batch = await sstats<SsGame[]>("/Games/list", { Upcoming: true, From: from, To: to, TimeZone: 3, Limit: limit, Offset: page * limit }, 1800);
    all.push(...batch);
    if (batch.length < limit) break;
  }
  return all;
}

async function liveMatches(): Promise<Match[]> {
  const from = moscowDate(0), to = moscowDate(DAYS_AHEAD);
  const games = await upcomingGames(from, to);

  let lines: PariLine[] = [];
  try {
    lines = await pariLines(from, to);
  } catch (err) {
    console.error("[data] PARI unavailable", err);
  }

  const now = Date.now();
  const out: Match[] = [];
  const others: Match[] = [];
  for (const g of games) {
    const top = classifyLeague(g.season?.league ?? null);
    if (!g.dateUtc || !g.season?.league) continue;
    // Outside the top leagues keep only games with a priced market
    if (!top && !winner(g.odds)) continue;
    const start = g.dateUtc * 1000;
    if (start < now) continue;
    const line = findPariLine(lines, start, g.homeTeam.name, g.awayTeam.name);
    (top ? out : others).push(toMatch(g, top ?? leagueOf(g), line));
  }
  if (out.length < MIN_TOP_MATCHES) {
    // Prefer games PARI prices, then the soonest ones
    others.sort((a, b) => Number(!!b.pari) - Number(!!a.pari) || a.commenceTime.localeCompare(b.commenceTime));
    out.push(...others.slice(0, OTHER_LIMIT));
  }
  return out;
}

// ------------------------------------------------------------------ demo fallback

/** Next week's demo fixtures, with a bookmaker line that sometimes beats the fair price. */
function demoMatches(): Match[] {
  const now = Date.now();
  return demoUpcoming(now, now + DAYS_AHEAD * 86_400_000).map((g) => {
    const m = toMatch(g, leagueOf(g), null, true);
    const k = m.market;
    return k ? { ...m, pari: { odds: { home: demoPrice(k.home, g.id * 3), draw: demoPrice(k.draw, g.id * 3 + 1), away: demoPrice(k.away, g.id * 3 + 2) }, url: null, updatedAt: null } } : m;
  });
}

// ------------------------------------------------------------------ public API

let lastSource: DataSource = "demo";
export const dataSource = () => lastSource;

/** Upcoming matches for the next week, soonest first. */
export async function getMatches(leagueKey?: string): Promise<Match[]> {
  let all: Match[];
  try {
    all = await liveMatches();
    lastSource = "live";
  } catch (err) {
    console.error("[data] sstats unavailable, serving demo data", (err as Error).message);
    all = demoMatches();
    lastSource = "demo";
  }
  return all
    .filter((m) => new Date(m.commenceTime).getTime() > Date.now())
    .filter((m) => !leagueKey || m.league.key === leagueKey)
    .sort((a, b) => a.commenceTime.localeCompare(b.commenceTime));
}

/**
 * A match by its sstats id, whether it is upcoming, being played or over, so a
 * forecast page keeps working after kick-off. Null when there is no such game;
 * throws when the API is down, so a cached page is kept rather than replaced by a 404.
 */
export async function findMatch(id: number): Promise<Match | null> {
  const upcoming = await getMatches();
  const hit = upcoming.find((m) => m.sstatsId === id);
  if (hit) return hit;
  if (lastSource === "demo") {
    const g = demoGame(id);
    return g ? toMatch(g, leagueOf(g), null, true) : null;
  }
  try {
    const { game } = await sstats<{ game: SsGame }>(`/Games/${id}`, {}, 300);
    return game ? toMatch(game, leagueOf(game)) : null;
  } catch (err) {
    if (/HTTP 40[04]|ERROR|NotFound/i.test((err as Error).message)) return null;
    throw err;
  }
}

/** A team's latest results: all competitions from the API, or the demo season's games. */
export async function teamRecent(teamId: number, season: { games: SsGame[]; demo: boolean }, limit = 6): Promise<FormGame[]> {
  if (!season.demo) return teamForm(teamId, limit);
  const games = season.games
    .filter((g) => resultOf(g) && (Number(g.homeTeam.id) === teamId || Number(g.awayTeam.id) === teamId))
    .sort((a, b) => (b.dateUtc ?? 0) - (a.dateUtc ?? 0))
    .slice(0, limit);
  return toForm(games, teamId);
}

export type MatchDetail = {
  /** Consensus of individual international books (names are not shown on the site) */
  worldBooks: number;
  world: ReturnType<typeof consensus>;
  bestWorldMargin: number | null;
  /** Rating-based win chances; `draw` is null when the model doesn't price a draw */
  glicko: { home: number; draw: number | null; away: number; homeXg: number | null; awayXg: number | null } | null;
  goals: GoalMarkets;
  form: { home: FormGame[]; away: FormGame[] };
  h2h: H2HGame[];
  missing: Missing[];
};

/** Extra data for the match page: per-book world market, goal markets, form, head-to-head, absences, rating forecast. */
export async function getMatchDetail(m: Match): Promise<MatchDetail> {
  if (m.id.startsWith("demo-")) return demoDetail(m);
  const none = { worldBooks: 0, world: m.fair, bestWorldMargin: null, glicko: null, goals: { over25: null, btts: null, books: 0 }, form: { home: [], away: [] }, h2h: [], missing: [] };
  if (!m.sstatsId) return none;
  const { homeId, awayId } = m;
  const [books, glicko, homeForm, awayForm, h2h, missing] = await Promise.all([
    sstats<SsBookmakerOdds[]>(`/Odds/${m.sstatsId}`, {}, 1800).catch(() => [] as SsBookmakerOdds[]),
    sstats<{ glicko: SsGlicko }>(`/Games/glicko/${m.sstatsId}`, {}, 21_600).catch(() => null),
    homeId ? teamForm(homeId) : Promise.resolve([]),
    awayId ? teamForm(awayId) : Promise.resolve([]),
    homeId && awayId ? headToHead(homeId, awayId) : Promise.resolve([]),
    homeId ? missingPlayers(m.sstatsId, homeId) : Promise.resolve([]),
  ]);
  const prices = books.map((b) => winner(b.odds)).filter((x): x is Odds1x2 => x !== null);
  const margins = prices.map((p) => OUTCOMES.reduce((s, o) => s + 1 / p[o], 0) - 1);
  const g = glicko?.glicko;
  // Probabilities may come as 0..1 or as percents
  const asProb = (x: number | null | undefined) => (x === null || x === undefined ? null : x > 1 ? x / 100 : x);
  const hw = asProb(g?.homeWinProbability), aw = asProb(g?.awayWinProbability);
  // After kick-off the team's latest game is this one; the form shown is what came before it
  const before = (f: FormGame[]) => f.filter((x) => x.date < m.commenceTime);
  return {
    worldBooks: prices.length,
    world: consensus(prices) ?? m.fair,
    bestWorldMargin: margins.length ? Math.min(...margins) : null,
    glicko:
      hw !== null && aw !== null
        ? { home: hw, away: aw, draw: hw + aw < 0.97 ? 1 - hw - aw : null, homeXg: g?.homeXg ?? null, awayXg: g?.awayXg ?? null }
        : null,
    goals: goalMarkets(books),
    form: { home: before(homeForm), away: before(awayForm) },
    h2h: h2h.filter((x) => x.date < m.commenceTime),
    missing,
  };
}

/** Demo extras from the demo season itself, so form and head-to-head agree with the tables. */
function demoDetail(m: Match): MatchDetail {
  const g = m.sstatsId ? demoGame(m.sstatsId) : null;
  const start = Date.parse(m.commenceTime);
  const year = seasonYear(start);
  const key = CLUB_LEAGUES.find((k) => k === m.league.key);
  const games = key ? [...demoSeasonGames(key, year - 1), ...demoSeasonGames(key, year)] : [];
  const past = games.filter((x) => resultOf(x) && (x.dateUtc ?? 0) * 1000 < start).sort((a, b) => (b.dateUtc ?? 0) - (a.dateUtc ?? 0));
  const of = (id?: number) => past.filter((x) => Number(x.homeTeam.id) === id || Number(x.awayTeam.id) === id).slice(0, 5);
  const both = past.filter((x) => [Number(x.homeTeam.id), Number(x.awayTeam.id)].sort().join() === [m.homeId, m.awayId].sort().join()).slice(0, 5);
  const c = g ? poissonChances(g.xg[0], g.xg[1]) : null;
  return {
    worldBooks: 0,
    world: m.fair,
    bestWorldMargin: null,
    glicko: null,
    goals: { over25: c?.over25 ?? null, btts: c?.btts ?? null, books: c ? 1 : 0 },
    form: { home: m.homeId ? toForm(of(m.homeId), m.homeId) : [], away: m.awayId ? toForm(of(m.awayId), m.awayId) : [] },
    h2h: toH2H(both),
    missing: [
      { team: "home", player: "Игрок А. (пример)", reason: "травма" },
      { team: "away", player: "Игрок Б. (пример)", reason: "дисквалификация" },
    ],
  };
}
