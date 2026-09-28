import { bookmakers } from "../bookmakers";
import { sports, type SportKey } from "../sports";
import { summarize } from "./math";
import { mockEvents } from "./mock";
import type { BookPrices, EventSummary, OddsEvent, OutcomeKey } from "./types";

export type OddsSource = "live" | "demo";

export function oddsSource(): OddsSource {
  return process.env.ODDS_API_KEY ? "live" : "demo";
}

const revalidate = Number(process.env.ODDS_REVALIDATE_SECONDS ?? 600);
const slugByApiKey = new Map(bookmakers.filter((b) => b.oddsApiKey).map((b) => [b.oddsApiKey!, b.slug]));

type ApiEvent = {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: {
    key: string;
    last_update: string;
    markets: { key: string; outcomes: { name: string; price: number }[] }[];
  }[];
};

function fromApi(e: ApiEvent, sport: SportKey): OddsEvent {
  const books: BookPrices[] = [];
  let hasDraw = false;
  for (const bk of e.bookmakers) {
    const slug = slugByApiKey.get(bk.key);
    const market = bk.markets.find((m) => m.key === "h2h");
    if (!slug || !market) continue;
    const prices: BookPrices["prices"] = {};
    for (const o of market.outcomes) {
      const key: OutcomeKey = o.name === e.home_team ? "home" : o.name === e.away_team ? "away" : "draw";
      if (key === "draw") hasDraw = true;
      prices[key] = o.price;
    }
    books.push({ bookmaker: slug, prices, updatedAt: bk.last_update });
  }
  return {
    id: e.id,
    sport,
    league: e.sport_title,
    home: e.home_team,
    away: e.away_team,
    commenceTime: e.commence_time,
    outcomes: hasDraw ? ["home", "draw", "away"] : ["home", "away"],
    books,
  };
}

async function fetchLive(sport: SportKey, apiKey: string): Promise<OddsEvent[]> {
  const def = sports.find((s) => s.key === sport)!;
  // Every bookmaker we list with an oddsApiKey is covered by these two regions; each region costs one credit per request
  const regions = "uk,eu";
  const results = await Promise.all(
    def.oddsApiKeys.map(async (key) => {
      const url = `https://api.the-odds-api.com/v4/sports/${key}/odds?apiKey=${apiKey}&regions=${regions}&markets=h2h&oddsFormat=decimal`;
      const res = await fetch(url, { next: { revalidate, tags: ["odds"] } });
      if (!res.ok) {
        // 404/422 = sport out of season; anything else is worth knowing about
        if (res.status !== 404 && res.status !== 422) console.error(`[odds] ${key} -> HTTP ${res.status}`);
        return [];
      }
      return ((await res.json()) as ApiEvent[]).map((e) => fromApi(e, sport));
    }),
  );
  return results.flat();
}

async function loadEvents(sport?: SportKey): Promise<OddsEvent[]> {
  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) {
    const all = mockEvents();
    return sport ? all.filter((e) => e.sport === sport) : all;
  }
  const keys = sport ? [sport] : sports.map((s) => s.key);
  try {
    return (await Promise.all(keys.map((k) => fetchLive(k, apiKey)))).flat();
  } catch (err) {
    console.error("[odds] live fetch failed, serving demo odds", err);
    const all = mockEvents();
    return sport ? all.filter((e) => e.sport === sport) : all;
  }
}

export async function getEvents(sport?: SportKey): Promise<EventSummary[]> {
  const now = Date.now();
  return (await loadEvents(sport))
    .filter((e) => e.books.length >= 2 && new Date(e.commenceTime).getTime() > now)
    .sort((a, b) => a.commenceTime.localeCompare(b.commenceTime))
    .map(summarize)
    // Drop events where some outcome has no price at all
    .filter((e) => Number.isFinite(e.bestMargin));
}

export async function getEvent(id: string): Promise<EventSummary | null> {
  const events = await getEvents();
  return events.find((e) => e.id === id) ?? null;
}

/** Events where backing the best price on every outcome guarantees profit. */
export async function getSureBets(): Promise<EventSummary[]> {
  return (await getEvents()).filter((e) => e.bestMargin < 0).sort((a, b) => a.bestMargin - b.bestMargin);
}
