import type { Metadata } from "next";
import Link from "next/link";
import { ToolVisual } from "@/components/ArticleVisuals";
import { Cover } from "@/components/Cover";
import { PageHead } from "@/components/Page";
import { paths } from "@/lib/routes";
import { tools } from "@/lib/tools";

export const metadata: Metadata = {
  title: "Калькуляторы ставок: маржа, вероятность, экспресс",
  description: "Бесплатные калькуляторы для ставок на спорт: маржа букмекера, перевод коэффициента в вероятность и расчёт экспресса. Считают прямо в браузере.",
  alternates: { canonical: paths.tools },
};

export default function ToolsPage() {
  return (
    <div className="container-x">
      <PageHead
        crumbs={[{ label: "Калькуляторы", href: paths.tools }]}
        title="Калькуляторы ставок"
        animate
        lead="Три калькулятора, которые показывают, сколько на самом деле стоит ставка: маржу букмекера, вероятность за коэффициентом и цену экспресса. Считают прямо в браузере."
      />
      <div className="mt-6 grid gap-x-6 gap-y-10 md:grid-cols-3">
        {tools.map((t) => (
          <Link key={t.slug} href={paths.tool(t.slug)} data-reveal className="group flex flex-col gap-4">
            <div className="h-44 transition group-hover:-translate-y-0.5">
              <Cover figure={t.cover.figure} caption={t.cover.caption} visual={<ToolVisual slug={t.slug} />} />
            </div>
            <div className="space-y-1.5 px-0.5">
              <h2 className="text-lg leading-snug font-bold tracking-tight text-balance">
                <span className="transition-[box-shadow] duration-300 group-hover:shadow-[inset_0_-0.4em_0_var(--color-hi)]">{t.title}</span>
              </h2>
              <p className="text-sm leading-relaxed text-pretty text-muted">{t.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
