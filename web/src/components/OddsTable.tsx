import Link from "next/link";
import { getSport } from "@/lib/sports";
import { formatOdds, formatPct, shortLabel } from "@/lib/odds/math";
import type { EventSummary } from "@/lib/odds/types";
import { BookLogo } from "./BookLogo";
import { LocalTime } from "./LocalTime";

export function OddsTable({ events, empty }: { events: EventSummary[]; empty?: string }) {
  if (events.length === 0) {
    return <div className="card p-10 text-center text-sm text-muted">{empty ?? "Сейчас нет ближайших матчей."}</div>;
  }
  return (
    <div className="card overflow-hidden">
      <div className="hidden grid-cols-[1fr_repeat(3,5.5rem)_5rem] items-center gap-3 border-b border-line px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-subtle md:grid">
        <span>Событие</span>
        <span className="text-center">П1</span>
        <span className="text-center">X</span>
        <span className="text-center">П2</span>
        <span className="text-right">Маржа</span>
      </div>
      <ul className="divide-y divide-line">
        {events.map((e) => (
          <li key={e.id}>
            <EventRow event={e} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function EventRow({ event: e }: { event: EventSummary }) {
  const sport = getSport(e.sport);
  const sure = e.bestMargin < 0;
  const cells = (["home", "draw", "away"] as const).map((o) => e.best.find((b) => b.outcome === o));
  return (
    <Link
      href={`/odds/${e.id}`}
      className="group grid grid-cols-1 gap-3 px-5 py-4 transition hover:bg-white/[0.025] md:grid-cols-[1fr_repeat(3,5.5rem)_5rem] md:items-center"
    >
      <div className="min-w-0">
        <div className="mb-1 flex items-center gap-2 text-xs text-subtle">
          <span aria-hidden>{sport?.emoji}</span>
          <span className="truncate">{e.league}</span>
          <span>·</span>
          <LocalTime iso={e.commenceTime} />
          {sure && <span className="rounded-full bg-accent px-1.5 py-px font-mono text-[10px] font-semibold text-accent-ink">ВИЛКА</span>}
        </div>
        <p className="truncate font-medium">
          {e.home} <span className="text-subtle">—</span> {e.away}
        </p>
      </div>
      <div className={`grid gap-2 md:contents ${e.outcomes.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
        {cells.map((best, i) =>
          best ? (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="odds-pill odds-pill-best w-full md:w-auto">
                <span className="mr-1.5 text-[10px] text-accent/60 md:hidden">{shortLabel[best.outcome]}</span>
                {formatOdds(best.price)}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-subtle">
                <BookLogo slug={best.bookmaker} size="sm" />
              </span>
            </div>
          ) : (
            <span key={i} className="hidden text-center text-subtle md:block">
              —
            </span>
          ),
        )}
      </div>
      <div className={`hidden text-right font-mono text-sm tabular-nums md:block ${sure ? "text-accent" : "text-muted"}`}>
        {formatPct(e.bestMargin)}
      </div>
    </Link>
  );
}
