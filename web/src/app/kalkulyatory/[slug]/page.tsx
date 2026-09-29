import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Formula } from "@/components/ArticleBlocks";
import { Fine, PageHead } from "@/components/Page";
import { ExpressCalc } from "@/components/tools/ExpressCalc";
import { MarginCalc } from "@/components/tools/MarginCalc";
import { OddsConverter } from "@/components/tools/OddsConverter";
import { getArticle } from "@/content/articles";
import { paths } from "@/lib/routes";
import { site } from "@/lib/site";
import { getTool, tools } from "@/lib/tools";

type Props = { params: Promise<{ slug: string }> };

/** Calculator plus the few sentences of "how it works" that sit beside it. */
const content: Record<string, { calc: React.ReactNode; formula: string; formulaNote: string; how: string[] }> = {
  marzha: {
    calc: <MarginCalc />,
    formula: "маржа = 1/k₁ + 1/k₂ + 1/k₃ − 1",
    formulaNote: "честный шанс исхода = (1/k) / сумма",
    how: [
      "Каждый коэффициент переводится в вероятность: единица, делённая на коэффициент. Сумма всегда больше 100%, и излишек — это маржа.",
      "Честный шанс исхода — его вероятность, делённая на сумму. Честный коэффициент — единица, делённая на честный шанс.",
      "На топ-матчи нормальная маржа — 4–7%. Всё, что выше 8%, заметно съедает выигрыш на дистанции.",
    ],
  },
  veroyatnost: {
    calc: <OddsConverter />,
    formula: "вероятность = 1 / k",
    formulaNote: "k — десятичный коэффициент",
    how: [
      "Десятичный коэффициент показывает всю выплату вместе со ставкой: при 1.90 со 100 ₽ вернётся 190 ₽.",
      "Дробный показывает только чистый выигрыш: 9/10 — это 9 ₽ на каждые 10 ₽ ставки. В американском минус показывает, сколько поставить ради 100 ₽ выигрыша, а плюс — сколько принесёт ставка 100 ₽.",
      "Вероятность из коэффициента включает маржу букмекера. Чтобы получить честную, воспользуйтесь калькулятором маржи.",
    ],
  },
  ekspress: {
    calc: <ExpressCalc />,
    formula: "k = k₁ × k₂ × … × kₙ",
    formulaNote: "маржа экспресса = (1 + m)ⁿ − 1",
    how: [
      "Коэффициенты событий перемножаются. Экспресс выигрывает, только если сыграли все события.",
      "Маржа тоже перемножается: при 5% в каждом событии у экспресса из трёх событий уже около 16% маржи.",
      "«Средний возврат» — сколько в среднем возвращается со ставки, если в каждом событии заложена указанная маржа. Это не прогноз конкретной ставки.",
    ],
  },
};

export function generateStaticParams() {
  return tools.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = getTool((await params).slug);
  if (!t) return { title: "Калькулятор не найден" };
  return { title: `${t.title} онлайн`, description: t.description, alternates: { canonical: paths.tool(t.slug) } };
}

export default async function ToolPage({ params }: Props) {
  const t = getTool((await params).slug);
  const c = t && content[t.slug];
  if (!t || !c) notFound();
  const article = getArticle(t.article);
  const others = tools.filter((x) => x.slug !== t.slug);

  return (
    <div className="container-x">
      <PageHead
        crumbs={[
          { label: "Калькуляторы", href: paths.tools },
          { label: t.short, href: paths.tool(t.slug) },
        ]}
        title={t.title}
        lead={t.description}
      />

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <section className="card p-5 sm:p-7">{c.calc}</section>
        <aside className="space-y-5">
          <Formula note={c.formulaNote}>{c.formula}</Formula>
          <div className="space-y-3 text-sm leading-relaxed text-fg-2">
            {c.how.map((h) => (
              <p key={h}>{h}</p>
            ))}
          </div>
          {article && (
            <Link href={paths.article(article.slug)} className="card group flex items-center justify-between gap-4 p-4 transition-colors hover:border-line-strong">
              <span>
                <span className="block text-xs text-subtle">Статья · {article.minutes} мин</span>
                <span className="block font-semibold group-hover:underline group-hover:decoration-hi group-hover:decoration-2 group-hover:underline-offset-4">{article.title}</span>
              </span>
              <span className="text-subtle transition group-hover:translate-x-[3px] group-hover:text-fg" aria-hidden>
                →
              </span>
            </Link>
          )}
        </aside>
      </div>

      <section className="mt-14">
        <p className="mb-3 text-sm font-semibold text-fg-2">Другие калькуляторы</p>
        <div className="flex flex-wrap gap-1.5">
          {others.map((o) => (
            <Link key={o.slug} href={paths.tool(o.slug)} className="chip">
              {o.short}
            </Link>
          ))}
          <Link href={paths.forecasts} className="chip">
            <span className="size-2.5 rounded-sm bg-hi ring-1 ring-fg/10" aria-hidden />
            Шансы на матчи недели
          </Link>
        </div>
      </section>
      <Fine className="mt-12">{site.warning}</Fine>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: t.title,
            description: t.description,
            applicationCategory: "UtilitiesApplication",
            operatingSystem: "Any",
            inLanguage: "ru",
            offers: { "@type": "Offer", price: "0", priceCurrency: "RUB" },
            url: `${site.url}${paths.tool(t.slug)}`,
          }),
        }}
      />
    </div>
  );
}
