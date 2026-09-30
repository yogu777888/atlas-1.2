import type { Metadata } from "next";
import Link from "next/link";
import { Example, Formula, H2, Note } from "@/components/ArticleBlocks";
import { Calibration } from "@/components/Calibration";
import { PageHead } from "@/components/Page";
import { marketCheck } from "@/lib/insights";
import { MAX_CREDIBLE_EDGE } from "@/lib/matches";
import { paths } from "@/lib/routes";
import { site } from "@/lib/site";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Как мы считаем шансы на матчи и честные коэффициенты",
  description:
    "Методика tag.bet: откуда берём коэффициенты, как убираем маржу, как считаем шансы и перевес, как часто обновляются данные и насколько точен рынок.",
  alternates: { canonical: paths.method },
};

const steps = [
  { title: "Собираем коэффициенты", body: "Берём коэффициенты на исход матча у многих международных букмекеров." },
  { title: "Убираем маржу", body: "Переводим каждую линию в вероятности и приводим их сумму к 100%." },
  { title: "Усредняем", body: "Среднее по всем букмекерам — это шансы по мировому рынку." },
  { title: "Сравниваем с легальным букмекером", body: "Если его коэффициент выше честного, выделяем его жёлтым." },
];

export default async function MethodologyPage() {
  const check = await marketCheck().catch(() => null);
  return (
    <div className="container-x">
      <PageHead
        crumbs={[{ label: "Как мы считаем", href: paths.method }]}
        title="Как мы считаем"
        animate
        lead="Все цифры на tag.bet получаются из коэффициентов букмекеров по формулам, которые можно проверить самому. Экспертных мнений в расчёте нет."
      />

      <ol className="mt-6 grid gap-px overflow-hidden rounded-[10px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <li key={s.title} data-reveal className="bg-surface p-5">
            <span className="num grid size-8 place-items-center rounded-md bg-hi text-lg font-bold ring-1 ring-fg/10">{i + 1}</span>
            <h2 className="mt-4 font-bold">{s.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">{s.body}</p>
          </li>
        ))}
      </ol>

      <article className="mt-6 max-w-[68ch] space-y-5 leading-relaxed text-fg-2 prose-links [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-2">
        <H2 id="dannye">Откуда данные</H2>
        <ul>
          <li>Расписание матчей, коэффициенты международных букмекеров, результаты и рейтинг команд — из футбольного API sstats.net.</li>
          <li>Коэффициенты российского букмекера — из его публичной линии. У этого букмекера есть лицензия ФНС России.</li>
          <li>
            Названия международных букмекеров мы не показываем: у большинства из них нет лицензии в России, и их цены нужны нам только как
            ориентир рынка.
          </li>
        </ul>

        <H2 id="shansy">Шансы по мировому рынку</H2>
        <p>
          Для каждого букмекера вероятность исхода — единица, делённая на коэффициент, делённая на сумму таких вероятностей по всем исходам. Так
          из линии убирается маржа. Затем мы берём среднее по всем букмекерам.
        </p>
        <Formula note="i — исход (П1, X, П2), k — коэффициент одного букмекера">pᵢ = (1/kᵢ) / Σ(1/k)</Formula>

        <H2 id="vygoda">Коэффициент выше честной цены</H2>
        <p>Коэффициент легального букмекера выделен жёлтым, если при шансах рынка ставка по нему приносит плюс:</p>
        <Formula note="k — коэффициент легального букмекера, p — шанс по рынку">перевес = k × p − 1 &gt; 0</Formula>
        <Example title="Пример" rows={[["Шанс победы хозяев по рынку", "50,5%"], ["Коэффициент букмекера", "2.06"]]} result={["Перевес", "+4,0%"]} />
        <p>
          Перевес больше {Math.round(MAX_CREDIBLE_EDGE * 100)}% мы не выделяем: такой разрыв с рынком почти всегда означает устаревшую линию или
          ошибку в данных. На странице матча вместо процента в этом случае стоит пометка «проверяем».
        </p>

        <H2 id="goly">Голы и «обе забьют»</H2>
        <p>
          Шансы на тотал больше 2,5 гола и на то, что забьют обе команды, считаются так же: по коэффициентам международных букмекеров на эти
          рынки, без маржи и в среднем по всем.
        </p>

        <H2 id="reiting">Рейтинг команд</H2>
        <p>
          Отдельно показываем оценку по рейтингу Glicko-2 и ожидаемые голы. Рейтинг строится только по прошлым результатам и не знает о травмах
          и составах, поэтому мы используем его как второе мнение, а не как основу.
        </p>

        <H2 id="tochnost">Насколько точен рынок</H2>
        <p>
          Мы проверяем рынок на прошлом сезоне шести топ-лиг: группируем все исходы по шансу, который им давали коэффициенты закрытия линии, и
          смотрим, как часто они сбывались. Если точки лежат на диагонали, шансы честные.
        </p>
        {check ? (
          <figure className="card p-5">
            <Calibration bins={check.bins} className="max-w-[420px]" />
            <figcaption className="mt-2 text-sm text-muted">
              Сезон {check.season}, {check.games.toLocaleString("ru-RU")} матчей.
              {check.near60 &&
                ` Исходы, которым рынок давал ${Math.round(check.near60.from * 100)}–${Math.round(check.near60.to * 100)}%, сбылись в ${Math.round(check.near60.actual * 100)}% случаев.`}
              {check.demo && " Сейчас показаны демо-данные."}
            </figcaption>
          </figure>
        ) : (
          <p className="text-sm text-muted">График появится, когда загрузятся результаты прошлого сезона.</p>
        )}

        <H2 id="obnovlenie">Как часто обновляются данные</H2>
        <p>
          Списки матчей и страницы прогнозов пересчитываются раз в пять минут. Коэффициенты у букмекера могут меняться быстрее, поэтому перед
          ставкой проверяйте итоговый коэффициент в купоне.
        </p>

        <H2 id="ogranicheniya">Чего мы не обещаем</H2>
        <p>
          Шанс по рынку — это оценка, а не знание будущего. Ставка с перевесом может проиграть, и часто проигрывает: перевес проявляется только
          на сотнях ставок.
        </p>
        <Note tone="warn">
          {site.warning} <Link href={paths.responsible}>Как держать игру под контролем</Link>
        </Note>

        <H2 id="kto-my">Кто мы</H2>
        <p>
          tag.bet — независимый информационный сайт. Мы не принимаем ставки. Часть ссылок на букмекеров — партнёрские: они помечены как реклама
          и на расчёты не влияют. <Link href={paths.disclosure}>Как мы зарабатываем</Link>. Вопросы и исправления присылайте на {site.supportEmail}.
        </p>
      </article>
    </div>
  );
}
