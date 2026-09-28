import type { Metadata } from "next";
import Link from "next/link";
import { ToolVisual } from "@/components/ArticleVisuals";
import { Cover } from "@/components/Cover";
import { tools } from "@/lib/tools";

export const metadata: Metadata = {
  title: "Калькуляторы ставок: маржа, вероятность, экспресс",
  description: "Бесплатные калькуляторы для ставок на спорт: маржа букмекера, перевод коэффициента в вероятность, расчёт экспресса.",
  alternates: { canonical: "/tools" },
};

export default function ToolsPage() {
  return (
    <div className="container-x pt-14">
      <p className="eyebrow">Калькуляторы</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">Посчитайте, прежде чем ставить.</h1>
      <p className="mt-3 max-w-2xl text-muted">Три инструмента, которые показывают, сколько на самом деле стоит ставка. Работают прямо в браузере.</p>
      <div className="mt-12 grid gap-x-6 gap-y-12 md:grid-cols-3">
        {tools.map((t) => (
          <Link key={t.slug} href={`/tools/${t.slug}`} className="group flex flex-col gap-4">
            <div className="h-44 transition group-hover:-translate-y-0.5">
              <Cover figure={t.cover.figure} caption={t.cover.caption} visual={<ToolVisual slug={t.slug} />} />
            </div>
            <div className="space-y-1.5 px-1">
              <p className="text-xs text-accent">Калькулятор</p>
              <h2 className="text-lg leading-snug font-semibold tracking-tight text-balance group-hover:text-accent">{t.title}</h2>
              <p className="text-sm leading-relaxed text-pretty text-muted">{t.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
