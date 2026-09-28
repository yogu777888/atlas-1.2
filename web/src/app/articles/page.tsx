import type { Metadata } from "next";
import { ArticleCard } from "@/components/ArticleCard";
import { articles } from "@/content/articles";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Статьи о ставках: маржа, вероятность, налоги",
  description: "Коротко и с примерами: как считать маржу букмекера, переводить коэффициенты в вероятность, что такое валуйная ставка и как платить налог с выигрыша.",
  alternates: { canonical: "/articles" },
};

const order = ["Основы", "Стратегия", "Закон"] as const;

export default function ArticlesPage() {
  return (
    <div className="container-x pt-14">
      <p className="eyebrow">Статьи</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">Ставки без магии: только цифры.</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Как букмекер считает коэффициенты, где он зарабатывает и как не переплачивать. Каждая статья — с формулой и живым примером.
      </p>
      {order.map((cat) => (
        <section key={cat} className="mt-14 grid gap-6 border-t border-line pt-8 lg:grid-cols-[12rem_1fr]">
          <h2 className="text-sm font-medium text-subtle">{cat}</h2>
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2">
            {articles.filter((a) => a.category === cat).map((a) => (
              <ArticleCard key={a.slug} a={a} />
            ))}
          </div>
        </section>
      ))}
      <p className="mt-16 text-xs text-subtle">{site.warning}</p>
    </div>
  );
}
