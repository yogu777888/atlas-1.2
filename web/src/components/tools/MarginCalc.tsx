"use client";

import { useState } from "react";
import { num, ru } from "@/lib/tools";

const LABELS3 = ["Победа хозяев", "Ничья", "Победа гостей"];
const LABELS2 = ["Исход 1", "Исход 2"];

export function MarginCalc() {
  const [three, setThree] = useState(true);
  const [vals, setVals] = useState(["1.90", "3.60", "4.20"]);
  const labels = three ? LABELS3 : LABELS2;
  const prices = vals.slice(0, labels.length).map(num);
  const ok = prices.every((x): x is number => x !== null && x > 1);
  const implied = ok ? (prices as number[]).map((k) => 1 / k) : [];
  const sum = implied.reduce((s, x) => s + x, 0);
  const margin = ok ? sum - 1 : null;

  return (
    <div className="space-y-6">
      <div className="inline-flex overflow-hidden rounded-lg border border-line-strong bg-surface text-sm" role="group" aria-label="Число исходов">
        {[true, false].map((t) => (
          <button
            key={String(t)}
            type="button"
            onClick={() => {
              setThree(t);
              setVals(t ? ["1.90", "3.60", "4.20"] : ["1.85", "1.95", ""]);
            }}
            aria-pressed={three === t}
            className="border-l border-line px-4 py-2 font-medium text-muted transition first:border-l-0 hover:text-fg aria-pressed:bg-fg aria-pressed:text-bg"
          >
            {t ? "3 исхода: П1, X, П2" : "2 исхода: тотал, фора"}
          </button>
        ))}
      </div>

      <div className={`grid gap-3 ${three ? "grid-cols-3" : "grid-cols-2"}`}>
        {labels.map((l, i) => (
          <label key={l} className="min-w-0 space-y-1.5">
            <span className="block truncate text-xs text-muted">{l}</span>
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

      <div className="rounded-[10px] bg-surface-2 p-5 ring-1 ring-line">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs text-muted">Маржа букмекера</p>
            <p className="num mt-1 text-[56px] leading-none font-bold">
              <span className={margin !== null && margin > 0 && margin <= 0.05 ? "hl rounded-[3px] px-1" : ""}>{margin !== null ? `${ru(margin * 100, 1)}%` : "—"}</span>
            </p>
          </div>
          <p className="max-w-[16rem] text-sm text-muted" aria-live="polite">
            {margin === null
              ? "Введите коэффициенты больше 1."
              : margin <= 0
                ? "Сумма вероятностей меньше 100%. Похоже, это коэффициенты разных букмекеров."
                : margin <= 0.05
                  ? "Низкая маржа: хорошая линия."
                  : margin <= 0.08
                    ? "Средняя маржа."
                    : "Высокая маржа: вы заметно переплачиваете."}
          </p>
        </div>
        {ok && margin !== null && margin > 0 && (
          <div className={`mt-5 grid gap-2 border-t border-line pt-4 ${three ? "grid-cols-3" : "grid-cols-2"}`}>
            {labels.map((l, i) => {
              const fair = implied[i] / sum;
              return (
                <div key={l} className="min-w-0">
                  <p className="truncate text-xs text-muted">{l}</p>
                  <p className="num text-2xl font-bold">{ru(fair * 100, 1)}%</p>
                  <p className="text-xs text-subtle">
                    честный коэффициент <span className="num text-sm font-semibold text-fg-2">{ru(1 / fair)}</span>
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
