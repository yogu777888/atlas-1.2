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
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-expanded={hint}
            onClick={() => (hint ? closeHint() : setHint(true))}
            className="inline-flex h-[30px] items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-medium text-muted transition hover:text-fg aria-expanded:text-fg"
          >
            <span className="grid size-4 place-items-center rounded-full border border-current text-[10px] font-bold" aria-hidden>
              ?
            </span>
            Как читать
          </button>
          <div role="group" aria-label="Вид таблицы" className="inline-flex overflow-hidden rounded-lg border border-line-strong bg-surface text-[13px]">
            {(["short", "full"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => choose(v)}
                className="border-l border-line px-3 py-1 font-medium text-muted transition first:border-l-0 hover:text-fg aria-pressed:bg-fg aria-pressed:text-bg"
              >
                {v === "short" ? "Коротко" : "Подробно"}
              </button>
            ))}
          </div>
        </div>
      </div>
      {hint && (
        <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 border-y border-line py-2 text-xs text-muted">
          {view === "short" ? <span>Для каждого матча — кто фаворит и с каким шансом. Жёлтая метка: есть коэффициент выше честного.</span> : legend}
          <Link href="/stati/kak-chitat-prognoz" className="font-semibold text-fg underline decoration-hi decoration-2 underline-offset-4">
            Подробнее
          </Link>
          <button type="button" onClick={closeHint} className="ml-auto p-1 text-subtle hover:text-fg" aria-label="Скрыть пояснение">
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
