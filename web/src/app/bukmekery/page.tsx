import type { Metadata } from "next";
import Link from "next/link";
import { BookmakerRow } from "@/components/BookmakerRow";
import { Faq, Fine, PageHead } from "@/components/Page";
import { bookmakersByRating } from "@/lib/bookmakers";
import { paths } from "@/lib/routes";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Рейтинг легальных букмекеров России 2026: маржа, выплаты, бонусы",
  description:
    "Легальные букмекеры России с лицензией ФНС: оценка, маржа на футбол, скорость выплат и бонусы для новых игроков. Только конторы, которые работают по закону.",
  alternates: { canonical: paths.bookmakers },
};

const criteria = [
  { k: "Маржа", v: "Сколько букмекер закладывает в коэффициенты на исход матча топ-лиги. Чем ниже, тем меньше вы переплачиваете." },
  { k: "Выплаты", v: "За сколько приходят деньги и какими способами их можно вывести." },
  { k: "Линия", v: "Сколько турниров и рынков на каждый матч: тоталы, форы, статистика." },
  { k: "Лицензия", v: "Только букмекеры с лицензией ФНС России. Офшоров в рейтинге нет." },
];

const faqs = [
  {
    q: "Какой букмекер самый надёжный?",
    a: "Начните с лицензии: она есть у всех букмекеров из этого списка, и её можно проверить в реестре ФНС. Дальше решают маржа и скорость выплат, они указаны на странице каждого букмекера.",
  },
  {
    q: "Где проверить лицензию букмекера?",
    a: "В реестре на сайте ФНС России, nalog.gov.ru. Номер лицензии легальный букмекер указывает внизу своего сайта.",
  },
  {
    q: "Почему в рейтинге нет некоторых известных сайтов?",
    a: "У них нет российской лицензии. Мы пишем только о легальных букмекерах: у офшора выигрыш ничем не защищён, а его сайты блокирует Роскомнадзор.",
  },
];

export default function BookmakersPage() {
  const list = bookmakersByRating();
  return (
    <div className="container-x">
      <PageHead
        crumbs={[{ label: "Букмекеры", href: paths.bookmakers }]}
        title="Рейтинг легальных букмекеров"
        animate
        lead="Все букмекеры в списке работают по лицензии ФНС России. Место зависит от маржи на футбол, скорости выплат, ширины линии и удобства, а не от того, платит ли нам букмекер."
      />

      <dl className="mt-7 grid gap-px overflow-hidden rounded-[10px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {criteria.map((c) => (
          <div key={c.k} className="bg-surface p-4">
            <dt className="font-bold">{c.k}</dt>
            <dd className="mt-1 text-sm text-muted">{c.v}</dd>
          </div>
        ))}
      </dl>

      <div className="card mt-6 divide-y divide-line overflow-hidden">
        {list.map((b, i) => (
          <BookmakerRow key={b.slug} b={b} rank={i + 1} source="bookmakers-list" />
        ))}
      </div>
      <p className="mt-3 text-sm text-muted prose-links">
        Бонусы всех букмекеров с условиями — на странице <Link href={paths.bonuses}>«Бонусы»</Link>. Как отличить легального букмекера от офшора,
        рассказываем в <Link href={paths.article("kak-proverit-bukmekera")}>отдельной статье</Link>.
      </p>

      <div className="mt-14">
        <Faq items={faqs} />
      </div>
      <Fine className="mt-10">Оценки и маржа — по данным редакции, условия бонусов меняются: проверяйте их на сайте букмекера. {site.warning}</Fine>
    </div>
  );
}
