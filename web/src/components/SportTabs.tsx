import Link from "next/link";
import { sports } from "@/lib/sports";

export function SportTabs({ active, view }: { active?: string; view?: string }) {
  const tabs = [{ key: undefined, label: "Все", emoji: "✦" }, ...sports];
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Виды спорта">
      {tabs.map((t) => {
        const selected = view !== "surebets" && active === t.key;
        return (
          <Link
            key={t.label}
            role="tab"
            aria-selected={selected}
            href={t.key ? `/odds?sport=${t.key}` : "/odds"}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition ${
              selected ? "border-fg bg-fg text-bg" : "border-line text-muted hover:border-line-strong hover:text-fg"
            }`}
          >
            <span aria-hidden>{t.emoji}</span>
            {t.label}
          </Link>
        );
      })}
      <Link
        role="tab"
        aria-selected={view === "surebets"}
        href="/odds?view=surebets"
        className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition ${
          view === "surebets" ? "border-accent bg-accent text-accent-ink" : "border-accent/30 text-accent hover:bg-accent/10"
        }`}
      >
        ⚡ Вилки
      </Link>
    </div>
  );
}
