import Link from "next/link";
import { leagues, otherLeague } from "@/lib/leagues";

/** `active` is a league key, "value" for the above-fair filter, or undefined for all matches. */
export function LeagueTabs({ active }: { active?: string }) {
  const tabs = [
    { key: undefined as string | undefined, short: "Все матчи", href: "/matches" },
    { key: "value", short: "Выгодные", href: "/matches?value=1" },
    ...[...leagues, otherLeague].map((l) => ({ key: l.key as string | undefined, short: l.short, href: `/matches?league=${l.key}` })),
  ];
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Турниры">
      {tabs.map((t) => {
        const selected = active === t.key;
        return (
          <Link
            key={t.short}
            role="tab"
            aria-selected={selected}
            href={t.href}
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
