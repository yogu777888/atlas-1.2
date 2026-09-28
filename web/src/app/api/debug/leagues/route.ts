import { NextResponse } from "next/server";
import { upcomingGames } from "@/lib/data";
import { classifyLeague } from "@/lib/leagues";

/** Development helper: which leagues sstats returns for the next days, and which ones tag.bet recognises. */
export async function GET() {
  if (process.env.NODE_ENV === "production") return NextResponse.json({ error: "not available" }, { status: 404 });
  const d = (n: number) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Moscow" }).format(new Date(Date.now() + n * 86_400_000));
  const games = await upcomingGames(d(0), d(3));
  const counts = new Map<string, { id: number; country: string; name: string; games: number; ours: string | null }>();
  for (const g of games) {
    const l = g.season?.league;
    if (!l) continue;
    const key = String(l.id);
    const row = counts.get(key) ?? { id: l.id, country: `${l.country?.name ?? "?"} (${l.country?.code ?? "?"})`, name: l.name, games: 0, ours: classifyLeague(l)?.short ?? null };
    row.games++;
    counts.set(key, row);
  }
  const rows = [...counts.values()].sort((a, b) => Number(!!b.ours) - Number(!!a.ours) || b.games - a.games);
  const find = (re: RegExp) => rows.filter((r) => re.test(r.country) || re.test(r.name));
  return NextResponse.json({
    totalGames: games.length,
    recognised: rows.filter((r) => r.ours),
    candidates: find(/russia|england|spain|italy|germany|france|champions|europa/i).slice(0, 60),
  });
}
