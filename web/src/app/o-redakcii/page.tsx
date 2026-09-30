import type { Metadata } from "next";
import Link from "next/link";
import { FlipMark } from "@/components/Logo";
import { PageHead } from "@/components/Page";
import { paths } from "@/lib/routes";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "О редакции tag.bet",
  description: "Кто делает tag.bet, как мы пишем и проверяем материалы, откуда берём данные, как исправляем ошибки и как зарабатываем.",
  alternates: { canonical: paths.about },
};

const principles = [
  { t: "Цифры вместо мнений", d: "Мы не публикуем прогнозы «от экспертов». Шансы, маржа и перевес считаются по открытым формулам, которые можно проверить." },
  { t: "Не обещаем выигрыш", d: "Ставки — это риск. Даже выгодная на дистанции ставка может проиграть, и мы пишем об этом прямо." },
  { t: "Только легальные букмекеры", d: "Пишем только о букмекерах с лицензией ФНС России и не ссылаемся на офшоры." },
  { t: "Реклама помечена", d: "Партнёрские ссылки отмечены как реклама. Вознаграждение партнёров не влияет на шансы и оценки." },
];

export default function AboutPage() {
  return (
    <div className="container-x">
      <PageHead
        crumbs={[{ label: "О редакции", href: paths.about }]}
        title="О редакции"
        animate
        lead="tag.bet — независимый информационный сайт о ставках на футбол. Мы не принимаем ставки и не храним деньги игроков. Наша задача — чтобы вы понимали, сколько на самом деле стоит ставка, до того как её сделать."
      />

      <div className="mt-6 grid gap-px overflow-hidden rounded-[10px] border border-line bg-line sm:grid-cols-2">
        {principles.map((p) => (
          <div key={p.t} data-reveal className="bg-surface p-5">
            <FlipMark className="size-4" />
            <h2 className="mt-3 font-bold">{p.t}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">{p.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-block max-w-[68ch] space-y-8 leading-relaxed text-fg-2 prose-links [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:tracking-tight [&_h2]:text-fg">
        <section className="space-y-3">
          <h2>Как мы пишем</h2>
          <p>
            Каждая статья строится вокруг расчёта: формула, пример с настоящими числами и вывод, который из него следует. Примеры мы
            пересчитываем перед публикацией, а на странице статьи указана дата последнего обновления.
          </p>
          <p>Правовые темы — налоги и лицензии — сверяем с официальными источниками: сайтом ФНС России и текстами законов.</p>
        </section>
        <section className="space-y-3">
          <h2>Откуда данные</h2>
          <p>
            Расписание, результаты, коэффициенты международных букмекеров и рейтинг команд — из футбольного API sstats.net. Коэффициенты
            легального букмекера — из его публичной линии. Подробно о расчётах — на странице <Link href={paths.method}>«Как мы считаем»</Link>.
          </p>
        </section>
        <section className="space-y-3">
          <h2>Исправления</h2>
          <p>
            Если вы нашли ошибку в цифрах или устаревшие условия, напишите на <b className="text-fg">{site.supportEmail}</b>. Мы проверим и
            исправим материал, а дата обновления на странице изменится.
          </p>
        </section>
        <section className="space-y-3">
          <h2>Как мы зарабатываем</h2>
          <p>
            Некоторые букмекеры платят нам за новых клиентов. Такие ссылки помечены как реклама. Подробнее — на странице{" "}
            <Link href={paths.disclosure}>«Как мы зарабатываем»</Link>.
          </p>
        </section>
        <p className="text-sm text-muted">
          {site.warning} <Link href={paths.responsible}>Ответственная игра</Link>
        </p>
      </div>
    </div>
  );
}
