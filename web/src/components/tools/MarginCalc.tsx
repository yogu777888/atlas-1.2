"use client";

import { useState } from "react";
import { num, ru } from "@/lib/tools";

const LABELS3 = ["П1", "Ничья", "П2"];
const LABELS2 = ["Исход 1", "Исход 2"];

export function MarginCalc() {
  const [three, setThree] = useState(true);
  const [vals, setVals] = useState(["1.90", "3.60", "4.20"]);
  const labels = three ? LABELS3 : LABELS2;
  const used = vals.slice(0, labels.length);
  const prices = used.map(num);
  const ok = prices.every((x): x is number => x !== null && x > 1);
  const implied = ok ? (prices as number[]).map((k) => 1 / k) : [];
  const sum = implied.reduce((s, x) => s + x, 0);
  const margin = ok ? sum - 1 : null;

  return (
    <div className="space-y-6">
      <div className="inline-flex rounded-full border border-line p-1 text-sm" role="group" aria-label="Число исходов">
        {[true, false].map((t) => (
          <button
            key={String(t)}
            type="button"
            onClick={() => {
              setThree(t);
              setVals(t ? ["1.90", "3.60", "4.20"] : ["1.85", "1.95", ""]);
            }}
            aria-pressed={three === t}
            className={`rounded-full px-4 py-1.5 transition ${three === t ? "bg-fg text-bg" : "text-muted hover:text-fg"}`}
          >
            {t ? "3 исхода (1X2)" : "2 исхода"}
          </button>
        ))}
      </div>

      <div className={`grid gap-3 ${three ? "grid-cols-3" : "grid-cols-2"}`}>
        {labels.map((l, i) => (
          <label key={l} className="min-w-0 space-y-1.5">
            <span className="text-xs text-subtle">{l}</span>
            <input
              id={`margin-${i}`}
              className="field"
              inputMode="decimal"
              value={vals[i]}
              onChange={(e) => setVals((v) => v.map((x, j) => (j === i ? e.target.value : x)))}
            />
          </label>
        ))}
      </div>

      <div className="rounded-2xl border border-line bg-surface-2 p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs text-subtle">Маржа букмекера</p>
            <p className={`text-5xl font-extrabold tracking-[-0.04em] tabular-nums ${margin !== null && margin <= 0.05 ? "text-accent" : ""}`}>
              {margin !== null ? `${ru(margin * 100, 1)}%` : "—"}
            </p>
          </div>
          <p className="max-w-[16rem] text-sm text-muted">
            {margin === null
              ? "Введите коэффициенты больше 1."
              : margin <= 0
                ? "Сумма вероятностей меньше 100% — похоже на коэффициенты разных букмекеров."
                : margin <= 0.05
                  ? "Низкая маржа — хорошая линия."
                  : margin <= 0.08
                    ? "Средняя маржа."
                    : "Высокая маржа: вы переплачиваете."}
          </p>
        </div>
        {ok && margin !== null && margin > 0 && (
          <div className={`mt-6 grid gap-2 border-t border-line pt-5 ${three ? "grid-cols-3" : "grid-cols-2"}`}>
            {labels.map((l, i) => {
              const fair = implied[i] / sum;
              return (
                <div key={l} className="min-w-0">
                  <p className="truncate text-xs text-subtle">{l}: честно</p>
                  <p className="text-lg font-semibold tabular-nums">{ru(fair * 100, 1)}%</p>
                  <p className="text-xs text-muted tabular-nums">кэф {ru(1 / fair)}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
