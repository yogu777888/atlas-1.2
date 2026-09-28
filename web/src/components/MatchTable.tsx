import Link from "next/link";
import { edge, odds, OUTCOMES, outcomeShort, type Match } from "@/lib/matches";
import { LocalTime } from "./LocalTime";
import { ProbBar } from "./ProbBar";

export function MatchTable({ matches, empty }: { matches: Match[]; empty?: string }) {
  if (matches.length === 0) {
    return <div className="card p-10 text-center text-sm text-muted">{empty ?? "В ближайшие дни матчей нет."}</div>;
  }
  return (
    <div className="card overflow-hidden">
      <div className="hidden grid-cols-[1fr_12rem_14rem] items-center gap-6 border-b border-line px-5 py-3 font-mono text-[11px] tracking-wider text-subtle uppercase md:grid">
        <span>Матч</span>
        <span>Шансы по рынку</span>
        <span className="text-center">PARI · П1 X П2</span>
      </div>
      <ul className="divide-y divide-line">
        {matches.map((m) => (
          <li key={m.id}>
            <Row m={m} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function Row({ m }: { m: Match }) {
  return (
    <Link href={`/matches/${m.id}`} className="grid grid-cols-1 gap-3 px-5 py-4 transition hover:bg-white/[0.025] md:grid-cols-[1fr_12rem_14rem] md:items-center md:gap-6">
      <div className="min-w-0">
        <div className="mb-1 flex items-center gap-2 text-xs text-subtle">
          <span>{m.league.short}</span>
          <span>·</span>
          <LocalTime iso={m.commenceTime} />
        </div>
        <p className="truncate font-medium">
          {m.home} <span className="text-subtle">—</span> {m.away}
        </p>
      </div>
      <div>{m.fair ? <ProbBar p={m.fair} compact /> : <span className="text-xs text-subtle">нет данных</span>}</div>
      <div className="grid grid-cols-3 gap-1.5">
        {OUTCOMES.map((o) => {
          const price = m.pari?.odds[o];
          const value = price && m.fair ? edge(price, m.fair[o]) : null;
          const good = value !== null && value > 0;
          return (
            <span
              key={o}
              className={`odds-pill min-w-0 ${good ? "odds-pill-best" : ""}`}
              title={value !== null ? `${outcomeShort[o]}: ${value > 0 ? "выше" : "ниже"} справедливой цены на ${Math.abs(value * 100).toFixed(1)}%` : undefined}
            >
              {price ? odds(price) : "—"}
            </span>
          );
        })}
      </div>
    </Link>
  );
}
