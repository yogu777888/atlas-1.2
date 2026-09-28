import Link from "next/link";
import { FlipText } from "@/components/FlipText";

export default function NotFound() {
  return (
    <div className="container-x flex flex-col items-center py-28 text-center">
      <div className="flex gap-2" aria-label="404">
        {["4", "0", "4"].map((d, i) => (
          <span
            key={i}
            className="relative grid h-24 w-16 place-items-center rounded-xl border border-line bg-surface-2 text-6xl font-extrabold tabular-nums sm:h-28 sm:w-20 sm:text-7xl"
          >
            <FlipText text={d} delay={150 + i * 160} />
            <span className="absolute inset-x-0 top-1/2 h-px bg-bg" aria-hidden />
          </span>
        ))}
      </div>
      <h1 className="mt-10 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">Такого матча нет в линии.</h1>
      <p className="mt-3 max-w-md text-muted">Страница переехала или матч уже начался. Вот что есть прямо сейчас:</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/matches" className="btn-primary">
          Ближайшие матчи
        </Link>
        <Link href="/articles" className="btn-ghost">
          Статьи
        </Link>
        <Link href="/tools" className="btn-ghost">
          Калькуляторы
        </Link>
      </div>
    </div>
  );
}
