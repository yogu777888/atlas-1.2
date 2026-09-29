import type { Metadata } from "next";
import Link from "next/link";
import { Example, Formula, H2, Note } from "@/components/ArticleBlocks";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Как мы считаем шансы и выгодные коэффициенты",
  description: "Методика tag.bet: откуда берутся данные, как убирается маржа, как считается честный шанс и выгодный коэффициент, как часто обновляются цифры.",
  alternates: { canonical: "/methodology" },
};

const steps = [
  { n: "1", title: "Собираем коэффициенты", body: "Берём коэффициенты на исход матча у многих международных букмекеров." },
  { n: "2", title: "Убираем маржу", body: "Переводим каждую линию в вероятности и приводим их сумму к 100%." },
  { n: "3", title: "Усредняем", body: "Среднее по многим конторам — наша оценка честного шанса." },
  { n: "4", title: "Сравниваем с линией букмекера", body: "Если коэффициент легального букмекера выше честного — отмечаем его." },
];

export default function MethodologyPage() {
  return (
    <div className="container-x pt-14">
      <p className="eyebrow">Методика</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">Как мы считаем.</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Никаких «экспертов» и «инсайдов». Все цифры на tag.bet получаются из коэффициентов по формулам ниже — их можно проверить
        самостоятельно.
      </p>

      <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s) => (
          <li key={s.n} className="card p-6">
            <span className="grid size-8 place-items-center rounded-lg bg-accent text-sm font-bold text-accent-ink">{s.n}</span>
            <h2 className="mt-5 font-semibold tracking-tight">{s.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.body}</p>
          </li>
        ))}
      </ol>

      <article className="mt-8 max-w-[68ch] space-y-5 leading-relaxed text-muted [&_a]:text-fg [&_a]:underline [&_a]:decoration-accent/60 [&_a]:underline-offset-4 [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-2">
        <H2 id="dannye">Откуда данные</H2>
        <ul>
          <li>Коэффициенты международных букмекеров, расписание матчей и рейтинг команд — из открытого футбольного API sstats.net.</li>
          <li>Коэффициенты российского букмекера — из его публичной линии. У букмекера есть лицензия ФНС России.</li>
          <li>Названия международных букмекеров мы не показываем: большинство из них не имеет лицензии в России, и мы используем их цены только как ориентир рынка.</li>
        </ul>

        <H2 id="shans">Честный шанс</H2>
        <p>Для каждого букмекера вероятность исхода — единица, делённая на коэффициент, делённая на сумму таких вероятностей по всем исходам. Так из линии убирается маржа. Затем мы берём среднее по всем букмекерам.</p>
        <Formula note="i — исход (П1, X, П2), k — коэффициент одного букмекера">pᵢ = (1/kᵢ) / Σ(1/k)</Formula>

        <H2 id="vygoda">Выгодный коэффициент</H2>
        <p>Коэффициент букмекера отмечен жёлтым, если ставка по нему приносит плюс при честном шансе:</p>
        <Formula note="k — коэффициент легального букмекера, p — честный шанс">перевес = k × p − 1 &gt; 0</Formula>
        <Example title="Пример" rows={[["Честный шанс П1", "50,5%"], ["Коэффициент букмекера", "2.06"]]} result={["Перевес", "+4,0%"]} />

        <H2 id="reiting">Рейтинг команд</H2>
        <p>
          Отдельно показываем оценку по рейтингу Glicko-2 и ожидаемые голы (xG). Рейтинг строится только по прошлым результатам и не
          знает о травмах и составах, поэтому мы используем его как второе мнение, а не как основу.
        </p>

        <H2 id="obnovlenie">Как часто обновляется</H2>
        <p>Страницы матчей и списки пересчитываются примерно раз в 5 минут. Коэффициенты у букмекера могут меняться быстрее — перед ставкой всегда проверяйте итоговый коэффициент в купоне.</p>

        <H2 id="ogranicheniya">Чего мы не обещаем</H2>
        <p>Честный шанс — это оценка рынка, а не знание будущего. Ставка с перевесом может проиграть, и часто проигрывает. Перевес проявляется только на большом числе ставок.</p>
        <Note tone="warn">
          {site.warning} <Link href="/responsible-gambling">Как держать игру под контролем</Link>.
        </Note>

        <H2 id="kto-my">Кто мы</H2>
        <p>
          tag.bet — независимый информационный сервис. Мы не принимаем ставки. Часть ссылок на букмекеров — партнёрские и помечены как
          реклама; это не влияет на расчёты. <Link href="/disclosure">Как мы зарабатываем</Link>. Вопросы и исправления: {site.supportEmail}.
        </p>
      </article>
    </div>
  );
}
