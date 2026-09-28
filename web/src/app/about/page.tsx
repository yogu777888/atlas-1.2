import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FlipMark } from "@/components/Logo";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "О редакции",
  description: "Кто делает tag.bet, как мы пишем и проверяем материалы, откуда берём данные и как исправляем ошибки.",
  alternates: { canonical: "/about" },
};

const principles = [
  { t: "Цифры вместо мнений", d: "Мы не даём прогнозов «от экспертов». Шансы, маржа и перевес считаются по открытым формулам, которые можно проверить." },
  { t: "Не обещаем выигрыш", d: "Ставки — это риск. Даже выгодная на дистанции ставка может проиграть, и мы пишем об этом прямо." },
  { t: "Только легальные букмекеры", d: "Рассказываем только о конторах с лицензией ФНС России и не ссылаемся на офшоры." },
  { t: "Реклама помечена", d: "Партнёрские ссылки отмечены как реклама. Вознаграждение партнёров не влияет на расчёты." },
];

export default function AboutPage() {
  return (
    <div className="container-x pt-12">
      <Breadcrumbs items={[{ label: "О редакции", href: "/about" }]} />
      <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">О редакции.</h1>
      <p className="mt-3 max-w-2xl text-muted">
        tag.bet — независимый информационный сервис о ставках на спорт. Мы не принимаем ставки и не храним деньги игроков. Наша задача —
        чтобы вы понимали, сколько на самом деле стоит ставка, до того как её сделать.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {principles.map((p) => (
          <div key={p.t} className="card p-6">
            <FlipMark className="size-3" />
            <h2 className="mt-4 font-semibold tracking-tight">{p.t}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{p.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 max-w-[68ch] space-y-8 leading-relaxed text-muted [&_a]:text-fg [&_a]:underline [&_a]:decoration-accent/60 [&_a]:underline-offset-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-fg">
        <section className="space-y-3">
          <h2>Как мы пишем</h2>
          <p>
            Каждая статья строится вокруг расчёта: формула, пример с реальными числами и вывод, который из него следует. Примеры мы
            пересчитываем перед публикацией. На странице статьи указана дата последнего обновления.
          </p>
          <p>Правовые темы — налоги, лицензии — мы сверяем с официальными источниками: сайтом ФНС России и текстами законов, и даём ссылки на них.</p>
        </section>
        <section className="space-y-3">
          <h2>Откуда данные</h2>
          <p>
            Коэффициенты, расписание и рейтинги команд — из открытого футбольного API sstats.net, коэффициенты PARI — из публичной линии
            букмекера. Подробно о расчётах — на странице <Link href="/methodology">«Как мы считаем»</Link>.
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
            Некоторые букмекеры платят нам за привлечённых клиентов. Такие ссылки помечены как реклама. Подробнее —{" "}
            <Link href="/disclosure">«Как мы зарабатываем»</Link>.
          </p>
        </section>
        <p className="text-sm">
          {site.warning} <Link href="/responsible-gambling">Ответственная игра</Link>.
        </p>
      </div>
    </div>
  );
}
