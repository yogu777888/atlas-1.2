import type { Metadata } from "next";
import Link from "next/link";
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
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {tools.map((t) => (
          <Link key={t.slug} href={`/tools/${t.slug}`} className="group card flex flex-col gap-5 p-4 transition hover:border-line-strong">
            <div className="h-36">
              <Cover figure={t.cover.figure} caption={t.cover.caption} />
            </div>
            <div className="space-y-1.5 px-2 pb-2">
              <h2 className="text-lg font-semibold tracking-tight group-hover:text-accent">{t.title}</h2>
              <p className="text-sm leading-relaxed text-muted">{t.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
