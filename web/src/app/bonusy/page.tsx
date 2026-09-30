import type { Metadata } from "next";
import Link from "next/link";
import { BonusCard } from "@/components/BonusCard";
import { Faq, Fine, PageHead } from "@/components/Page";
import { BONUS_KINDS, BONUS_TERMS, bookmakersByRating, type BonusKind } from "@/lib/bookmakers";
import { paths } from "@/lib/routes";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Бонусы букмекеров 2026: фрибеты и бонусы новым игрокам",
  description:
    "Фрибеты и приветственные бонусы легальных букмекеров России. Сумма, отыгрыш, минимальный коэффициент и срок на одной карточке, без мелкого шрифта.",
  alternates: { canonical: paths.bonuses },
};

type Props = { searchParams: Promise<{ type?: string }> };

const legend = [
  { term: "Сумма", text: "Максимальный размер бонуса или фрибета. Часто это потолок: реальная сумма зависит от первого депозита." },
  { term: "Отыгрыш", text: "Сколько раз нужно поставить сумму бонуса, прежде чем его можно вывести. ×1 — мягкое условие, ×10 и выше — жёсткое." },
  { term: "Мин. коэффициент", text: "Ставки с коэффициентом ниже этого в отыгрыш не засчитываются." },
  { term: "Срок", text: "За сколько дней нужно использовать бонус, иначе он сгорит." },
];

const faqs = [
  {
    q: "Что такое фрибет?",
    a: "Бесплатная ставка от букмекера. Если она выиграет, вы получите выигрыш без суммы самой ставки: фрибет 1 000 ₽ по коэффициенту 2.50 принесёт 1 500 ₽.",
  },
  {
    q: "Что значит отыгрыш бонуса?",
    a: "Сколько раз нужно поставить сумму бонуса, прежде чем деньги можно вывести. При отыгрыше ×5 бонус 1 000 ₽ превращается в обязательные ставки на 5 000 ₽.",
  },
  { q: "Можно ли получить приветственный бонус дважды?", a: "Нет. Приветственный бонус дают один раз на человека: легальный букмекер проверяет личность при регистрации." },
];

export default async function BonusesPage({ searchParams }: Props) {
  const type = (await searchParams).type as BonusKind | undefined;
  const all = bookmakersByRating();
  const kinds = BONUS_KINDS.filter((k) => all.some((b) => b.bonus.kind === k.key));
  const active = kinds.some((k) => k.key === type) ? type : undefined;
  const list = active ? all.filter((b) => b.bonus.kind === active) : all;
  const tabs = [{ key: undefined as BonusKind | undefined, label: "Все" }, ...kinds];

  return (
    <div className="container-x">
      <PageHead
        crumbs={[{ label: "Бонусы", href: paths.bonuses }]}
        title="Бонусы букмекеров"
        animate
        lead="Фрибеты и бонусы для новых игроков у легальных букмекеров. Бонус выгоден, только если вы и так собирались ставить: условия отыгрыша часто съедают большую часть суммы."
      />

      <nav className="mt-6 flex flex-wrap gap-1.5" aria-label="Тип бонуса">
        {tabs.map((t) => (
          <Link key={t.label} href={t.key ? `${paths.bonuses}?type=${t.key}` : paths.bonuses} className="chip" aria-current={active === t.key ? "page" : undefined}>
            {t.label}
          </Link>
        ))}
      </nav>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((b) => (
          <BonusCard key={b.slug} b={b} source="bonuses" />
        ))}
      </div>

      <section className="mt-block grid gap-8 border-t border-line pt-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <h2 className="text-xl font-extrabold tracking-tight">Как читать условия</h2>
        <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {legend.map((l) => (
            <div key={l.term}>
              <dt className="font-bold">{l.term}</dt>
              <dd className="mt-0.5 text-sm text-muted">{l.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-block">
        <Faq items={faqs} />
      </div>

      <Fine className="mt-12">
        {BONUS_TERMS} {site.warning}
      </Fine>
    </div>
  );
}
