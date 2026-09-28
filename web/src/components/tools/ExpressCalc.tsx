"use client";

import { useState } from "react";
import { num, ru } from "@/lib/tools";

const MAX_LEGS = 12;

export function ExpressCalc() {
  const [legs, setLegs] = useState(["1.90", "1.85", "2.10"]);
  const [stake, setStake] = useState("1000");
  const [legMargin, setLegMargin] = useState("5");

  const prices = legs.map(num).filter((x): x is number => x !== null && x > 1);
  const total = prices.reduce((p, k) => p * k, 1);
  const s = num(stake) ?? 0;
  const m = (num(legMargin) ?? 0) / 100;
  const n = prices.length;
  const expReturn = Math.pow(1 / (1 + m), n); // share of stake returned on average
  const accMargin = Math.pow(1 + m, n) - 1;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        {legs.map((v, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-16 shrink-0 text-xs text-subtle">Событие {i + 1}</span>
            <input
              id={`leg-${i}`}
              className="field h-11"
              inputMode="decimal"
              value={v}
              aria-label={`Коэффициент события ${i + 1}`}
              onChange={(e) => setLegs((l) => l.map((x, j) => (j === i ? e.target.value : x)))}
            />
            <button
              type="button"
              onClick={() => setLegs((l) => l.filter((_, j) => j !== i))}
              disabled={legs.length <= 2}
              className="grid size-11 shrink-0 place-items-center rounded-xl border border-line text-muted transition hover:text-fg disabled:opacity-30"
              aria-label={`Убрать событие ${i + 1}`}
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setLegs((l) => [...l, "1.90"])}
          disabled={legs.length >= MAX_LEGS}
          className="btn-ghost h-10 w-full disabled:opacity-40"
        >
          + Добавить событие
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="min-w-0 space-y-1.5">
          <span className="text-xs text-subtle">Ставка, ₽</span>
          <input id="stake" className="field" inputMode="decimal" value={stake} onChange={(e) => setStake(e.target.value)} />
        </label>
        <label className="min-w-0 space-y-1.5">
          <span className="text-xs text-subtle">Маржа в каждом событии, %</span>
          <input id="leg-margin" className="field" inputMode="decimal" value={legMargin} onChange={(e) => setLegMargin(e.target.value)} />
        </label>
      </div>

      <div className="rounded-2xl border border-line bg-surface-2 p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs text-subtle">Итоговый коэффициент</p>
            <p className="text-5xl font-extrabold tracking-[-0.04em] text-accent tabular-nums">{n >= 2 ? ru(total) : "—"}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-subtle">Выплата при выигрыше</p>
            <p className="text-2xl font-semibold tabular-nums">{n >= 2 && s ? `${ru(total * s, 0)} ₽` : "—"}</p>
          </div>
        </div>
        {n >= 2 && (
          <dl className="mt-6 grid grid-cols-3 gap-2 border-t border-line pt-5 text-sm">
            <div className="min-w-0">
              <dt className="text-xs text-subtle">Шанс по коэф.</dt>
              <dd className="text-lg font-semibold tabular-nums">{ru(100 / total, 1)}%</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs text-subtle">Маржа экспресса</dt>
              <dd className="text-lg font-semibold tabular-nums">{ru(accMargin * 100, 1)}%</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs text-subtle">Возврат в среднем</dt>
              <dd className="text-lg font-semibold tabular-nums">{s ? `${ru(s * expReturn, 0)} ₽` : "—"}</dd>
            </div>
          </dl>
        )}
      </div>
    </div>
  );
}
