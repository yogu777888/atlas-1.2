/**
 * Where game stats live. A finished game never changes, so each one is fetched
 * from /Games/{id} once, reduced to a small record and kept on disk
 * (STATS_DIR, default .data/games). Pages read from disk and fetch a few
 * missing games themselves; /api/stats/sync fills whole leagues in the
 * background. Requests go through a budget below the key's limit of 150 a
 * minute, so the rest of the site always has room.
 *
 * Game fetches use node:https rather than fetch on purpose: Next would keep a
 * second copy of every response in its data cache.
 */
import { promises as fs } from "node:fs";
import https from "node:https";
import path from "node:path";
import type { DemoGame } from "./demo";
import { demoGameStats } from "./demo-stats";
import { CLUB_LEAGUES, type ClubLeague } from "./leagues";
import { getSeason, leagueGames, resultOf, seasonYear } from "./season";
import type { SsGame, SsGameFull } from "./sstats/types";
import { fromFull, teamProfile, topScorers, type GameStats } from "./stats";

const DIR = process.env.STATS_DIR || path.join(process.cwd(), ".data", "games");
const BUDGET = Number(process.env.STATS_RATE_PER_MIN ?? 90);

const mem = new Map<number, GameStats>();
const stamps: number[] = [];

/** One request from the per-minute budget; false when it is spent. */
function take(): boolean {
  const now = Date.now();
  while (stamps.length && now - stamps[0] > 60_000) stamps.shift();
  if (stamps.length >= BUDGET) return false;
  stamps.push(now);
  return true;
}

function getJson<T>(url: URL): Promise<T> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 15_000 }, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (c) => (body += c));
      res.on("end", () => {
        try {
          resolve(JSON.parse(body) as T);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on("timeout", () => req.destroy(new Error("timeout")));
    req.on("error", reject);
  });
}

async function fetchGame(id: number): Promise<GameStats | null> {
  const url = new URL(`/Games/${id}`, "https://api.sstats.net");
  if (process.env.SSTATS_API_KEY) url.searchParams.set("apikey", process.env.SSTATS_API_KEY);
  const body = await getJson<{ status: string; data: SsGameFull | null }>(url);
  return body.status === "OK" && body.data ? fromFull(body.data) : null;
}

const file = (id: number) => path.join(DIR, `${id}.json`);

async function readStored(id: number): Promise<GameStats | null> {
  const hit = mem.get(id);
  if (hit) return hit;
  try {
    const g = JSON.parse(await fs.readFile(file(id), "utf8")) as GameStats;
    mem.set(id, g);
    return g;
  } catch {
    return null;
  }
}

async function store(g: GameStats) {
  mem.set(g.id, g);
  try {
    await fs.mkdir(DIR, { recursive: true });
    await fs.writeFile(file(g.id), JSON.stringify(g));
  } catch (err) {
    console.error("[stats] cannot write", file(g.id), (err as Error).message);
  }
}

/** Stats for these games: stored ones, plus up to `cap` fetched now (in the order given). */
export async function gameStats(ids: number[], cap = 30): Promise<GameStats[]> {
  const found = await Promise.all(ids.map(readStored));
  const out = found.filter((g): g is GameStats => g !== null);
  const missing = ids.filter((_, i) => !found[i]).slice(0, cap);
  let next = 0;
  const worker = async () => {
    while (next < missing.length) {
      const id = missing[next++];
      if (!take()) return;
      const g = await fetchGame(id).catch((err) => {
        console.error(`[stats] game ${id}:`, (err as Error).message);
        return null;
      });
      if (g) {
        await store(g);
        out.push(g);
      }
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));
  return out;
}

export type TeamGames = {
  games: GameStats[];
  /** Finished games in the window; fewer in `games` means some are not fetched yet */
  expected: number;
  demo: boolean;
};

/** Newest first: a team's finished league games, this season then last. */
async function teamWindowGames(league: ClubLeague, teamId: number, n: number) {
  const year = seasonYear();
  const [cur, prev] = await Promise.all([getSeason(league, year), getSeason(league, year - 1)]);
  const games = [...leagueGames(cur.games), ...leagueGames(prev.games)]
    .filter((g) => resultOf(g) && (Number(g.homeTeam.id) === teamId || Number(g.awayTeam.id) === teamId))
    .sort((a, b) => (b.dateUtc ?? 0) - (a.dateUtc ?? 0))
    .slice(0, n);
  return { games, demo: cur.demo };
}

const fromDemo = (games: SsGame[], league: ClubLeague) =>
  games.map((g) => demoGameStats(g as DemoGame, league === "rpl")).filter((g): g is GameStats => g !== null);

/** A team's last `n` league games with stats. */
export async function teamGames(league: ClubLeague, teamId: number, n = 15, cap = 20): Promise<TeamGames> {
  const w = await teamWindowGames(league, teamId, n);
  if (w.demo) return { games: fromDemo(w.games, league), expected: w.games.length, demo: true };
  return { games: await gameStats(w.games.map((g) => g.id), cap), expected: w.games.length, demo: false };
}

/** Enough of the window is in to show numbers: at least 80% of it and three games. */
export const enough = (t: TeamGames) => t.games.length >= 3 && t.games.length >= 0.8 * t.expected;

/** Background fill: every team's window in the club leagues, until the time or the request budget runs out. */
export async function syncStats(msBudget = 50_000, n = 15) {
  const until = Date.now() + msBudget;
  const report: Record<string, { wanted: number; stored: number }> = {};
  for (const league of CLUB_LEAGUES) {
    const season = await getSeason(league);
    if (season.demo) continue;
    const teams = new Set(season.games.flatMap((g) => [Number(g.homeTeam.id), Number(g.awayTeam.id)]));
    const ids = new Set<number>();
    for (const t of teams) for (const g of (await teamWindowGames(league, t, n)).games) ids.add(g.id);
    const list = [...ids];
    let stored = (await Promise.all(list.map(readStored))).filter(Boolean).length;
    while (stored < list.length && Date.now() < until && stamps.length < BUDGET) {
      await gameStats(list, 20);
      const now = (await Promise.all(list.map(readStored))).filter(Boolean).length;
      if (now === stored) break;
      stored = now;
    }
    report[league] = { wanted: list.length, stored };
  }
  return report;
}

/** Both teams of a match or a comparison: profile and best scorers, if enough games are in. */
export async function pairStats(league: ClubLeague, aId: number, bId: number) {
  const [ga, gb] = await Promise.all([teamGames(league, aId), teamGames(league, bId)]);
  const side = (t: TeamGames, id: number) => ({ games: t.games.length, profile: teamProfile(t.games, id), scorers: topScorers(t.games, id, 3) });
  const a = side(ga, aId), b = side(gb, bId);
  return { ok: enough(ga) && enough(gb) && !!a.profile && !!b.profile, demo: ga.demo, a, b };
}
export type PairStats = Awaited<ReturnType<typeof pairStats>>;
