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
            <span className="w-16 shrink-0 text-xs text-muted">Событие {i + 1}</span>
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
              className="grid size-11 shrink-0 place-items-center rounded-lg border border-line-strong bg-surface text-muted transition hover:border-fg hover:text-fg disabled:opacity-30"
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
          <span className="text-xs text-muted">Ставка, ₽</span>
          <input id="stake" className="field" inputMode="decimal" value={stake} onChange={(e) => setStake(e.target.value)} />
        </label>
        <label className="min-w-0 space-y-1.5">
          <span className="text-xs text-muted">Маржа в каждом событии, %</span>
          <input id="leg-margin" className="field" inputMode="decimal" value={legMargin} onChange={(e) => setLegMargin(e.target.value)} />
        </label>
      </div>

      <div className="rounded-[10px] bg-surface-2 p-5 ring-1 ring-line">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs text-muted">Итоговый коэффициент</p>
            <p className="num mt-1 text-[56px] leading-none font-bold">{n >= 2 ? ru(total) : "—"}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted">Выплата при выигрыше</p>
            <p className="num text-3xl font-bold">{n >= 2 && s ? `${ru(total * s, 0)} ₽` : "—"}</p>
          </div>
        </div>
        {n >= 2 && (
          <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-line pt-4 text-sm">
            <div className="min-w-0">
              <dt className="text-xs text-muted">Шанс по коэффициенту</dt>
              <dd className="num text-2xl font-bold">{ru(100 / total, 1)}%</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs text-muted">Маржа экспресса</dt>
              <dd className="num text-2xl font-bold">{ru(accMargin * 100, 1)}%</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs text-muted">Средний возврат</dt>
              <dd className="num text-2xl font-bold">{s ? `${ru(s * expReturn, 0)} ₽` : "—"}</dd>
            </div>
          </dl>
        )}
      </div>
    </div>
  );
}
