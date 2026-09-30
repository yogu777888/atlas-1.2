import Link from "next/link";
import type { Article } from "@/content/articles";
import { paths } from "@/lib/routes";
import { Cover } from "./Cover";
import { ArticleVisual } from "./ArticleVisuals";
import { LiveCover } from "./LiveCover";

export function ArticleCard({ a }: { a: Article }) {
  return (
    <Link href={paths.article(a.slug)} data-reveal className="group flex flex-col gap-4">
      <div className="h-44 transition group-hover:-translate-y-0.5">
        <LiveCover slug={a.slug} fallback={<Cover figure={a.cover.figure} caption={a.cover.caption} visual={<ArticleVisual slug={a.slug} />} />} />
      </div>
      <div className="space-y-1.5 px-0.5">
        <p className="text-xs text-subtle">
          {a.category} · {a.minutes} мин
        </p>
        <h3 className="text-lg leading-snug font-bold tracking-tight text-balance">
          <span className="transition-[box-shadow] duration-300 group-hover:shadow-[inset_0_-0.4em_0_var(--color-hi)]">{a.title}</span>
        </h3>
        <p className="text-sm leading-relaxed text-pretty text-muted">{a.description}</p>
      </div>
    </Link>
  );
}
