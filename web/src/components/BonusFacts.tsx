import type { Bonus } from "@/lib/bookmakers";

const FACTS: { key: "amount" | "wager" | "minOdds" | "expires"; label: string }[] = [
  { key: "amount", label: "Сумма" },
  { key: "wager", label: "Отыгрыш" },
  { key: "minOdds", label: "Мин. коэф." },
  { key: "expires", label: "Срок" },
];

/** The four terms that decide whether a bonus is worth it, as tiles. */
export function BonusFacts({ bonus }: { bonus: Bonus }) {
  // Nothing verified yet: one quiet line instead of four empty tiles.
  if (FACTS.every((f) => !bonus[f.key])) {
    return (
      <p className="flex items-center gap-2 rounded-lg border border-dashed border-line-strong px-3 py-2.5 text-xs text-subtle">
        <span className="size-1.5 shrink-0 rounded-full bg-muted/60" aria-hidden />
        Сумму, отыгрыш, мин. коэффициент и срок сверяем с букмекером
      </p>
    );
  }
  return (
    <dl className="grid grid-cols-2 gap-1.5">
      {FACTS.map((f) => {
        const v = bonus[f.key];
        return (
          <div key={f.key} className="min-w-0 rounded-lg border border-line bg-surface-2 px-3 py-2">
            <dt className="text-[11px] text-subtle">{f.label}</dt>
            <dd className={`truncate text-sm tabular-nums ${v ? "font-semibold text-fg" : "text-subtle"}`}>{v ?? "уточняется"}</dd>
          </div>
        );
      })}
    </dl>
  );
}
