import Link from "next/link";
import type { Article } from "@/content/articles";
import { ArticleVisual } from "./ArticleVisuals";
import { Cover } from "./Cover";

export function ArticleCard({ a }: { a: Article }) {
  return (
    <Link href={`/articles/${a.slug}`} data-reveal className="group flex flex-col gap-4">
      <div className="h-44 transition group-hover:-translate-y-0.5">
        <Cover figure={a.cover.figure} caption={a.cover.caption} visual={<ArticleVisual slug={a.slug} />} />
      </div>
      <div className="space-y-1.5 px-1">
        <p className="text-xs text-subtle">
          {a.category} · {a.minutes} мин
        </p>
        <h3 className="text-lg leading-snug font-semibold tracking-tight text-balance group-hover:text-accent">{a.title}</h3>
        <p className="text-sm leading-relaxed text-pretty text-muted">{a.description}</p>
      </div>
    </Link>
  );
}
