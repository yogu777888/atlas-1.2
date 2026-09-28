import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/ArticleCard";
import { Cover } from "@/components/Cover";
import { articles, getArticle } from "@/content/articles";
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
    alternates: { canonical: `/articles/${a.slug}` },
    openGraph: { type: "article", title: a.title, description: a.description, modifiedTime: a.updated },
  };
}

const dateRu = (iso: string) => new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });

export default async function ArticlePage({ params }: Props) {
  const a = getArticle((await params).slug);
  if (!a) notFound();
  const related = articles.filter((x) => x.slug !== a.slug && x.category === a.category).concat(articles.filter((x) => x.category !== a.category)).slice(0, 3);

  return (
    <div className="container-x pt-12">
      <Link href="/articles" className="text-sm text-muted hover:text-fg">
        ← Статьи
      </Link>

      <header className="mt-6 grid items-end gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <p className="text-sm text-subtle">
            {a.category} · {a.minutes} мин чтения · обновлено {dateRu(a.updated)}
          </p>
          <h1 className="mt-3 text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl">{a.title}</h1>
          <p className="mt-4 max-w-xl text-lg text-pretty text-muted">{a.description}</p>
        </div>
        <Cover figure={a.cover.figure} caption={a.cover.caption} size="lg" />
      </header>

      <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_16rem]">
        <article className="max-w-[68ch] min-w-0 space-y-5 leading-relaxed text-muted [&_a]:text-fg [&_a]:underline [&_a]:decoration-accent/60 [&_a]:underline-offset-4 [&_a:hover]:decoration-accent [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-3">
          {a.body()}
        </article>
        <aside className="order-first lg:order-none">
          <nav className="lg:sticky lg:top-24" aria-label="Содержание">
            <p className="mb-3 text-xs font-medium tracking-wider text-subtle uppercase">Содержание</p>
            <ol className="space-y-2 border-l border-line text-sm">
              {a.toc.map((t) => (
                <li key={t.id}>
                  <a href={`#${t.id}`} className="-ml-px block border-l border-transparent pl-4 text-muted transition hover:border-accent hover:text-fg">
                    {t.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>
      </div>

      <section className="mt-24 border-t border-line pt-12">
        <h2 className="mb-8 text-2xl font-semibold tracking-tight">Читать дальше</h2>
        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((r) => (
            <ArticleCard key={r.slug} a={r} />
          ))}
        </div>
      </section>

      <p className="mt-12 text-xs text-subtle">{site.warning}</p>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: a.title,
            description: a.description,
            dateModified: a.updated,
            inLanguage: "ru",
            author: { "@type": "Organization", name: site.name, url: site.url },
            publisher: { "@type": "Organization", name: site.name, logo: { "@type": "ImageObject", url: `${site.url}/icon.svg` } },
            mainEntityOfPage: `${site.url}/articles/${a.slug}`,
          }),
        }}
      />
    </div>
  );
}
