import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/ArticleCard";
import { ArticleVisual, OddsInputs } from "@/components/ArticleVisuals";
import { Cover } from "@/components/Cover";
import { Fine, PageHead } from "@/components/Page";
import { articles, getArticle, type Article } from "@/content/articles";
import { paths } from "@/lib/routes";
import { site } from "@/lib/site";
import { tools } from "@/lib/tools";

export const metadata: Metadata = {
  title: "Статьи о ставках на спорт: маржа, коэффициенты, налоги",
  description:
    "Как букмекер считает коэффициенты, сколько вы переплачиваете из-за маржи, что такое валуйная ставка и как платить налог с выигрыша. С формулами и примерами.",
  alternates: { canonical: paths.articles },
};

const FEATURED = "marzha-bukmekera";

const sections: { cat: Article["category"]; about: string }[] = [
  { cat: "Основы", about: "Как устроен коэффициент и где в нём прячется маржа." },
  { cat: "Стратегия", about: "Когда ставка выгодна, а когда это только кажется." },
  { cat: "Закон", about: "Налоги, лицензии и как отличить легального букмекера от офшора." },
];

export default function ArticlesPage() {
  const featured = getArticle(FEATURED)!;
  const marginTool = tools.find((t) => t.slug === "marzha")!;

  return (
    <div className="container-x">
      <PageHead
        crumbs={[{ label: "Статьи", href: paths.articles }]}
        title="Статьи о ставках"
        animate
        lead="Как устроены коэффициенты, где в них комиссия букмекера и как не переплачивать. В каждой статье есть формула, пример с настоящими числами и калькулятор, чтобы проверить на своих."
      />

      <Link href={paths.article(featured.slug)} className="card group mt-8 grid items-center gap-6 p-3 transition-colors hover:border-line-strong md:grid-cols-[1.1fr_1fr] md:gap-8 md:p-4">
        <Cover figure={featured.cover.figure} caption={featured.cover.caption} size="lg" visual={<ArticleVisual slug={featured.slug} />} />
        <div className="space-y-3 px-2 pb-3 md:px-3 md:pb-0">
          <span className="kicker">
            <span className="size-2.5 rounded-sm bg-hi ring-1 ring-fg/10" aria-hidden />
            Начните отсюда
          </span>
          <h2 className="text-[clamp(24px,3vw,32px)] leading-tight font-extrabold tracking-[-0.03em] text-balance">
            <span className="transition-[box-shadow] duration-300 group-hover:shadow-[inset_0_-0.4em_0_var(--color-hi)]">{featured.title}</span>
          </h2>
          <p className="text-pretty text-muted">{featured.description}</p>
          <p className="text-sm text-subtle">
            {featured.category} · {featured.minutes} мин чтения
          </p>
        </div>
      </Link>

      {sections.map(({ cat, about }) => {
        const list = articles.filter((a) => a.category === cat && a.slug !== FEATURED);
        return (
          <section key={cat} className="mt-block grid gap-6 border-t border-line pt-8 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-10">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <h2 className="text-xl font-extrabold tracking-tight">{cat}</h2>
              <p className="mt-1 max-w-xs text-sm text-muted">{about}</p>
            </div>
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2">
              {list.map((a) => (
                <ArticleCard key={a.slug} a={a} />
              ))}
              {/* The basics keep a slot for the calculator that goes with the featured article */}
              {cat === "Основы" && (
                <Link href={paths.tool(marginTool.slug)} data-reveal className="group flex flex-col gap-4">
                  <div className="h-44 transition group-hover:-translate-y-0.5">
                    <Cover figure={marginTool.cover.figure} caption="введите свои коэффициенты" visual={<OddsInputs />} />
                  </div>
                  <div className="space-y-1.5 px-0.5">
                    <p className="text-xs text-subtle">Калькулятор</p>
                    <h3 className="text-lg leading-snug font-bold tracking-tight">
                      <span className="transition-[box-shadow] duration-300 group-hover:shadow-[inset_0_-0.4em_0_var(--color-hi)]">{marginTool.title}</span>
                    </h3>
                    <p className="text-sm leading-relaxed text-pretty text-muted">{marginTool.description}</p>
                  </div>
                </Link>
              )}
            </div>
          </section>
        );
      })}
      <Fine className="mt-12">{site.warning}</Fine>
    </div>
  );
}
