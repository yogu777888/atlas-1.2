import { syncStats } from "@/lib/stats-store";

/**
 * Background fill of game stats for the club leagues. Call it from cron every
 * few minutes with the token from STATS_SYNC_TOKEN, e.g.
 *   curl -s "https://tag.bet/api/stats/sync?token=…"
 * Each call works for up to 50 seconds within the request budget; once every
 * game is stored, a call costs a handful of cached list requests.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  const token = process.env.STATS_SYNC_TOKEN;
  if (!token || new URL(req.url).searchParams.get("token") !== token) return new Response("Not found", { status: 404 });
  const started = Date.now();
  const leagues = await syncStats(50_000);
  return Response.json({ ms: Date.now() - started, leagues });
}
