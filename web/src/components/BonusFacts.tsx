import type { Bonus } from "@/lib/bookmakers";

const FACTS: { key: "amount" | "wager" | "minOdds" | "expires"; label: string }[] = [
  { key: "amount", label: "Сумма" },
  { key: "wager", label: "Отыгрыш" },
  { key: "minOdds", label: "Мин. коэф." },
  { key: "expires", label: "Срок" },
];

/** The four terms that decide whether a bonus is worth it, as tiles. */
export function BonusFacts({ bonus }: { bonus: Bonus }) {
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
