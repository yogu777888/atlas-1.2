import type { Metadata } from "next";
import Link from "next/link";
import { BonusCard } from "@/components/BonusCard";
import { BONUS_KINDS, BONUS_TERMS, bookmakersByRating, type BonusKind } from "@/lib/bookmakers";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Бонусы букмекеров для новых игроков",
  description: "Приветственные бонусы и фрибеты легальных букмекеров России: сумма, отыгрыш, минимальный коэффициент и срок — на одной карточке.",
  alternates: { canonical: "/bonuses" },
};

type Props = { searchParams: Promise<{ type?: string }> };

const legend = [
  { term: "Сумма", text: "максимальный размер бонуса или фрибета." },
  { term: "Отыгрыш", text: "сколько раз нужно поставить сумму бонуса, прежде чем его можно вывести." },
  { term: "Мин. коэф.", text: "ставки с коэффициентом ниже в отыгрыш не засчитываются." },
  { term: "Срок", text: "за сколько дней нужно использовать бонус, иначе он сгорит." },
];

export default async function BonusesPage({ searchParams }: Props) {
  const type = (await searchParams).type as BonusKind | undefined;
  const all = bookmakersByRating();
  const kinds = BONUS_KINDS.filter((k) => all.some((b) => b.bonus.kind === k.key));
  const active = kinds.some((k) => k.key === type) ? type : undefined;
  const list = active ? all.filter((b) => b.bonus.kind === active) : all;
  const tabs = [{ key: undefined as BonusKind | undefined, label: "Все" }, ...kinds];

  return (
    <div className="container-x pt-14">
      <p className="eyebrow">Бонусы</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Бонусы без мелкого шрифта.</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Четыре условия, которые решают, выгоден ли бонус, — прямо на карточке. Бонус имеет смысл, только если вы и так собирались
        делать ставку.
      </p>

      <div className="mt-8 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Тип бонуса">
        {tabs.map((t) => {
          const selected = active === t.key;
          return (
            <Link
              key={t.label}
              role="tab"
              aria-selected={selected}
              href={t.key ? `/bonuses?type=${t.key}` : "/bonuses"}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition ${
                selected ? "border-fg bg-fg text-bg" : "border-line text-muted hover:border-line-strong hover:text-fg"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((b) => (
          <BonusCard key={b.slug} b={b} source="bonuses" />
        ))}
      </div>

      <section className="mt-16 grid gap-8 border-t border-line pt-10 lg:grid-cols-[14rem_1fr]">
        <h2 className="text-lg font-semibold tracking-tight">Как читать условия</h2>
        <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {legend.map((l) => (
            <div key={l.term}>
              <dt className="font-medium">{l.term}</dt>
              <dd className="mt-0.5 text-sm text-muted">{l.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-12 text-xs text-subtle">
        {BONUS_TERMS} {site.warning}
      </p>
    </div>
  );
}
