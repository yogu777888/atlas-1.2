/**
 * The pieces of a match forecast beyond 1X2: recent form, head-to-head,
 * missing players and goal markets. Pure helpers are exported for tests;
 * fetchers go through the cached sstats client.
 */
import { sstats } from "./sstats/client";
import type { SsBookmakerOdds, SsGame, SsInjury } from "./sstats/types";
import { teamRu } from "./teams";

export type Result = "W" | "D" | "L";
export type FormGame = { date: string; opponent: string; home: boolean; gf: number; ga: number; result: Result };
export type H2HGame = { date: string; home: string; away: string; hg: number; ag: number };
export type Missing = { team: "home" | "away"; player: string; reason: string };
export type GoalMarkets = { over25: number | null; btts: number | null; books: number };

const num = (x: unknown) => (x === null || x === undefined || x === "" ? null : Number(x));

/** One team's recent results from its point of view, newest first. */
export function toForm(games: SsGame[], teamId: number): FormGame[] {
  const out: FormGame[] = [];
  for (const g of games) {
    const h = num(g.homeResult), a = num(g.awayResult);
    if (h === null || a === null || Number.isNaN(h) || Number.isNaN(a)) continue;
    const home = Number(g.homeTeam.id) === teamId;
    const gf = home ? h : a, ga = home ? a : h;
    out.push({
      date: g.dateUtc ? new Date(g.dateUtc * 1000).toISOString() : g.date ?? "",
      opponent: teamRu(home ? g.awayTeam.name : g.homeTeam.name),
      home,
      gf,
      ga,
      result: gf > ga ? "W" : gf < ga ? "L" : "D",
    });
  }
  return out;
}

export function toH2H(games: SsGame[]): H2HGame[] {
  return games.flatMap((g) => {
    const h = num(g.homeResult), a = num(g.awayResult);
    if (h === null || a === null || Number.isNaN(h) || Number.isNaN(a)) return [];
    return [{ date: g.dateUtc ? new Date(g.dateUtc * 1000).toISOString() : g.date ?? "", home: teamRu(g.homeTeam.name), away: teamRu(g.awayTeam.name), hg: h, ag: a }];
  });
}

/** Points per game over the given form (3 for a win, 1 for a draw). */
export const pointsPerGame = (f: FormGame[]) => (f.length ? f.reduce((s, g) => s + (g.result === "W" ? 3 : g.result === "D" ? 1 : 0), 0) / f.length : null);

/** Fair two-way probability of the first outcome, averaged over books that price both sides. */
function twoWay(books: SsBookmakerOdds[], market: RegExp, yes: RegExp, no: RegExp) {
  const probs: number[] = [];
  for (const b of books) {
    const bet = b.odds.find((o) => o.marketName && market.test(o.marketName));
    const y = bet?.odds.find((p) => yes.test(p.name))?.value, n = bet?.odds.find((p) => no.test(p.name))?.value;
    if (y && n && y > 1 && n > 1) probs.push(1 / y / (1 / y + 1 / n));
  }
  return probs.length ? { p: probs.reduce((s, x) => s + x, 0) / probs.length, n: probs.length } : null;
}

export function goalMarkets(books: SsBookmakerOdds[]): GoalMarkets {
  const over = twoWay(books, /^goals over\/under$/i, /^over 2\.5$/i, /^under 2\.5$/i);
  const btts = twoWay(books, /^both teams (to )?score$/i, /^yes$/i, /^no$/i);
  return { over25: over?.p ?? null, btts: btts?.p ?? null, books: Math.max(over?.n ?? 0, btts?.n ?? 0) };
}

const REASONS: [RegExp, string][] = [
  [/red card/i, "дисквалификация"],
  [/yellow card/i, "перебор карточек"],
  [/suspen/i, "дисквалификация"],
  [/injur|knock|muscle|knee|ankle|hamstring|groin|back|illness|ill/i, "травма"],
];
export const reasonRu = (r: string | null) => REASONS.find(([re]) => r && re.test(r))?.[1] ?? "не сыграет";

// ------------------------------------------------------------------ fetchers

export async function teamForm(teamId: number, limit = 5): Promise<FormGame[]> {
  const games = await sstats<SsGame[]>("/Games/list", { Team: teamId, Ended: true, Limit: limit, Order: -1 }, 21_600).catch(() => []);
  return toForm(games, teamId);
}

export async function headToHead(a: number, b: number, limit = 5): Promise<H2HGame[]> {
  const games = await sstats<SsGame[]>("/Games/list", { BothTeams: `${a},${b}`, Ended: true, Limit: limit, Order: -1 }, 86_400).catch(() => []);
  return toH2H(games);
}

export async function missingPlayers(gameId: number, homeId: number): Promise<Missing[]> {
  const list = await sstats<SsInjury[]>("/Games/injuries", { gameId }, 3_600).catch(() => []);
  return list
    .filter((i) => i.player?.name)
    .map((i) => ({ team: Number(i.teamId) === homeId ? ("home" as const) : ("away" as const), player: i.player!.name!, reason: reasonRu(i.reason) }));
}
