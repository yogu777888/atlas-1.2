"use client";

import { useState } from "react";
import { splitStakes } from "@/lib/odds/math";

export function StakeSplitter({ legs }: { legs: { label: string; price: number; book: string }[] }) {
  const [total, setTotal] = useState(100);
  const stakes = splitStakes(
    legs.map((l) => l.price),
    total,
  );
  const payout = stakes[0] * legs[0].price;
  const profit = payout - total;

  return (
    <div className="card p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-medium">Stake splitter</p>
          <p className="text-sm text-muted">Equal payout whatever the result.</p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">Total stake</span>
          <input
            type="number"
            min={1}
            value={total}
            onChange={(e) => setTotal(Math.max(0, Number(e.target.value)))}
            className="w-28 rounded-lg border border-line-strong bg-surface-2 px-3 py-1.5 text-right font-mono tabular-nums outline-none focus:border-accent"
          />
        </label>
      </div>
      <ul className="mt-5 divide-y divide-line">
        {legs.map((l, i) => (
          <li key={l.label} className="flex items-center justify-between py-2.5 text-sm">
            <span>
              {l.label} <span className="text-subtle">@ {l.price.toFixed(2)} · {l.book}</span>
            </span>
            <span className="font-mono tabular-nums">{stakes[i].toFixed(2)}</span>
          </li>
        ))}
      </ul>
      <div className={`mt-4 flex items-center justify-between rounded-xl px-4 py-3 text-sm ${profit >= 0 ? "bg-accent/10 text-accent" : "bg-white/5 text-muted"}`}>
        <span>Return on any outcome</span>
        <span className="font-mono font-semibold tabular-nums">
          {payout.toFixed(2)} ({profit >= 0 ? "+" : ""}
          {profit.toFixed(2)})
        </span>
      </div>
    </div>
  );
}
