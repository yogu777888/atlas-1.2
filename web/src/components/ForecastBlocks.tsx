import type { FormGame, H2HGame, Missing } from "@/lib/forecast";
import { pointsPerGame } from "@/lib/forecast";
import { plural } from "@/lib/matches";
import { FlipText } from "./FlipText";

const RESULT = { W: { t: "В", c: "bg-pitch/80 text-bg" }, D: { t: "Н", c: "bg-muted/40 text-fg" }, L: { t: "П", c: "bg-danger/70 text-bg" } } as const;
const short = (iso: string) => (iso ? new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short", timeZone: "Europe/Moscow" }) : "");

/** Three verdict tiles: result, goals, both teams to score. */
export function Verdict({ items }: { items: { label: string; value: string; text: string }[] }) {
  const cols = ["", "sm:max-w-sm", "sm:grid-cols-2", "sm:grid-cols-3"][items.length] ?? "sm:grid-cols-3";
  return (
    <div className={`grid gap-3 ${cols}`}>
      {items.map((it, i) => (
        <div key={it.label} className="rounded-2xl border border-line bg-surface p-5">
          <p className="text-xs text-subtle">{it.label}</p>
          <p className="mt-2 text-4xl font-extrabold tracking-[-0.04em] tabular-nums">
            <FlipText text={it.value} delay={150 + i * 200} />
          </p>
          <p className="mt-2 text-sm leading-snug text-muted">{it.text}</p>
        </div>
      ))}
    </div>
  );
}

export function FormPills({ games }: { games: FormGame[] }) {
  return (
    <span className="inline-flex gap-1" aria-label={`Последние матчи: ${games.map((g) => RESULT[g.result].t).join(", ")}`}>
      {games.map((g, i) => (
        <span key={i} className={`grid size-6 animate-flip place-items-center rounded-md text-xs font-bold ${RESULT[g.result].c}`} style={{ animationDelay: `${300 + i * 90}ms` }} aria-hidden>
          {RESULT[g.result].t}
        </span>
      ))}
    </span>
  );
}

export function FormColumn({ team, games }: { team: string; games: FormGame[] }) {
  const ppg = pointsPerGame(games);
  return (
    <div className="min-w-0 rounded-2xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-semibold">{team}</p>
        <FormPills games={games} />
      </div>
      {ppg !== null && <p className="mt-1 text-xs text-subtle tabular-nums">{ppg.toFixed(1).replace(".", ",")} очка за матч в последних {games.length}</p>}
      <ul className="mt-4 divide-y divide-line text-sm">
        {games.map((g, i) => (
          <li key={i} className="flex items-center justify-between gap-3 py-2">
            <span className="min-w-0 truncate text-muted">
              <span className="text-subtle tabular-nums">{short(g.date)}</span> · {g.home ? "дома" : "в гостях"} · {g.opponent}
            </span>
            <span className="shrink-0 font-semibold tabular-nums">
              {g.gf}:{g.ga}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HeadToHead({ games, home }: { games: H2HGame[]; home: string }) {
  const wins = games.filter((g) => (g.home === home ? g.hg > g.ag : g.ag > g.hg)).length;
  const draws = games.filter((g) => g.hg === g.ag).length;
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <p className="text-sm text-muted">
        {home} в последних {games.length} {plural(games.length, ["встрече", "встречах", "встречах"])}: <b className="text-fg tabular-nums">{wins}</b>{" "}
        {plural(wins, ["победа", "победы", "побед"])}, <b className="text-fg tabular-nums">{draws}</b> {plural(draws, ["ничья", "ничьи", "ничьих"])},{" "}
        <b className="text-fg tabular-nums">{games.length - wins - draws}</b> {plural(games.length - wins - draws, ["поражение", "поражения", "поражений"])}
      </p>
      <ul className="mt-3 divide-y divide-line text-sm">
        {games.map((g, i) => (
          <li key={i} className="grid grid-cols-[4.5rem_minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 py-2">
            <span className="text-subtle tabular-nums">{short(g.date)}</span>
            <span className="truncate text-right">{g.home}</span>
            <span className="rounded-md bg-surface-2 px-2 py-0.5 font-semibold tabular-nums">
              {g.hg}:{g.ag}
            </span>
            <span className="truncate">{g.away}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MissingList({ team, list }: { team: string; list: Missing[] }) {
  return (
    <div className="min-w-0 rounded-2xl border border-line bg-surface p-5">
      <p className="font-semibold">{team}</p>
      {list.length ? (
        <ul className="mt-3 space-y-1.5 text-sm">
          {list.map((p) => (
            <li key={p.player} className="flex justify-between gap-3">
              <span className="truncate">{p.player}</span>
              <span className="shrink-0 text-subtle">{p.reason}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-subtle">Потерь нет</p>
      )}
    </div>
  );
}
