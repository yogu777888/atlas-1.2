import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Formula } from "@/components/ArticleBlocks";
import { ExpressCalc } from "@/components/tools/ExpressCalc";
import { MarginCalc } from "@/components/tools/MarginCalc";
import { OddsConverter } from "@/components/tools/OddsConverter";
import { getArticle } from "@/content/articles";
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
      "Каждый коэффициент переводится в вероятность: единица, делённая на коэффициент. Сумма всегда больше 100% — излишек и есть маржа.",
      "Честные шансы получаются делением каждой вероятности на сумму. Честный коэффициент — единица, делённая на честный шанс.",
      "Для топ-матчей нормальная маржа — 3–6%. Всё, что выше 8%, заметно съедает выигрыш на дистанции.",
    ],
  },
  veroyatnost: {
    calc: <OddsConverter />,
    formula: "вероятность = 1 / k",
    formulaNote: "k — десятичный коэффициент",
    how: [
      "Десятичный коэффициент показывает всю выплату вместе со ставкой: 1.90 — это 190 ₽ со 100 ₽.",
      "Дробный показывает только чистый выигрыш: 9/10 — 9 ₽ на каждые 10 ₽. Американский: минус — сколько поставить ради 100 ₽ выигрыша, плюс — сколько выиграете со 100 ₽.",
      "Вероятность из коэффициента включает маржу букмекера. Чтобы получить честную, воспользуйтесь калькулятором маржи.",
    ],
  },
  ekspress: {
    calc: <ExpressCalc />,
    formula: "k = k₁ × k₂ × … × kₙ",
    formulaNote: "маржа экспресса = (1 + m)ⁿ − 1",
    how: [
      "Коэффициенты событий перемножаются. Экспресс выигрывает, только если сыграли все события.",
      "Маржа тоже перемножается: при 5% в каждом событии экспресс из трёх событий несёт уже около 16% маржи.",
      "«Возврат в среднем» — сколько в среднем возвращается со ставки, если коэффициенты честные за вычетом маржи. Это не прогноз конкретной ставки.",
    ],
  },
};

export function generateStaticParams() {
  return tools.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = getTool((await params).slug);
  if (!t) return { title: "Калькулятор не найден" };
  return { title: `${t.title} онлайн`, description: t.description, alternates: { canonical: `/tools/${t.slug}` } };
}

export default async function ToolPage({ params }: Props) {
  const t = getTool((await params).slug);
  const c = t && content[t.slug];
  if (!t || !c) notFound();
  const article = getArticle(t.article);
  const others = tools.filter((x) => x.slug !== t.slug);

  return (
    <div className="container-x pt-12">
      <Link href="/tools" className="text-sm text-muted hover:text-fg">
        ← Калькуляторы
      </Link>
      <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{t.title}</h1>
      <p className="mt-3 max-w-2xl text-muted">{t.description}</p>

      <div className="mt-10 grid items-start gap-6 lg:grid-cols-[1.25fr_1fr]">
        <section className="card p-5 sm:p-7">{c.calc}</section>
        <aside className="space-y-5">
          <Formula note={c.formulaNote}>{c.formula}</Formula>
          <div className="space-y-3 text-sm leading-relaxed text-muted">
            {c.how.map((h) => (
              <p key={h}>{h}</p>
            ))}
          </div>
          {article && (
            <Link href={`/articles/${article.slug}`} className="group flex items-center justify-between gap-4 rounded-xl border border-line p-4 transition hover:border-line-strong">
              <span>
                <span className="block text-xs text-subtle">Статья · {article.minutes} мин</span>
                <span className="block font-medium group-hover:text-accent">{article.title}</span>
              </span>
              <span className="text-muted">→</span>
            </Link>
          )}
        </aside>
      </div>

      <section className="mt-16">
        <p className="mb-4 text-sm text-subtle">Другие калькуляторы</p>
        <div className="flex flex-wrap gap-2">
          {others.map((o) => (
            <Link key={o.slug} href={`/tools/${o.slug}`} className="rounded-full border border-line px-4 py-2 text-sm text-muted transition hover:border-line-strong hover:text-fg">
              {o.short}
            </Link>
          ))}
          <Link href="/matches" className="rounded-full border border-accent/40 px-4 py-2 text-sm text-accent transition hover:bg-accent/10">
            Шансы на ближайшие матчи
          </Link>
        </div>
      </section>
      <p className="mt-12 text-xs text-subtle">{site.warning}</p>
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
            url: `${site.url}/tools/${t.slug}`,
          }),
        }}
      />
    </div>
  );
}
