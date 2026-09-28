import { formatOdds, outcomeLabel } from "@/lib/odds/math";
import type { EventSummary } from "@/lib/odds/types";
import { BookLogo } from "./BookLogo";
import { LogoMark } from "./Logo";

/** A CSS-only iPhone frame previewing the app's Odds tab. */
export function PhoneMockup({ events }: { events: EventSummary[] }) {
  return (
    <div className="relative mx-auto w-[290px]">
      <div className="absolute -inset-10 rounded-full bg-accent/10 blur-3xl" aria-hidden />
      <div className="relative rounded-[3rem] border border-line-strong bg-black p-3 shadow-2xl shadow-black">
        <div className="relative h-[590px] overflow-hidden rounded-[2.3rem] bg-bg">
          <div className="absolute top-2.5 left-1/2 z-10 h-7 w-24 -translate-x-1/2 rounded-full bg-black" />
          <div className="flex items-center justify-between px-7 pt-4 text-[11px] font-semibold">
            <span>9:41</span>
            <span className="tracking-tighter">●●● ▮</span>
          </div>
          <div className="px-5 pt-8">
            <div className="flex items-center gap-2">
              <LogoMark className="size-6" />
              <span className="text-2xl font-bold tracking-tight">Odds</span>
            </div>
            <div className="mt-4 flex gap-1.5 text-[11px]">
              {["All", "⚽", "🏀", "🎾", "🥊"].map((t, i) => (
                <span key={t} className={`rounded-full px-2.5 py-1 ${i === 0 ? "bg-fg text-bg" : "bg-surface-2 text-muted"}`}>
                  {t}
                </span>
              ))}
            </div>
            <ul className="mt-4 space-y-2.5">
              {events.slice(0, 5).map((e) => (
                <li key={e.id} className="rounded-2xl border border-line bg-surface p-3">
                  <p className="text-[10px] text-subtle">{e.league}</p>
                  <p className="truncate text-[13px] font-medium">
                    {e.home} – {e.away}
                  </p>
                  <div className={`mt-2 grid gap-1.5 ${e.best.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
                    {e.best.map((b) => (
                      <span key={b.outcome} className="flex items-center justify-between rounded-lg bg-accent/10 px-2 py-1 font-mono text-[11px] text-accent">
                        <span className="max-w-10 truncate text-[9px] text-accent/60">{outcomeLabel(e, b.outcome).split(" ")[0]}</span>
                        {formatOdds(b.price)}
                        <BookLogo slug={b.bookmaker} size="sm" />
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex justify-around border-t border-line bg-bg/90 px-6 pt-2.5 pb-6 text-[10px] text-subtle backdrop-blur">
            <span className="text-accent">Odds</span>
            <span>Bonuses</span>
            <span>Books</span>
            <span>Alerts</span>
          </div>
        </div>
      </div>
    </div>
  );
}
