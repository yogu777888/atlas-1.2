import Link from "next/link";
import { whenRu } from "@/lib/dates";
import { isValue, odds, OUTCOMES, type Match } from "@/lib/matches";
import { paths } from "@/lib/routes";
import { TeamMark } from "../TeamMark";
import { ChanceBar } from "./ChanceBar";

/** A headline match: crests and names large, the chance bar, and a yellow tag when a price beats fair. */
export function MatchTile({ m }: { m: Match }) {
  const f = m.fair;
  const value = f && m.pari ? OUTCOMES.find((o) => isValue(m.pari!.odds[o], f[o])) : undefined;
  const max = f ? Math.max(f.home, f.draw, f.away) : 0;
  const call = !f ? "Шансы появятся с открытием линии" : max < 0.4 ? "Равный матч" : f.home === max ? `Фаворит — ${m.home}` : f.away === max ? `Фаворит — ${m.away}` : "Скорее ничья";
  return (
    <Link href={paths.match(m.slug)} data-reveal className="group flex snap-start flex-col gap-4 rounded-2xl bg-surface p-5 ring-1 ring-line transition hover:-translate-y-0.5 hover:ring-line-strong">
      <span className="flex items-center justify-between gap-3 text-xs text-muted">
        <span className="truncate">{m.league.short}</span>
        <span className="num shrink-0 text-sm font-semibold text-fg-2">{whenRu(m.commenceTime)}</span>
      </span>
      <span className="grid gap-2.5">
        {[m.home, m.away].map((t) => (
          <span key={t} className="flex min-w-0 items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center">
              <TeamMark name={t} size={30} />
            </span>
            <span className="truncate font-display text-[17px] leading-tight font-semibold tracking-[-0.01em]">{t}</span>
          </span>
        ))}
      </span>
      <ChanceBar m={m} size="md" labels />
      <span className="mt-auto flex items-center justify-between gap-3 text-sm">
        <span className="truncate font-medium text-fg-2">{call}</span>
        {value && (
          <span className="num shrink-0 rounded-md bg-hi px-2 py-0.5 text-[15px] font-bold" title="Коэффициент выше честной цены">
            {odds(m.pari!.odds[value])}
          </span>
        )}
      </span>
    </Link>
  );
}
