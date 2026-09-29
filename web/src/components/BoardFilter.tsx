"use client";

import Link from "next/link";
import { useState } from "react";

type Chip = { key: string; short: string; count: number; href: string; label: string };

/**
 * League chips that filter the table in place. Rows and day groups carry
 * data-lg / data-lgs, so filtering is one CSS rule and needs no re-render of the rows.
 */
export function BoardFilter({ chips, legend, children }: { chips: Chip[]; legend?: React.ReactNode; children: React.ReactNode }) {
  const [f, setF] = useState<string | null>(null);
  const active = chips.find((c) => c.key === f);
  const safe = f?.replace(/[^\w-]/g, "");
  return (
    <div data-f={safe ?? undefined}>
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
        {legend}
      </div>
      {children}
      {active && (
        <Link href={active.href} className="link-more mt-3">
          {active.label} <span aria-hidden>→</span>
        </Link>
      )}
    </div>
  );
}
