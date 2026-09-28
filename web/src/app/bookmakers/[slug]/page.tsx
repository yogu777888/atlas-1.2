import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BonusFacts } from "@/components/BonusFacts";
import { BookLogo } from "@/components/BookLogo";
import { OutboundButton } from "@/components/OutboundButton";
import { Rating } from "@/components/Rating";
import { bookmakers, getBookmaker, bonusTerms } from "@/lib/bookmakers";
import { site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return bookmakers.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const b = getBookmaker((await params).slug);
  if (!b) return {};
  return {
    title: `${b.name}: обзор букмекера — коэффициенты, бонусы, выплаты`,
    description: `${b.name} — оценка ${b.rating} из 5. Маржа около ${(b.avgMargin * 100).toFixed(1).replace(".", ",")}%, выплаты ${b.payout}, минимальный депозит ${b.minDeposit}.`,
    alternates: { canonical: `/bookmakers/${b.slug}` },
  };
}

export default async function BookmakerPage({ params }: Props) {
  const b = getBookmaker((await params).slug);
  if (!b) notFound();

  const facts = [
    { k: "Оценка", v: <Rating value={b.rating} /> },
    { k: "Средняя маржа", v: `~${(b.avgMargin * 100).toFixed(1).replace(".", ",")}%` },
    { k: "Выплаты", v: b.payout },
    { k: "Мин. депозит", v: b.minDeposit },
    { k: "Лицензия", v: "ФНС России" },
    { k: "Особенности", v: b.features[0] },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Review",
    inLanguage: "ru",
    itemReviewed: { "@type": "Organization", name: b.name, url: b.homepage },
    author: { "@type": "Organization", name: site.name },
    reviewRating: { "@type": "Rating", ratingValue: b.rating, bestRating: 5 },
  };

  const verdict =
    b.avgMargin <= 0.045 ? "это одни из лучших коэффициентов на рынке" : b.avgMargin <= 0.055 ? "это конкурентный уровень для крупной конторы" : "поэтому перед ставкой стоит сравнить цены";

  return (
    <div className="container-x pt-12">
      <Link href="/bookmakers" className="text-sm text-muted hover:text-fg">
        ← Все букмекеры
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_22rem]">
        <div>
          <div className="flex items-center gap-4">
            <BookLogo slug={b.slug} size="lg" />
            <div>
              <h1 className="text-4xl font-semibold tracking-tight">{b.name}</h1>
              <p className="mt-1 text-sm text-muted">{b.features.join(" · ")}</p>
            </div>
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
            {facts.map((f) => (
              <div key={f.k} className="bg-surface p-4">
                <dt className="text-xs text-subtle">{f.k}</dt>
                <dd className="mt-1 text-sm font-medium tabular-nums">{f.v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="card p-6">
              <p className="font-medium text-accent">Что нравится</p>
              <ul className="mt-4 space-y-2.5 text-sm text-muted">
                {b.pros.map((p) => (
                  <li key={p} className="flex gap-2.5">
                    <span className="text-accent">+</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-6">
              <p className="font-medium text-danger">На что обратить внимание</p>
              <ul className="mt-4 space-y-2.5 text-sm text-muted">
                {b.cons.map((c) => (
                  <li key={c} className="flex gap-2.5">
                    <span className="text-danger">−</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 max-w-2xl space-y-4 leading-relaxed text-muted">
            <h2 className="text-xl font-semibold tracking-tight text-fg">Итог</h2>
            <p>
              Средняя маржа {b.name} на исход матча — около {(b.avgMargin * 100).toFixed(1).replace(".", ",")}%, {verdict}. {b.pros[0]}. Главный
              минус: {b.cons[0].toLowerCase()}.
            </p>
            <p>Сравнивайте коэффициенты на tag.bet: на конкретный матч лучшая цена часто оказывается у другой конторы.</p>
          </div>
        </div>

        <aside id="bonus" className="scroll-mt-24 lg:sticky lg:top-24 lg:self-start">
          <div className="card relative overflow-hidden p-6">
            <p className="eyebrow">Бонус</p>
            <p className="mt-3 text-2xl leading-tight font-semibold tracking-tight">{b.bonus.headline}</p>
            <p className="mt-2 text-sm text-muted">{b.bonus.detail}</p>
            <div className="mt-5">
              <BonusFacts bonus={b.bonus} />
            </div>
            <div className="mt-5">
              <OutboundButton b={b} source={`review-${b.slug}`} label={`Перейти в ${b.name}`} className="h-11 w-full" note="Ссылка на букмекера появится после проверки условий партнёрства." />
            </div>
            <p className="mt-3 text-[11px] leading-snug text-subtle">{bonusTerms(b)}</p>
          </div>
        </aside>
      </div>
      <p className="mt-10 text-xs text-subtle">{site.warning}</p>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
