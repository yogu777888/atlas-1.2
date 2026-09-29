import Link from "next/link";
import { shortDay } from "@/lib/dates";
import { fairFromOdds, matchSlug, UPSET, winner, winnerOf } from "@/lib/matches";
import { paths } from "@/lib/routes";
import { resultOf } from "@/lib/season";
import type { SsGame } from "@/lib/sstats/types";
import { teamRu } from "@/lib/teams";

/**
 * Recent results with the chance the market gave to what actually happened,
 * so upsets stand out and every score links to its forecast page.
 */
export function Results({ games, limit = 8 }: { games: SsGame[]; limit?: number }) {
  const list = games
    .filter((g) => resultOf(g))
    .sort((a, b) => (b.dateUtc ?? 0) - (a.dateUtc ?? 0))
    .slice(0, limit);
  if (!list.length) return null;
  return (
    <ul className="card divide-y divide-line">
      {list.map((g) => {
        const s = resultOf(g)!;
        const home = teamRu(g.homeTeam.name), away = teamRu(g.awayTeam.name);
        const k = winner(g.odds);
        const won = winnerOf(s);
        const chance = k ? fairFromOdds(k)[won] : null;
        const iso = new Date((g.dateUtc ?? 0) * 1000).toISOString();
        return (
          <li key={g.id}>
            <Link href={paths.match(matchSlug(home, away, g.id))} className="group grid grid-cols-[4rem_minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5 transition-colors hover:bg-surface-2">
              <span className="text-xs text-subtle">{shortDay(iso).replace(/^[а-я]{2}, /, "")}</span>
              <span className="min-w-0">
                <b className="block truncate font-semibold">
                  {home} — {away}
                </b>
                {chance !== null && (
                  <small className="block truncate text-xs text-muted">
                    {won === "draw" ? "ничья" : `победа: ${won === "home" ? home : away}`}, рынок давал {Math.round(chance * 100)}%
                    {chance < UPSET && <span className="ml-1.5 rounded bg-hi px-1 font-semibold text-fg">сенсация</span>}
                  </small>
                )}
              </span>
              <span className="num rounded-md bg-surface-2 px-2 py-0.5 text-lg font-bold ring-1 ring-line">
                {s.home}:{s.away}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
