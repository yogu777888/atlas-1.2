import type { SportKey } from "../sports";
import { summarize } from "./math";
import { mockEvents } from "./mock";
import type { EventSummary, OddsEvent } from "./types";

export type OddsSource = "live" | "demo";

/**
 * Odds come from demo data until the live feed for Russian bookmakers is
 * connected (planned: sstats.net). Swap `loadEvents` for the live loader then;
 * the rest of the site only depends on `OddsEvent`.
 */
export function oddsSource(): OddsSource {
  return "demo";
}

async function loadEvents(sport?: SportKey): Promise<OddsEvent[]> {
  const all = mockEvents();
  return sport ? all.filter((e) => e.sport === sport) : all;
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
