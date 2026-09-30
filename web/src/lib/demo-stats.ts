/**
 * Demo team and player numbers for a demo game, consistent with its score and
 * expected goals. Player names are made up; pages mark demo data as such.
 */
import type { SsGame } from "./sstats/types";
import type { GameStats, PlayerLine, TeamLine } from "./stats";
import { teamRu } from "./teams";

const RU = ["Смирнов", "Кузнецов", "Попов", "Васильев", "Петров", "Соколов", "Михайлов", "Новиков", "Фёдоров", "Морозов", "Волков", "Алексеев", "Лебедев", "Семёнов", "Егоров", "Павлов", "Козлов", "Степанов", "Николаев", "Орлов", "Андреев", "Макаров", "Никитин", "Захаров"];
const INT = ["Silva", "Müller", "Rossi", "García", "Martin", "Jansen", "Novak", "Costa", "Moreau", "Bianchi", "Fischer", "López", "Dubois", "Santos", "Weber", "Ricci", "Pereira", "Lambert", "Romero", "Schulz", "Conti", "Girard", "Ortega", "Hansen"];
const INITIALS = "АБВГДЕИКЛМНОПРСТ";
const INITIALS_LAT = "ABCDEFGHJKLMNOPRST";

// Starting eleven: keeper, four defenders, three midfielders, three forwards; then three subs
const ROLE = ["G", "D", "D", "D", "D", "M", "M", "M", "F", "F", "F", "M", "F", "D"] as const;
const SCORE_W = { G: 0, D: 0.6, M: 2.2, F: 5 };
const ASSIST_W = { G: 0.05, D: 1, M: 3.5, F: 2 };

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function squad(teamId: number, ru: boolean) {
  const pool = ru ? RU : INT;
  const ini = ru ? INITIALS : INITIALS_LAT;
  return ROLE.map((role, k) => {
    return { id: teamId * 100 + k, role, name: `${ini[(teamId + k * 5) % ini.length]}. ${pool[(teamId * 7 + k) % pool.length]}` };
  });
}

function pick<T>(items: T[], weight: (x: T) => number, r: () => number): T {
  const total = items.reduce((s, x) => s + weight(x), 0);
  let u = r() * total;
  for (const x of items) {
    u -= weight(x);
    if (u <= 0) return x;
  }
  return items[items.length - 1];
}

/** Stats for a finished demo game; `xg` is the model's expected goals for it. */
export function demoGameStats(g: SsGame & { xg: [number, number] }, ru: boolean): GameStats | null {
  const hg = Number(g.homeResult), ag = Number(g.awayResult);
  if (g.homeResult === null || g.homeResult === undefined || Number.isNaN(hg) || Number.isNaN(ag)) return null;
  const r = rng(g.id);
  const goals = [hg, ag];
  const ids = [Number(g.homeTeam.id), Number(g.awayTeam.id)];
  const pos = Math.round(50 + (g.xg[0] - g.xg[1]) * 9 + (r() - 0.5) * 8);

  const teams = [0, 1].map((i): TeamLine => {
    const xg = +(g.xg[i] * (0.7 + r() * 0.6)).toFixed(2);
    const shots = Math.max(goals[i] + 2, Math.round(xg * 4.5 + 5 + r() * 4));
    return {
      goals: goals[i],
      xg,
      shots,
      sot: Math.max(goals[i], Math.round(shots * (0.28 + r() * 0.14))),
      corners: Math.round(2 + xg * 2.5 + r() * 4),
      poss: i === 0 ? pos : 100 - pos,
      yellow: Math.round(r() * 3.6),
      big: Math.max(goals[i], Math.round(xg * 1.6 + r())),
    };
  }) as [TeamLine, TeamLine];

  const players: PlayerLine[] = [];
  for (const side of [0, 1] as const) {
    const sq = squad(ids[side], ru);
    // Two starters come off; the subs play the rest of the game
    const off = [8 + Math.floor(r() * 3), 5 + Math.floor(r() * 3)];
    const lines = sq.slice(0, 11).map((p, k) => ({ p, min: off.includes(k) ? 60 + Math.floor(r() * 25) : 90 }));
    lines.push({ p: sq[11], min: 90 - lines[off[0]].min }, { p: sq[12], min: 90 - lines[off[1]].min });
    const onPitch = lines.filter((l) => l.min > 0);
    const stat = new Map(onPitch.map((l) => [l.p.id, { goals: 0, assists: 0, shots: 0, sot: 0 }]));
    for (let k = 0; k < goals[side]; k++) {
      const scorer = pick(onPitch, (l) => SCORE_W[l.p.role] * l.min, r);
      stat.get(scorer.p.id)!.goals++;
      if (r() < 0.75) {
        const helper = pick(onPitch.filter((l) => l !== scorer), (l) => ASSIST_W[l.p.role] * l.min, r);
        stat.get(helper.p.id)!.assists++;
      }
    }
    for (let k = 0; k < teams[side].shots!; k++) {
      const s = stat.get(pick(onPitch, (l) => (SCORE_W[l.p.role] + 0.3) * l.min, r).p.id)!;
      s.shots++;
    }
    for (const l of onPitch) {
      const s = stat.get(l.p.id)!;
      s.shots = Math.max(s.shots, s.goals);
      s.sot = Math.max(s.goals, Math.round(s.shots * 0.4));
      players.push({
        id: l.p.id,
        name: l.p.name,
        side,
        min: l.min,
        goals: s.goals,
        assists: s.assists,
        shots: s.shots,
        sot: s.sot,
        keyPasses: Math.round(r() * (l.p.role === "M" ? 3 : 1.5)),
        yellow: r() < 0.1 ? 1 : 0,
        red: 0,
        pens: 0,
        rating: +(6.2 + r() * 1.2 + s.goals * 0.8 + s.assists * 0.4).toFixed(1),
      });
    }
  }

  return {
    id: g.id,
    t: Number(g.dateUtc ?? 0),
    home: { id: ids[0], name: teamRu(g.homeTeam.name) },
    away: { id: ids[1], name: teamRu(g.awayTeam.name) },
    teams,
    players,
  };
}
