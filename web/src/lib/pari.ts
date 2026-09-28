import { sstats, sstatsPage } from "./sstats/client";
import type { PariMarket, PariMatch } from "./sstats/types";
import type { Odds1x2 } from "./matches";

type OutcomeIds = { home: number; draw: number; away: number };

const HOME = /^(п1|1|w1|home|победа 1|1 \(основное время\))$/i;
const DRAW = /^(x|х|draw|ничья)$/i;
const AWAY = /^(п2|2|w2|away|победа 2)$/i;

/**
 * PARI returns odds as bare outcome ids; the market dictionary tells us which
 * ids are the full-time match result (П1 / X / П2).
 */
export async function pariResultOutcomeIds(): Promise<OutcomeIds | null> {
  const markets = await sstats<PariMarket[]>("/Pari/odds/market-types", {}, 86_400);
  for (const m of markets) {
    if (m.hasParameter) continue;
    const full = m.outcomes.filter((o) => o.period === "FullTime" && o.parameter === null);
    const home = full.find((o) => HOME.test(o.name.trim()));
    const draw = full.find((o) => DRAW.test(o.name.trim()));
    const away = full.find((o) => AWAY.test(o.name.trim()));
    if (home && draw && away && full.length === 3) return { home: home.id, draw: draw.id, away: away.id };
  }
  console.error("[pari] match result market not found in /Pari/odds/market-types — see /api/debug/pari-markets");
  return null;
}

export type PariLine = { start: number; home: string; away: string; odds: Odds1x2 | null; url: string | null; updatedAt: string | null };

/** Upcoming PARI football matches with their match-result odds. */
export async function pariLines(dateFrom: string, dateTo: string): Promise<PariLine[]> {
  const ids = await pariResultOutcomeIds();
  const out: PariLine[] = [];
  const limit = 200;
  for (let offset = 0; offset < 1000; offset += limit) {
    const page = await sstatsPage<PariMatch>(
      "/Pari/matches",
      { dateFrom, dateTo, upcoming: true, includeOdds: true, limit, offset, timezone: 3 },
      300,
    );
    for (const m of page.data) {
      const byId = new Map((m.currentOdds ?? []).filter((o) => !o.isBlocked && !o.isDeleted).map((o) => [o.id, o.value]));
      const h = ids && byId.get(ids.home);
      const d = ids && byId.get(ids.draw);
      const a = ids && byId.get(ids.away);
      out.push({
        start: Date.parse(m.matchInfo.startDate),
        home: m.matchInfo.homeTeam.name,
        away: m.matchInfo.awayTeam.name,
        odds: h && d && a ? { home: h, draw: d, away: a } : null,
        url: m.matchInfo.url,
        updatedAt: m.matchInfo.lastUpdate,
      });
    }
    if (offset + limit >= page.total || page.data.length < limit) break;
  }
  return out;
}

// ---- matching PARI events to sstats games (names differ: "Olimpia" vs "Olimpia Asuncion")

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\b(fc|fk|cf|sc|ac|afc|club|de|the)\b/g, " ")
    .replace(/[^a-zа-я0-9 ]+/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);

/** Share of the shorter name's words found (by prefix) in the other name. */
export function nameSimilarity(a: string, b: string): number {
  const ta = norm(a), tb = norm(b);
  if (!ta.length || !tb.length) return 0;
  const [short, long] = ta.length <= tb.length ? [ta, tb] : [tb, ta];
  const hits = short.filter((w) => long.some((v) => v.startsWith(w.slice(0, 4)) || w.startsWith(v.slice(0, 4)))).length;
  return hits / short.length;
}

export function findPariLine(lines: PariLine[], start: number, home: string, away: string): PariLine | undefined {
  let best: PariLine | undefined, bestScore = 0;
  for (const l of lines) {
    if (Math.abs(l.start - start) > 15 * 60_000) continue;
    const score = nameSimilarity(l.home, home) + nameSimilarity(l.away, away);
    if (score > bestScore) { best = l; bestScore = score; }
  }
  return bestScore >= 1 ? best : undefined;
}
