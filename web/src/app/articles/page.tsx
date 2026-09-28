import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/ArticleCard";
import { ArticleVisual, OddsInputs } from "@/components/ArticleVisuals";
import { Cover } from "@/components/Cover";
import { articles, getArticle, type Article } from "@/content/articles";
import { site } from "@/lib/site";
import { tools } from "@/lib/tools";

export const metadata: Metadata = {
  title: "Статьи о ставках: маржа, вероятность, налоги",
  description: "Коротко и с примерами: как считать маржу букмекера, переводить коэффициенты в вероятность, что такое валуйная ставка и как платить налог с выигрыша.",
  alternates: { canonical: "/articles" },
};

const FEATURED = "marzha-bukmekera";

const sections: { cat: Article["category"]; about: string }[] = [
  { cat: "Основы", about: "Как устроен коэффициент и где в нём комиссия." },
  { cat: "Стратегия", about: "Когда ставка выгодна, а когда это только кажется." },
  { cat: "Закон", about: "Налоги, лицензии и как не попасть к офшору." },
];

export default function ArticlesPage() {
  const featured = getArticle(FEATURED)!;
  const marginTool = tools.find((t) => t.slug === "marzha")!;

  return (
    <div className="container-x pt-14">
      <p className="eyebrow">Статьи</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">Ставки без магии: только цифры.</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Как букмекер считает коэффициенты, где он зарабатывает и как не переплачивать. Каждая статья — с формулой и живым примером.
      </p>

      {/* Start here */}
      <Link href={`/articles/${featured.slug}`} className="group mt-12 grid items-center gap-8 rounded-3xl border border-line bg-surface p-4 transition hover:border-line-strong md:grid-cols-[1.1fr_1fr] md:p-5">
        <Cover figure={featured.cover.figure} caption={featured.cover.caption} size="lg" visual={<ArticleVisual slug={featured.slug} />} />
        <div className="space-y-3 px-2 pb-3 md:px-4 md:pb-0">
          <p className="text-xs font-medium tracking-wider text-accent uppercase">Начните отсюда</p>
          <h2 className="text-3xl leading-tight font-semibold tracking-tight text-balance group-hover:text-accent">{featured.title}</h2>
          <p className="text-pretty text-muted">{featured.description}</p>
          <p className="text-sm text-subtle">
            {featured.category} · {featured.minutes} мин чтения
          </p>
        </div>
      </Link>

      {sections.map(({ cat, about }) => {
        const list = articles.filter((a) => a.category === cat && a.slug !== FEATURED);
        return (
          <section key={cat} className="mt-16 grid gap-6 border-t border-line pt-8 lg:grid-cols-[14rem_1fr] lg:gap-10">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <h2 className="text-lg font-semibold tracking-tight">{cat}</h2>
              <p className="mt-1 max-w-xs text-sm text-muted">{about}</p>
            </div>
            <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2">
              {list.map((a) => (
                <ArticleCard key={a.slug} a={a} />
              ))}
              {/* Basics keeps its second slot for the calculator that goes with the featured article */}
              {cat === "Основы" && (
                <Link href={`/tools/${marginTool.slug}`} className="group flex flex-col gap-4">
                  <div className="h-44 transition group-hover:-translate-y-0.5">
                    <Cover figure={marginTool.cover.figure} caption="введите свои коэффициенты" visual={<OddsInputs />} />
                  </div>
                  <div className="space-y-1.5 px-1">
                    <p className="text-xs text-accent">Калькулятор</p>
                    <h3 className="text-lg leading-snug font-semibold tracking-tight group-hover:text-accent">{marginTool.title}</h3>
                    <p className="text-sm leading-relaxed text-pretty text-muted">{marginTool.description}</p>
                  </div>
                </Link>
              )}
            </div>
          </section>
        );
      })}
      <p className="mt-16 text-xs text-subtle">{site.warning}</p>
    </div>
  );
}
