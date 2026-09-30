import Link from "next/link";
import { shortDay } from "@/lib/dates";
import type { FormGame, H2HGame, Missing } from "@/lib/forecast";
import { pointsPerGame } from "@/lib/forecast";
import { plural } from "@/lib/matches";
import { FlipText } from "./FlipText";

const RESULT = { W: { t: "В", c: "bg-p5 text-on-strong", name: "победа" }, D: { t: "Н", c: "bg-draw text-on-strong", name: "ничья" }, L: { t: "П", c: "bg-loss text-on-strong", name: "поражение" } } as const;
const short = (iso: string) => (iso ? shortDay(iso).replace(/^[а-я]{2}, /, "") : "");

/** The headline calls: result, goals, both teams to score. */
export function Verdict({ items }: { items: { label: string; value: string; text: string; level?: string }[] }) {
  const cols = ["", "sm:max-w-sm", "sm:grid-cols-2", "sm:grid-cols-3"][items.length] ?? "sm:grid-cols-3";
  return (
    <div className={`grid gap-2.5 ${cols}`}>
      {items.map((it, i) => (
        <div key={it.label} className="card p-4">
          <p className="text-xs font-semibold text-fg-2">{it.label}</p>
          <p className={`num mt-2 inline-block rounded-md px-2 py-0.5 text-[40px] leading-none font-bold ${it.level ?? ""}`}>
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
    <span className="inline-flex gap-[3px] [perspective:300px]" aria-label={`Последние матчи: ${games.map((g) => RESULT[g.result].name).join(", ")}`}>
      {games.map((g, i) => (
        <span key={i} className={`grid size-5 animate-flip place-items-center rounded text-[11px] font-bold ${RESULT[g.result].c}`} style={{ animationDelay: `${400 + i * 80}ms` }} aria-hidden>
          {RESULT[g.result].t}
        </span>
      ))}
    </span>
  );
}

export function FormColumn({ team, games, href }: { team: string; games: FormGame[]; href?: string }) {
  const ppg = pointsPerGame(games);
  return (
    <div className="card min-w-0 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {href ? (
          <Link href={href} className="font-semibold underline decoration-line-strong decoration-2 underline-offset-4 hover:decoration-hi">
            {team}
          </Link>
        ) : (
          <p className="font-semibold">{team}</p>
        )}
        <FormPills games={games} />
      </div>
      {ppg !== null && (
        <p className="mt-1 text-xs text-subtle">
          {ppg.toFixed(1).replace(".", ",")} очка за матч в последних {games.length}
        </p>
      )}
      <ul className="mt-3 divide-y divide-line text-sm">
        {games.map((g, i) => (
          <li key={i} className="flex items-center justify-between gap-3 py-2">
            <span className="min-w-0 truncate text-muted">
              <span className="text-subtle">{short(g.date)}</span> · {g.home ? "дома" : "в гостях"} · <span className="text-fg">{g.opponent}</span>
            </span>
            <span className="num shrink-0 text-base font-semibold">
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
  const losses = games.length - wins - draws;
  return (
    <div className="card p-5">
      <p className="text-sm text-muted">
        {home} в {plural(games.length, ["последней", "последних", "последних"])} {games.length} {plural(games.length, ["встрече", "встречах", "встречах"])}:{" "}
        <b className="text-fg">{wins}</b> {plural(wins, ["победа", "победы", "побед"])}, <b className="text-fg">{draws}</b> {plural(draws, ["ничья", "ничьи", "ничьих"])},{" "}
        <b className="text-fg">{losses}</b> {plural(losses, ["поражение", "поражения", "поражений"])}
      </p>
      <ul className="mt-3 divide-y divide-line text-sm">
        {games.map((g, i) => (
          <li key={i} className="grid grid-cols-[4.5rem_minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 py-2">
            <span className="text-subtle">{short(g.date)}</span>
            <span className="truncate text-right">{g.home}</span>
            <span className="num rounded-md bg-surface-2 px-2 py-0.5 text-base font-semibold ring-1 ring-line">
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
    <div className="card min-w-0 p-5">
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
        <p className="mt-3 text-sm text-subtle">Все в строю</p>
      )}
    </div>
  );
}
