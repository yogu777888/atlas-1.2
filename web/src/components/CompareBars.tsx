import { sideOf, type CompareRow } from "@/lib/compare";
import { TeamMark } from "./TeamMark";

/**
 * Two teams side by side, one figure per row: bars grow from the middle out,
 * the better side's bar is ink, the other grey. Like a spec comparison of two
 * laptops, but for a match.
 */
export function CompareBars({ left, right, rows, marks = true }: { left: string; right: string; rows: CompareRow[]; marks?: boolean }) {
  const shown = rows.filter((r) => r.l !== null || r.r !== null);
  return (
    <div className="card overflow-hidden" data-reveal>
      <div className="grid grid-cols-2 items-center gap-3 border-b border-line bg-surface-2 px-4 py-3 text-sm font-bold sm:grid-cols-[minmax(0,1fr)_10rem_minmax(0,1fr)] sm:px-5">
        <span className="flex min-w-0 items-center gap-2">
          {marks && <TeamMark name={left} size={18} />}
          <span className="truncate">{left}</span>
        </span>
        <span className="hidden sm:block" aria-hidden />
        <span className="flex min-w-0 items-center justify-end gap-2">
          <span className="truncate">{right}</span>
          {marks && <TeamMark name={right} size={18} />}
        </span>
      </div>
      <dl className="divide-y divide-row">
        {shown.map((row, i) => {
          const s = sideOf(row);
          const max = Math.max(row.l ?? 0, row.r ?? 0) || 1;
          const w = (x: number | null) => (x === null ? 0 : Math.max(4, (x / max) * 100));
          const tone = (me: -1 | 1) => (row.neutral ? "bg-muted" : s === me ? "bg-fg" : s === 0 ? "bg-muted" : "bg-line-strong");
          const val = (x: number | null, me: -1 | 1) => (
            <span className={`num shrink-0 text-lg leading-none ${s === me ? "font-bold text-fg" : "font-medium text-muted"}`}>{x === null ? "—" : row.fmt(x)}</span>
          );
          const delay = { animationDelay: `${i * 60}ms` };
          return (
            <div key={row.label} className="grid grid-cols-2 items-center gap-x-3 gap-y-1.5 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_10rem_minmax(0,1fr)] sm:px-5">
              <dt className="col-span-2 text-center text-xs text-muted sm:order-2 sm:col-span-1">
                <span className="font-semibold text-fg-2">{row.label}</span>
                {row.hint && <span className="block text-[11px] text-subtle">{row.hint}</span>}
              </dt>
              <dd className="flex items-center gap-2.5 sm:order-1">
                {val(row.l, -1)}
                <span className="flex h-2.5 flex-1 justify-end overflow-hidden rounded-full bg-surface-2" aria-hidden>
                  <span className={`grow-x h-full rounded-full ${tone(-1)}`} style={{ width: `${w(row.l)}%`, transformOrigin: "right", ...delay }} />
                </span>
              </dd>
              <dd className="flex items-center gap-2.5 sm:order-3">
                <span className="flex h-2.5 flex-1 overflow-hidden rounded-full bg-surface-2" aria-hidden>
                  <span className={`grow-x h-full rounded-full ${tone(1)}`} style={{ width: `${w(row.r)}%`, ...delay }} />
                </span>
                {val(row.r, 1)}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
