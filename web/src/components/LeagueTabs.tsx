import Link from "next/link";
import { leagues } from "@/lib/leagues";

export function LeagueTabs({ active }: { active?: string }) {
  const tabs = [{ key: undefined as string | undefined, short: "Все матчи" }, ...leagues];
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Турниры">
      {tabs.map((t) => {
        const selected = active === t.key;
        return (
          <Link
            key={t.short}
            role="tab"
            aria-selected={selected}
            href={t.key ? `/matches?league=${t.key}` : "/matches"}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition ${
              selected ? "border-fg bg-fg text-bg" : "border-line text-muted hover:border-line-strong hover:text-fg"
            }`}
          >
            {t.short}
          </Link>
        );
      })}
    </div>
  );
}
