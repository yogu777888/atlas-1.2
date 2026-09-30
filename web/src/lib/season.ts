/**
 * A league's season: every game with its closing odds and result. From it we
 * build the table, the team list, team pages and the "what if" replays. One
 * cached API call per league and season.
 */
import { rememberLogo } from "./badges";
import { demoSeasonGames } from "./demo";
import { CLUB_LEAGUES, leagueSourceId, type ClubLeague } from "./leagues";
import { fairFromOdds, OUTCOMES, winnerOf, type Probs1x2 } from "./matches";
import { sstats } from "./sstats/client";
import type { SsGame } from "./sstats/types";
import { teamRu, teamSlug } from "./teams";

/** Seasons are named by the year they start in (2026 = 2026/27); a new one starts in July. */
export function seasonYear(now = Date.now()): number {
  const d = new Date(now);
  return d.getUTCMonth() >= 6 ? d.getUTCFullYear() : d.getUTCFullYear() - 1;
}

export const seasonLabel = (year: number) => `${year}/${String((year + 1) % 100).padStart(2, "0")}`;

export type Season = { league: ClubLeague; year: number; games: SsGame[]; demo: boolean };

/** All games of a season. Past seasons don't change, so they are cached for a day. */
export async function getSeason(league: ClubLeague, year = seasonYear()): Promise<Season> {
  const current = year >= seasonYear();
  try {
    const games = await sstats<SsGame[]>("/Games/list", { LeagueId: leagueSourceId(league), Year: year, Limit: 1000 }, current ? 3_600 : 86_400);
    for (const g of games) for (const t of [g.homeTeam, g.awayTeam]) rememberLogo(teamRu(t.name), t.logoUrl);
    return { league, year, games, demo: false };
  } catch (err) {
    if (process.env.NODE_ENV !== "test") console.error(`[season] ${league} ${year} unavailable, using demo data`, (err as Error).message);
    return { league, year, games: demoSeasonGames(league, year), demo: true };
  }
}

const ENDED = new Set([8, 9, 10, 17, 18]);
const score = (x: unknown) => (x === null || x === undefined || x === "" ? null : Number(x));

/** Result of a finished game, or null. */
export function resultOf(g: SsGame): { home: number; away: number } | null {
  const h = score(g.homeResult), a = score(g.awayResult);
  if (h === null || a === null || Number.isNaN(h) || Number.isNaN(a)) return null;
  if (g.status !== null && g.status !== undefined && !ENDED.has(Number(g.status))) return null;
  return { home: h, away: a };
}

/** League games only: drops qualifiers and play-offs when the rounds are named. */
export function leagueGames(games: SsGame[]): SsGame[] {
  const named = (re: RegExp) => games.filter((g) => g.roundName && re.test(g.roundName));
  const regular = named(/regular season/i);
  if (regular.length) return regular;
  const phase = named(/league (stage|phase)/i);
  return phase.length ? phase : games;
}

export type TeamRef = { id: number; name: string; slug: string };

export function teamsOf(games: SsGame[]): TeamRef[] {
  const map = new Map<number, TeamRef>();
  for (const g of games)
    for (const t of [g.homeTeam, g.awayTeam]) {
      const id = Number(t.id);
      if (!map.has(id)) {
        const name = teamRu(t.name);
        map.set(id, { id, name, slug: teamSlug(name) });
      }
    }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "ru"));
}

export type Row = TeamRef & { played: number; won: number; drawn: number; lost: number; gf: number; ga: number; points: number; form: ("W" | "D" | "L")[] };

/**
 * The table from finished games: points, then goal difference, then goals
 * scored. Official tie-breaks (head-to-head first in some leagues) can order
 * level teams differently.
 */
export function standings(games: SsGame[]): Row[] {
  const rows = new Map<number, Row>();
  const row = (t: { id: number; name: string }) => {
    const id = Number(t.id);
    let r = rows.get(id);
    if (!r) {
      const name = teamRu(t.name);
      r = { id, name, slug: teamSlug(name), played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0, form: [] };
      rows.set(id, r);
    }
    return r;
  };
  const played = leagueGames(games)
    .filter((g) => resultOf(g))
    .sort((a, b) => (a.dateUtc ?? 0) - (b.dateUtc ?? 0));
  for (const g of leagueGames(games)) {
    row(g.homeTeam);
    row(g.awayTeam);
  }
  for (const g of played) {
    const s = resultOf(g)!;
    const h = row(g.homeTeam), a = row(g.awayTeam);
    for (const [t, f, ag] of [[h, s.home, s.away], [a, s.away, s.home]] as const) {
      t.played++;
      t.gf += f;
      t.ga += ag;
      const res = f > ag ? "W" : f < ag ? "L" : "D";
      if (res === "W") { t.won++; t.points += 3; }
      else if (res === "D") { t.drawn++; t.points += 1; }
      else t.lost++;
      t.form.push(res);
    }
  }
  return [...rows.values()]
    .map((r) => ({ ...r, form: r.form.slice(-5) }))
    .sort((a, b) => b.points - a.points || b.gf - b.ga - (a.gf - a.ga) || b.gf - a.gf || a.name.localeCompare(b.name, "ru"));
}

/** Where a team is in the season: its row, place, and its next and last games. */
export function teamSeason(season: Season, teamId: number, now = Date.now()) {
  const table = standings(season.games);
  const place = table.findIndex((r) => r.id === teamId) + 1;
  const mine = season.games
    .filter((g) => Number(g.homeTeam.id) === teamId || Number(g.awayTeam.id) === teamId)
    .sort((a, b) => (a.dateUtc ?? 0) - (b.dateUtc ?? 0));
  const upcoming = mine.filter((g) => !resultOf(g) && (g.dateUtc ?? 0) * 1000 > now - 2 * 3_600_000);
  return { table, row: table[place - 1] ?? null, place: place || null, upcoming };
}

/** Finds a team page's team: the league we expect first, then the others. */
export async function findTeam(slug: string, expected?: string, year = seasonYear()): Promise<{ team: TeamRef; season: Season } | null> {
  const order = [...CLUB_LEAGUES].sort((a, b) => Number(b === expected) - Number(a === expected));
  for (const league of order) {
    const season = await getSeason(league, year);
    const team = teamsOf(leagueGames(season.games)).find((t) => t.slug === slug);
    if (team) return { team, season };
  }
  return null;
}

export type CalibrationBin = { from: number; to: number; expected: number; actual: number; n: number };

/**
 * How honest the market's chances were: every outcome of every finished game,
 * grouped by the chance the closing odds gave it, against how often it happened.
 */
export function calibration(games: SsGame[], step = 0.1): CalibrationBin[] {
  const bins = Array.from({ length: Math.round(1 / step) }, (_, i) => ({ from: i * step, to: (i + 1) * step, sum: 0, hits: 0, n: 0 }));
  for (const g of games) {
    const s = resultOf(g);
    const m = g.odds?.find((b) => b.marketId === 1);
    const get = (n: string) => m?.odds.find((o) => o.name === n)?.value;
    const h = get("Home"), d = get("Draw"), a = get("Away");
    if (!s || !h || !d || !a || h <= 1 || d <= 1 || a <= 1) continue;
    const fair: Probs1x2 = fairFromOdds({ home: h, draw: d, away: a });
    const won = winnerOf(s);
    for (const o of OUTCOMES) {
      const b = bins[Math.min(bins.length - 1, Math.floor(fair[o] / step))];
      b.sum += fair[o];
      b.hits += o === won ? 1 : 0;
      b.n++;
    }
  }
  return bins.filter((b) => b.n > 0).map((b) => ({ from: b.from, to: b.to, expected: b.sum / b.n, actual: b.hits / b.n, n: b.n }));
}
