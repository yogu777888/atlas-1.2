import { scorerLine } from "@/lib/compare";
import type { Missing } from "@/lib/forecast";
import { plural } from "@/lib/matches";
import type { PlayerRow } from "@/lib/stats";
import { TeamMark } from "./TeamMark";

type Side = { team: string; players: PlayerRow[]; games: number; missing?: Missing[] };

const out = (p: PlayerRow, missing?: Missing[]) =>
  missing?.find((m) => (m.id !== undefined && m.id === p.id) || m.player.toLowerCase() === p.name.toLowerCase());

/**
 * Who scores for each team: goals as a bar against the best scorer on either
 * side, then goals per 90 minutes, shots and assists. A player on the
 * injury list is marked, since the bet "player to score" needs him on the pitch.
 */
export function Scorers({ sides }: { sides: [Side, Side] }) {
  const max = Math.max(1, ...sides.flatMap((s) => s.players.map((p) => p.goals)));
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {sides.map((s) => (
        <article key={s.team} className="card p-5" data-reveal>
          <h3 className="flex items-center gap-2 font-bold">
            <TeamMark name={s.team} size={18} />
            {s.team}
            <span className="ml-auto text-xs font-normal text-subtle">
              {s.games} {plural(s.games, ["матч", "матча", "матчей"])}
            </span>
          </h3>
          {s.players.length ? (
            <ol className="mt-3 space-y-3.5">
              {s.players.map((p, i) => {
                const miss = out(p, s.missing);
                return (
                  <li key={p.id}>
                    <div className="flex items-baseline gap-2">
                      <span className="min-w-0 truncate font-semibold">{p.name}</span>
                      {miss && <span className="shrink-0 rounded bg-loss/10 px-1.5 py-0.5 text-[11px] font-semibold text-loss">{miss.reason}</span>}
                      <span className="num ml-auto shrink-0 text-2xl leading-none font-bold">{p.goals}</span>
                    </div>
                    <span className="mt-1.5 block h-2 overflow-hidden rounded-full bg-surface-2" aria-hidden>
                      <span className={`grow-x block h-full rounded-full ${i === 0 ? "bg-fg" : "bg-line-strong"}`} style={{ width: `${Math.max(3, (p.goals / max) * 100)}%`, animationDelay: `${i * 80}ms` }} />
                    </span>
                    <p className="mt-1 text-xs text-muted">
                      {scorerLine(p)}
                      {p.recent > 0 && (
                        <>
                          {" "}
                          · <span className="font-semibold text-fg-2">{p.recent} в последних 5</span>
                        </>
                      )}
                      {p.pens > 0 && <> · {p.pens} с пенальти</>}
                    </p>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="mt-3 text-sm text-subtle">Голов в этих матчах нет.</p>
          )}
        </article>
      ))}
    </div>
  );
}
