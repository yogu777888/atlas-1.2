import { pct, type Probs1x2 } from "@/lib/matches";

/** Three-part bar: home / draw / away chances. */
export function ProbBar({ p, compact = false }: { p: Probs1x2; compact?: boolean }) {
  return (
    <div className="min-w-0">
      <div className={`flex overflow-hidden rounded-full bg-surface-2 ${compact ? "h-1.5" : "h-2.5"}`} aria-hidden>
        <span className="bg-accent" style={{ width: pct(p.home, 1) }} />
        <span className="bg-muted/60" style={{ width: pct(p.draw, 1) }} />
        <span className="bg-violet" style={{ width: pct(p.away, 1) }} />
      </div>
      <div className={`mt-1.5 flex justify-between font-mono tabular-nums ${compact ? "text-[11px]" : "text-xs"} text-muted`}>
        <span className="text-accent">{pct(p.home)}</span>
        <span>{pct(p.draw)}</span>
        <span className="text-violet">{pct(p.away)}</span>
      </div>
    </div>
  );
}
