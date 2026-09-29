import Link from "next/link";
import type { MatchDetail } from "@/lib/data";
import { whenRu } from "@/lib/dates";
import { isValue, odds, OUTCOMES, outcomeLabel, outcomeShort, pct, probClass, type Match } from "@/lib/matches";
import { paths } from "@/lib/routes";
import { FlipText } from "./FlipText";
import { FormPills } from "./ForecastBlocks";
import { FlipMark } from "./Logo";
import { TeamMark } from "./TeamMark";

/** A match in a card: the three chances as scoreboard tiles, goal markets, form and the way in. */
export function MatchCard({ m, d, kicker = "Матч дня" }: { m: Match; d?: MatchDetail | null; kicker?: string }) {
  const fair = d?.world ?? m.fair;
  const goals = d?.goals;
  const value = fair && m.pari ? OUTCOMES.filter((o) => isValue(m.pari!.odds[o], fair[o])) : [];
  const calls: { k: string; v: React.ReactNode }[] = [];
  if (goals?.over25 != null) {
    calls.push({ k: "Больше 2,5 гола", v: pct(goals.over25) });
  }
  if (goals?.btts != null) calls.push({ k: "Обе забьют", v: pct(goals.btts) });
  for (const o of value) calls.push({ k: `Коэффициент на ${o === "draw" ? "ничью" : outcomeShort[o]}`, v: <span className="hl rounded-[3px] px-1.5">{odds(m.pari!.odds[o])}</span> });

  return (
    <article className="card p-5">
      <span className="kicker">
        <FlipMark className="size-[18px]" />
        {kicker}
      </span>
      <h3 className="mt-2.5 text-[22px] leading-tight font-extrabold tracking-[-0.025em]">
        {m.home} — {m.away}
      </h3>
      <p className="mt-1 text-xs text-muted">
        {m.league.label.replace(" УЕФА", "")} · {whenRu(m.commenceTime)} мск
      </p>
      {fair && (
        <div className="mt-4 grid grid-cols-3 gap-1.5 text-center">
          {OUTCOMES.map((o, i) => (
            <div key={o} className={`rounded-lg px-1 pt-2 pb-1.5 ${probClass(fair[o])}`}>
              <b className="num block text-[38px] leading-none font-bold">
                <FlipText text={String(Math.round(fair[o] * 100))} delay={300 + i * 160} />
              </b>
              <small className="block truncate text-[11px]">{o === "draw" ? "ничья" : outcomeLabel(m, o)}</small>
            </div>
          ))}
        </div>
      )}
      {calls.length > 0 && (
        <ul className="mt-3.5 grid gap-1.5 text-sm">
          {calls.map((c) => (
            <li key={c.k} className="flex justify-between gap-3 border-b border-dashed border-line pb-1.5">
              <span>{c.k}</span>
              <span className="num text-[17px] font-semibold">{c.v}</span>
            </li>
          ))}
        </ul>
      )}
      {d && (d.form.home.length > 0 || d.form.away.length > 0) && (
        <div className="mt-3 space-y-2 text-[13px]">
          {[
            { team: m.home, games: d.form.home },
            { team: m.away, games: d.form.away },
          ].map((f) =>
            f.games.length ? (
              <div key={f.team} className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-1.5">
                  <TeamMark name={f.team} size={14} />
                  <span className="truncate">{f.team}</span>
                </span>
                <FormPills games={f.games} />
              </div>
            ) : null,
          )}
        </div>
      )}
      <Link href={paths.match(m.slug)} className="link-more mt-4">
        Полный прогноз <span aria-hidden>→</span>
      </Link>
    </article>
  );
}
