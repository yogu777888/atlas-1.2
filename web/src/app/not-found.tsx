import Link from "next/link";
import { FlipText } from "@/components/FlipText";
import { paths } from "@/lib/routes";

export default function NotFound() {
  return (
    <div className="container-x flex flex-col items-center py-24 text-center">
      <div className="flex gap-2 [perspective:400px]" aria-label="404">
        {["4", "0", "4"].map((d, i) => (
          <span key={i} className="num relative grid h-24 w-16 place-items-center rounded-lg bg-surface text-7xl font-bold ring-1 ring-line sm:h-28 sm:w-20 sm:text-8xl">
            <FlipText text={d} delay={150 + i * 160} />
            <span className="absolute inset-x-0 top-1/2 h-px bg-line" aria-hidden />
          </span>
        ))}
      </div>
      <h1 className="mt-10 text-[clamp(26px,3.4vw,36px)] font-extrabold tracking-[-0.03em] text-balance">Такой страницы нет</h1>
      <p className="mt-3 max-w-md text-muted">Возможно, адрес изменился: раньше разделы сайта назывались по-английски. Вот что есть сейчас.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <Link href={paths.forecasts} className="btn-primary">
          Прогнозы на неделю
        </Link>
        <Link href={paths.teams} className="btn-ghost">
          Команды
        </Link>
        <Link href={paths.articles} className="btn-ghost">
          Статьи
        </Link>
      </div>
    </div>
  );
}
