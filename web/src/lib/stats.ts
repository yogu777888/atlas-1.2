/**
 * Team and player numbers built from finished games: goals, xG, shots,
 * corners and cards per game for a team, goals and assists for its players.
 * Each game is reduced to a small `GameStats` record once (see stats-store);
 * everything here is pure, so it is the same for live and demo data.
 */
import type { SsGameFull, SsNum } from "./sstats/types";
import { teamRu } from "./teams";

export type TeamLine = {
  goals: number;
  xg: number | null;
  shots: number | null;
  sot: number | null;
  corners: number | null;
  poss: number | null;
  yellow: number | null;
  big: number | null;
};

export type PlayerLine = {
  id: number;
  name: string;
  /** 0 home, 1 away */
  side: 0 | 1;
  min: number;
  goals: number;
  assists: number;
  shots: number;
  sot: number;
  keyPasses: number;
  yellow: number;
  red: number;
  pens: number;
  rating: number | null;
};

export type GameStats = {
  id: number;
  /** Kick-off, seconds */
  t: number;
  home: { id: number; name: string };
  away: { id: number; name: string };
  teams: [TeamLine, TeamLine];
  players: PlayerLine[];
};

const n = (x: SsNum | object): number | null => {
  if (x === null || x === undefined || x === "" || typeof x === "object") return null;
  const v = Number(x);
  return Number.isFinite(v) ? v : null;
};
const z = (x: SsNum) => n(x) ?? 0;

/** Reduces a /Games/{id} response to what we keep. Null while the game has no result. */
export function fromFull(full: SsGameFull): GameStats | null {
  const g = full.game;
  const hg = n(g.homeResult), ag = n(g.awayResult);
  if (hg === null || ag === null) return null;
  const s = full.statistics ?? {};
  const side = (sfx: "Home" | "Away", goals: number): TeamLine => ({
    goals,
    xg: n(s[`expectedGoals${sfx}`]) ?? n(s[`calculatedXg${sfx}`]),
    shots: n(s[`totalShots${sfx}`]),
    sot: n(s[`shotsOnGoal${sfx}`]),
    corners: n(s[`cornerKicks${sfx}`]),
    poss: n(s[`ballPossession${sfx}`]),
    yellow: n(s[`yellowCards${sfx}`]),
    big: n(s[`bigChances${sfx}`]),
  });
  const homeId = Number(g.homeTeam.id);

  // playerStats has no team: take it from the line-ups, then from the events
  const teamOf = new Map<number, number>();
  const nameOf = new Map<number, string>();
  for (const p of full.lineupPlayers ?? []) {
    const id = n(p.playerId);
    if (id === null) continue;
    teamOf.set(id, Number(p.teamId));
    nameOf.set(id, p.playerName);
  }
  for (const e of full.events ?? []) {
    const id = n(e.player?.id);
    if (id === null) continue;
    if (!teamOf.has(id)) teamOf.set(id, Number(e.teamId));
    if (!nameOf.has(id) && e.player?.name) nameOf.set(id, e.player.name);
  }

  const players: PlayerLine[] = [];
  for (const p of full.playerStats ?? []) {
    const id = Number(p.playerId);
    const team = teamOf.get(id);
    const min = z(p.minutes);
    if (team === undefined || !min) continue;
    players.push({
      id,
      name: nameOf.get(id) ?? String(id),
      side: team === homeId ? 0 : 1,
      min,
      goals: z(p.goalsTotal),
      assists: z(p.goalsAssists),
      shots: z(p.shotsTotal),
      sot: z(p.shotsOn),
      keyPasses: z(p.passesKey),
      yellow: z(p.cardsYellow),
      red: z(p.cardsRed),
      pens: z(p.penaltyScored),
      rating: n(p.rating),
    });
  }

  return {
    id: Number(g.id),
    t: Number(g.dateUtc ?? 0),
    home: { id: homeId, name: teamRu(g.homeTeam.name) },
    away: { id: Number(g.awayTeam.id), name: teamRu(g.awayTeam.name) },
    teams: [side("Home", hg), side("Away", ag)],
    players,
  };
}

// ------------------------------------------------------------------ teams

export type TeamProfile = {
  games: number;
  /** Per game; null when fewer than half the games have the figure */
  gf: number;
  ga: number;
  xg: number | null;
  xga: number | null;
  shots: number | null;
  sot: number | null;
  corners: number | null;
  poss: number | null;
  yellow: number | null;
  big: number | null;
  /** Share of games without conceding */
  cleanSheets: number;
  /** Points per game over the last five */
  form: number | null;
  /** Goals scored minus xG over the games that have xG: positive means finishing above the chances */
  luck: number | null;
};

const sideOf = (g: GameStats, teamId: number): 0 | 1 | null => (g.home.id === teamId ? 0 : g.away.id === teamId ? 1 : null);

/** A team's averages over the given games (any order). */
export function teamProfile(games: GameStats[], teamId: number): TeamProfile | null {
  const mine = games.filter((g) => sideOf(g, teamId) !== null).sort((a, b) => b.t - a.t);
  if (!mine.length) return null;
  const own = mine.map((g) => g.teams[sideOf(g, teamId)!]);
  const opp = mine.map((g) => g.teams[1 - sideOf(g, teamId)!]);
  const avg = (xs: (number | null)[]) => {
    const v = xs.filter((x): x is number => x !== null);
    return v.length >= Math.ceil(xs.length / 2) ? v.reduce((s, x) => s + x, 0) / v.length : null;
  };
  const pts = (i: number): number => (own[i].goals > opp[i].goals ? 3 : own[i].goals === opp[i].goals ? 1 : 0);
  const last = Math.min(5, mine.length);
  const withXg = own.map((t, i) => (t.xg !== null ? t.goals - t.xg : null)).filter((x): x is number => x !== null);
  return {
    games: mine.length,
    gf: avg(own.map((t) => t.goals))!,
    ga: avg(opp.map((t) => t.goals))!,
    xg: avg(own.map((t) => t.xg)),
    xga: avg(opp.map((t) => t.xg)),
    shots: avg(own.map((t) => t.shots)),
    sot: avg(own.map((t) => t.sot)),
    corners: avg(own.map((t) => t.corners)),
    poss: avg(own.map((t) => t.poss)),
    yellow: avg(own.map((t) => t.yellow)),
    big: avg(own.map((t) => t.big)),
    cleanSheets: opp.filter((t) => t.goals === 0).length / mine.length,
    form: last >= 3 ? Array.from({ length: last }, (_, i) => pts(i)).reduce((s, x) => s + x, 0) / last : null,
    luck: withXg.length >= Math.ceil(mine.length / 2) ? withXg.reduce((s, x) => s + x, 0) : null,
  };
}

// ------------------------------------------------------------------ players

export type PlayerRow = {
  id: number;
  name: string;
  apps: number;
  min: number;
  goals: number;
  assists: number;
  shots: number;
  sot: number;
  pens: number;
  rating: number | null;
  /** Goals in the team's last five games */
  recent: number;
  /** Share of the team's goals over these games */
  share: number;
};

/** Every player who played for the team in these games, best scorers first. */
export function playerTable(games: GameStats[], teamId: number): PlayerRow[] {
  const mine = games.filter((g) => sideOf(g, teamId) !== null).sort((a, b) => b.t - a.t);
  const teamGoals = mine.reduce((s, g) => s + g.teams[sideOf(g, teamId)!].goals, 0);
  const rows = new Map<number, PlayerRow & { rsum: number; rn: number }>();
  mine.forEach((g, i) => {
    const side = sideOf(g, teamId)!;
    for (const p of g.players) {
      if (p.side !== side) continue;
      let r = rows.get(p.id);
      if (!r) {
        r = { id: p.id, name: p.name, apps: 0, min: 0, goals: 0, assists: 0, shots: 0, sot: 0, pens: 0, rating: null, recent: 0, share: 0, rsum: 0, rn: 0 };
        rows.set(p.id, r);
      }
      r.apps++;
      r.min += p.min;
      r.goals += p.goals;
      r.assists += p.assists;
      r.shots += p.shots;
      r.sot += p.sot;
      r.pens += p.pens;
      if (i < 5) r.recent += p.goals;
      if (p.rating !== null) {
        r.rsum += p.rating;
        r.rn++;
      }
    }
  });
  return [...rows.values()]
    .map(({ rsum, rn, ...r }) => ({ ...r, rating: rn ? rsum / rn : null, share: teamGoals ? r.goals / teamGoals : 0 }))
    .sort((a, b) => b.goals - a.goals || b.assists - a.assists || b.shots - a.shots || b.min - a.min);
}

/** The likeliest scorers: players with a goal or at least a shot a game, by goals then shots. */
export function topScorers(games: GameStats[], teamId: number, count = 3): PlayerRow[] {
  return playerTable(games, teamId)
    .filter((p) => p.goals > 0 || (p.apps >= 3 && p.shots / p.apps >= 1))
    .slice(0, count);
}

export const per90 = (x: number, min: number) => (min ? (x * 90) / min : 0);
