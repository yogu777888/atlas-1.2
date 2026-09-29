"use client";

import { useState } from "react";
import { fromAmerican, fromFraction, num, toAmerican, toFraction } from "@/lib/tools";

type Field = "dec" | "frac" | "us" | "prob";

function fromDecimal(d: number): Record<Field, string> {
  return {
    dec: d.toFixed(2),
    frac: toFraction(d),
    us: toAmerican(d),
    prob: ((1 / d) * 100).toFixed(1).replace(".", ","),
  };
}

const FIELDS: { key: Field; label: string; hint: string }[] = [
  { key: "dec", label: "Десятичный", hint: "как в России" },
  { key: "prob", label: "Вероятность, %", hint: "с маржой букмекера" },
  { key: "frac", label: "Дробный", hint: "британский" },
  { key: "us", label: "Американский", hint: "moneyline" },
];

export function OddsConverter() {
  const [vals, setVals] = useState<Record<Field, string>>(fromDecimal(1.9));
  const [bad, setBad] = useState<Field | null>(null);

  function edit(field: Field, raw: string) {
    let d: number | null = null;
    if (field === "dec") d = num(raw);
    if (field === "frac") d = fromFraction(raw);
    if (field === "us") d = fromAmerican(raw);
    if (field === "prob") {
      const p = num(raw);
      d = p !== null && p < 100 ? 100 / p : null;
    }
    if (d !== null && d > 1) {
      setVals({ ...fromDecimal(d), [field]: raw });
      setBad(null);
    } else {
      setVals((v) => ({ ...v, [field]: raw }));
      setBad(field);
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {FIELDS.map((f) => (
        <label key={f.key} className="min-w-0 space-y-1.5">
          <span className="flex items-baseline justify-between gap-2 text-xs">
            <span className="font-medium text-fg">{f.label}</span>
            <span className="text-subtle">{f.hint}</span>
          </span>
          <input
            id={`odds-${f.key}`}
            className={`field ${bad === f.key ? "border-loss" : ""}`}
            inputMode={f.key === "frac" || f.key === "us" ? "text" : "decimal"}
            value={vals[f.key]}
            onChange={(e) => edit(f.key, e.target.value)}
            aria-invalid={bad === f.key}
          />
        </label>
      ))}
      <p className="text-sm text-muted sm:col-span-2">
        Меняйте любое поле, остальные пересчитаются сами. Дробный коэффициент вводите как <b className="text-fg">9/10</b>, американский как{" "}
        <b className="text-fg">−111</b> или <b className="text-fg">+150</b>
      </p>
    </div>
  );
}
