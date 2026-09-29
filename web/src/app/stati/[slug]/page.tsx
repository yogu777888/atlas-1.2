import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/ArticleCard";
import { ArticleVisual } from "@/components/ArticleVisuals";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Cover } from "@/components/Cover";
import { FlipMark } from "@/components/Logo";
import { Faq, Fine } from "@/components/Page";
import { articles, getArticle } from "@/content/articles";
import { paths } from "@/lib/routes";
import { site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = getArticle((await params).slug);
  if (!a) return { title: "Статья не найдена" };
  return {
    title: a.title,
    description: a.description,
    alternates: { canonical: paths.article(a.slug) },
    openGraph: { type: "article", title: a.title, description: a.description, modifiedTime: a.updated },
  };
}

const dateRu = (iso: string) => new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }).replace(/\s?г\.$/, "");

export default async function ArticlePage({ params }: Props) {
  const a = getArticle((await params).slug);
  if (!a) notFound();
  const related = articles
    .filter((x) => x.slug !== a.slug && x.category === a.category)
    .concat(articles.filter((x) => x.category !== a.category))
    .slice(0, 3);

  return (
    <div className="container-x">
      <div className="pt-6 sm:pt-8">
        <Breadcrumbs
          items={[
            { label: "Статьи", href: paths.articles },
            { label: a.title, href: paths.article(a.slug) },
          ]}
        />
      </div>

      <header className="mt-6 grid items-end gap-8 border-b border-line pb-8 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <p className="text-sm text-subtle">
            {a.category} · {a.minutes} мин чтения · обновлено {dateRu(a.updated)}
          </p>
          <h1 className="mt-3 text-[clamp(30px,4.2vw,48px)] leading-[1.05] font-extrabold tracking-[-0.035em] text-balance">{a.title}</h1>
          <p className="mt-4 max-w-xl text-lg text-pretty text-muted">{a.description}</p>
        </div>
        <Cover figure={a.cover.figure} caption={a.cover.caption} size="lg" visual={<ArticleVisual slug={a.slug} />} />
      </header>

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <article className="max-w-[68ch] space-y-5 leading-relaxed text-fg-2 prose-links [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-3">
          {a.body()}
          <div className="pt-8">
            <Faq items={a.faq} />
          </div>
          <footer className="card mt-10 flex items-start gap-4 p-5">
            <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-surface-2 ring-1 ring-line">
              <FlipMark className="size-4" />
            </span>
            <div className="min-w-0 text-sm leading-relaxed">
              <p className="font-semibold text-fg">Редакция tag.bet</p>
              <p className="mt-0.5 text-muted">
                Пишем о ставках на цифрах. Каждую формулу и пример в статье мы пересчитываем перед публикацией. Нашли ошибку — напишите на{" "}
                {site.supportEmail}. <Link href={paths.about}>О редакции</Link> · <Link href={paths.method}>Как мы считаем</Link>
              </p>
            </div>
          </footer>
        </article>
        <aside className="order-first lg:order-none">
          <nav className="lg:sticky lg:top-24" aria-label="Содержание">
            <p className="mb-3 text-xs font-semibold text-fg-2">Содержание</p>
            <ol className="space-y-2 border-l-2 border-line text-sm">
              {[...a.toc, { id: "faq", title: "Частые вопросы" }].map((t) => (
                <li key={t.id}>
                  <a href={`#${t.id}`} className="-ml-[2px] block border-l-2 border-transparent pl-4 text-muted transition hover:border-hi hover:text-fg">
                    {t.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>
      </div>

      <section className="mt-20 border-t border-line pt-10">
        <h2 className="mb-6 text-2xl font-extrabold tracking-tight">Читать дальше</h2>
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((r) => (
            <ArticleCard key={r.slug} a={r} />
          ))}
        </div>
      </section>

      <Fine className="mt-12">{site.warning}</Fine>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: a.title,
            description: a.description,
            dateModified: a.updated,
            datePublished: a.updated,
            inLanguage: "ru",
            author: { "@type": "Organization", name: `Редакция ${site.name}`, url: `${site.url}${paths.about}` },
            publisher: { "@type": "Organization", name: site.name, logo: { "@type": "ImageObject", url: `${site.url}/icon.svg` } },
            mainEntityOfPage: `${site.url}${paths.article(a.slug)}`,
          }),
        }}
      />
    </div>
  );
}
