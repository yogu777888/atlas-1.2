import type { Metadata } from "next";
import { BookmakerRow } from "@/components/BookmakerRow";
import { bookmakersByRating } from "@/lib/bookmakers";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Рейтинг легальных букмекеров",
  description: "Независимые обзоры легальных букмекеров России: коэффициенты, выплаты, линия и удобство.",
  alternates: { canonical: "/bookmakers" },
};

const criteria = [
  { k: "Коэффициенты", v: "Типичная маржа на исход матча в топ-лигах: чем ниже, тем меньше вы переплачиваете." },
  { k: "Выплаты", v: "Как быстро приходят деньги и какими способами." },
  { k: "Линия", v: "Виды спорта, турниры и глубина росписи." },
  { k: "Лицензия", v: "Только букмекеры с лицензией ФНС России." },
];

export default function BookmakersPage() {
  const list = bookmakersByRating();
  return (
    <div className="container-x pt-14">
      <p className="eyebrow">Рейтинг</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Легальные букмекеры России.</h1>
      <p className="mt-3 max-w-2xl text-muted">Место в рейтинге нельзя купить: порядок определяют критерии ниже, а не вознаграждение партнёров.</p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {criteria.map((c) => (
          <div key={c.k} className="rounded-xl border border-line p-4">
            <p className="text-sm font-medium">{c.k}</p>
            <p className="mt-1 text-xs text-muted">{c.v}</p>
          </div>
        ))}
      </div>

      <div className="card mt-8 divide-y divide-line overflow-hidden">
        {list.map((bm, i) => (
          <BookmakerRow key={bm.slug} b={bm} rank={i + 1} source="bookmakers-list" />
        ))}
      </div>
      <p className="mt-6 text-xs text-subtle">{site.warning}</p>
    </div>
  );
}
