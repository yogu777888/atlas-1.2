import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BonusFacts } from "@/components/BonusFacts";
import { BookLogo } from "@/components/BookLogo";
import { OutboundButton } from "@/components/OutboundButton";
import { Fine } from "@/components/Page";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Rating } from "@/components/Rating";
import { bonusTerms, bookmakers, bookmakersByRating, getBookmaker, marginText } from "@/lib/bookmakers";
import { paths } from "@/lib/routes";
import { site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return bookmakers.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const b = getBookmaker((await params).slug);
  if (!b) return {};
  return {
    title: `${b.name}: обзор букмекера, маржа, выплаты, бонус`,
    description: `${b.name} — легальный букмекер с лицензией ФНС. Оценка ${b.rating.toFixed(1).replace(".", ",")} из 5, маржа на футбол ${marginText(b)}, выплаты ${b.payout}, минимальный депозит ${b.minDeposit}.`,
    alternates: { canonical: paths.bookmaker(b.slug) },
  };
}

export default async function BookmakerPage({ params }: Props) {
  const b = getBookmaker((await params).slug);
  if (!b) notFound();
  const place = bookmakersByRating().findIndex((x) => x.slug === b.slug) + 1;

  const facts = [
    { k: "Оценка редакции", v: <Rating value={b.rating} /> },
    { k: "Маржа на исход матча", v: marginText(b) },
    { k: "Выплаты", v: b.payout },
    { k: "Минимальный депозит", v: b.minDeposit },
    { k: "Лицензия", v: "ФНС России" },
    { k: "Место в рейтинге", v: `${place} из ${bookmakers.length}` },
  ];

  const level =
    b.avgMargin <= 0.045 ? "это один из лучших уровней на рынке" : b.avgMargin <= 0.055 ? "обычный уровень для крупного букмекера" : "это выше среднего по рынку";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Review",
    inLanguage: "ru",
    itemReviewed: { "@type": "Organization", name: b.name, url: b.homepage },
    author: { "@type": "Organization", name: site.name, url: `${site.url}${paths.about}` },
    reviewRating: { "@type": "Rating", ratingValue: b.rating, bestRating: 5 },
  };

  return (
    <div className="container-x">
      <div className="pt-6 sm:pt-8">
        <Breadcrumbs
          items={[
            { label: "Букмекеры", href: paths.bookmakers },
            { label: b.name, href: paths.bookmaker(b.slug) },
          ]}
        />
      </div>

      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div>
          <header className="flex items-center gap-4">
            <BookLogo slug={b.slug} size="lg" />
            <div>
              <h1 className="text-[clamp(30px,4vw,44px)] leading-tight font-extrabold tracking-[-0.035em]">{b.name}</h1>
              <p className="mt-0.5 text-sm text-muted">{b.features.join(" · ")}</p>
            </div>
          </header>

          <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-line bg-line sm:grid-cols-3">
            {facts.map((f) => (
              <div key={f.k} className="bg-surface p-4">
                <dt className="text-xs text-subtle">{f.k}</dt>
                <dd className="mt-1 font-semibold">{f.v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="card p-5">
              <p className="font-bold">Что нравится</p>
              <ul className="mt-3 space-y-2 text-sm text-fg-2">
                {b.pros.map((p) => (
                  <li key={p} className="flex gap-2.5">
                    <span className="font-bold text-win" aria-hidden>
                      +
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-5">
              <p className="font-bold">На что обратить внимание</p>
              <ul className="mt-3 space-y-2 text-sm text-fg-2">
                {b.cons.map((c) => (
                  <li key={c} className="flex gap-2.5">
                    <span className="font-bold text-loss" aria-hidden>
                      −
                    </span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <section className="mt-10 max-w-[68ch] space-y-3 leading-relaxed text-fg-2 prose-links">
            <h2 className="text-xl font-extrabold tracking-tight text-fg">Итог</h2>
            <p>
              Средняя маржа на исход футбольного матча — {marginText(b).replace("≈", "около ")}: {level}. {b.pros[0]}. Главный минус:{" "}
              {b.cons[0].charAt(0).toLowerCase() + b.cons[0].slice(1)}.
            </p>
            <p>
              Перед ставкой сравните коэффициент с честной ценой на <Link href={paths.forecasts}>странице матча</Link>: на конкретный исход выгоднее
              может оказаться другой букмекер. Как посчитать маржу самому, рассказываем в статье <Link href={paths.article("marzha-bukmekera")}>о марже</Link>.
            </p>
          </section>
        </div>

        <aside id="bonus" className="scroll-mt-24 lg:sticky lg:top-20 lg:self-start">
          <div className="card p-5">
            <span className="kicker">Бонус новым игрокам</span>
            <p className="mt-2.5 text-2xl leading-tight font-extrabold tracking-tight">{b.bonus.headline}</p>
            <p className="mt-1.5 text-sm text-muted">{b.bonus.detail}</p>
            <div className="mt-4">
              <BonusFacts bonus={b.bonus} />
            </div>
            <div className="mt-4">
              <OutboundButton b={b} source={`review-${b.slug}`} label={`Перейти в ${b.name}`} className="h-11 w-full" note="Ссылка на сайт букмекера появится, когда мы проверим условия партнёрства." />
            </div>
            <p className="mt-3 text-[11px] leading-snug text-subtle">{bonusTerms(b)}</p>
          </div>
        </aside>
      </div>
      <Fine className="mt-10">Оценка и маржа — по данным редакции. Условия бонусов меняются: проверяйте их на сайте букмекера. {site.warning}</Fine>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
