"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Chip = { key: string; short: string; count: number; href: string; label: string };

/**
 * League chips that filter the table in place. Rows and day groups carry
 * data-lg / data-lgs, so filtering is one CSS rule and needs no re-render of the rows.
 */
export function BoardFilter({ chips, legend, children }: { chips: Chip[]; legend?: React.ReactNode; children: React.ReactNode }) {
  const [f, setF] = useState<string | null>(null);
  const [view, setView] = useState<"short" | "full">("full");
  const [hint, setHint] = useState(false);
  // Remembered choice; first-time visitors on a phone start with the short view
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("tagbet:view");
      setHint(localStorage.getItem("tagbet:hint") !== "1");
    } catch {}
    setView(saved === "short" || saved === "full" ? saved : matchMedia("(max-width: 639px)").matches ? "short" : "full");
  }, []);
  const choose = (v: "short" | "full") => {
    setView(v);
    try {
      localStorage.setItem("tagbet:view", v);
    } catch {}
  };
  const closeHint = () => {
    setHint(false);
    try {
      localStorage.setItem("tagbet:hint", "1");
    } catch {}
  };
  const active = chips.find((c) => c.key === f);
  const safe = f?.replace(/[^\w-]/g, "");
  return (
    <div data-f={safe ?? undefined} data-view={view}>
      {safe && (
        <style>{`[data-f="${safe}"] [data-lg]:not([data-lg="${safe}"]),[data-f="${safe}"] section[data-lgs]:not([data-lgs~="${safe}"]),[data-f="${safe}"] [data-count]{display:none}`}</style>
      )}
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
        {chips.length > 1 ? (
          <div role="group" aria-label="Турнир" className="flex flex-wrap gap-1.5">
            <button type="button" className="chip" aria-pressed={f === null} onClick={() => setF(null)}>
              Все
            </button>
            {chips.map((c) => (
              <button key={c.key} type="button" className="chip" aria-pressed={f === c.key} onClick={() => setF(f === c.key ? null : c.key)}>
                {c.short}
                <span className="num text-[13px] opacity-70">{c.count}</span>
              </button>
            ))}
          </div>
        ) : (
          <span />
        )}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {view === "full" && legend}
          <div role="group" aria-label="Вид таблицы" className="inline-flex overflow-hidden rounded-lg border border-line-strong bg-surface text-[13px]">
            {(["short", "full"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => choose(v)}
                className="border-l border-line px-3 py-1.5 font-medium text-muted transition first:border-l-0 hover:text-fg aria-pressed:bg-fg aria-pressed:text-bg"
              >
                {v === "short" ? "Коротко" : "Подробно"}
              </button>
            ))}
          </div>
        </div>
      </div>
      {hint && (
        <div className="mb-3 flex items-start gap-3 rounded-[10px] bg-surface px-4 py-3 text-sm text-fg-2 ring-1 ring-line">
          <span className="mt-0.5 size-3 shrink-0 rounded-sm bg-hi ring-1 ring-fg/15" aria-hidden />
          <p className="flex-1">
            {view === "short"
              ? "Для каждого матча — кто фаворит и с каким шансом. Жёлтая метка: у букмекера есть коэффициент выше честного. "
              : "Числа слева — шансы на победу хозяев, ничью и победу гостей в %: чем темнее зелёный, тем вероятнее. Справа коэффициенты букмекера, жёлтым — выше честной цены. "}
            <Link href="/stati/kak-chitat-prognoz" className="font-semibold text-fg underline decoration-hi decoration-2 underline-offset-4">
              Как читать прогноз
            </Link>
          </p>
          <button type="button" onClick={closeHint} className="-m-1 p-1 text-subtle hover:text-fg" aria-label="Скрыть подсказку">
            ✕
          </button>
        </div>
      )}
      {children}
      {active && (
        <Link href={active.href} className="link-more mt-3">
          {active.label} <span aria-hidden>→</span>
        </Link>
      )}
    </div>
  );
}
