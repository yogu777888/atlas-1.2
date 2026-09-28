import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/ArticleCard";
import { ArticleVisual } from "@/components/ArticleVisuals";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FlipMark } from "@/components/Logo";
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
      <Breadcrumbs items={[{ label: "Статьи", href: "/articles" }, { label: a.title, href: `/articles/${a.slug}` }]} />

      <header className="mt-6 grid items-end gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <p className="text-sm text-subtle">
            {a.category} · {a.minutes} мин чтения · обновлено {dateRu(a.updated)}
          </p>
          <h1 className="mt-3 text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl">{a.title}</h1>
          <p className="mt-4 max-w-xl text-lg text-pretty text-muted">{a.description}</p>
        </div>
        <Cover figure={a.cover.figure} caption={a.cover.caption} size="lg" visual={<ArticleVisual slug={a.slug} />} />
      </header>

      <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_16rem]">
        <article className="max-w-[68ch] min-w-0 space-y-5 leading-relaxed text-muted [&_a]:text-fg [&_a]:underline [&_a]:decoration-accent/60 [&_a]:underline-offset-4 [&_a:hover]:decoration-accent [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-3">
          {a.body()}

          <section aria-labelledby="faq" className="space-y-3 pt-6">
            <h2 id="faq" className="scroll-mt-24 text-2xl font-semibold tracking-tight text-fg">
              Частые вопросы
            </h2>
            {a.faq.map((f) => (
              <details key={f.q} className="group rounded-xl border border-line bg-surface open:border-line-strong">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-medium text-fg">
                  {f.q}
                  <span className="text-subtle transition group-open:rotate-45" aria-hidden>
                    +
                  </span>
                </summary>
                <p className="px-5 pb-4 text-sm leading-relaxed">{f.a}</p>
              </details>
            ))}
          </section>

          <footer className="mt-10 flex items-start gap-4 rounded-2xl border border-line bg-surface p-5">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-surface-2">
              <FlipMark className="size-4" />
            </span>
            <div className="min-w-0 text-sm leading-relaxed">
              <p className="font-medium text-fg">Редакция tag.bet</p>
              <p className="mt-0.5">
                Пишем о ставках на цифрах: каждая формула и пример в статье проверены расчётом. Нашли ошибку — напишите на {site.supportEmail}.{" "}
                <Link href="/about">О редакции</Link> · <Link href="/methodology">Как мы считаем</Link>
              </p>
            </div>
          </footer>
        </article>
        <aside className="order-first lg:order-none">
          <nav className="lg:sticky lg:top-24" aria-label="Содержание">
            <p className="mb-3 text-xs font-medium tracking-wider text-subtle uppercase">Содержание</p>
            <ol className="space-y-2 border-l border-line text-sm">
              {[...a.toc, { id: "faq", title: "Частые вопросы" }].map((t) => (
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
            "@type": "FAQPage",
            mainEntity: a.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          }),
        }}
      />
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
            datePublished: a.updated,
            author: { "@type": "Organization", name: `Редакция ${site.name}`, url: `${site.url}/about` },
            publisher: { "@type": "Organization", name: site.name, logo: { "@type": "ImageObject", url: `${site.url}/icon.svg` } },
            mainEntityOfPage: `${site.url}/articles/${a.slug}`,
          }),
        }}
      />
    </div>
  );
}
