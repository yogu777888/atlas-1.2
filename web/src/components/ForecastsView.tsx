import Link from "next/link";
import { dataSource, getMatches } from "@/lib/data";
import { leagues } from "@/lib/leagues";
import { hasValue } from "@/lib/matches";
import { paths } from "@/lib/routes";
import { site } from "@/lib/site";
import { Board, BoardLegend } from "./Board";
import { Fine, PageHead, SectionHead, Stats } from "./Page";

/** The week's forecasts: all of them, or only matches with a price above fair. */
export async function ForecastsView({ valueOnly = false }: { valueOnly?: boolean }) {
  const all = await getMatches();
  const list = valueOnly ? all.filter(hasValue) : all;
  const main = list.filter((m) => m.league.key !== "other");
  const others = list.filter((m) => m.league.key === "other");
  const chips = leagues.map((l) => ({ ...l, count: all.filter((m) => m.league.key === l.key).length })).filter((l) => l.count > 0);
  const valueCount = all.filter(hasValue).length;

  return (
    <div className="container-x">
      <PageHead
        crumbs={[{ label: "Прогнозы", href: paths.forecasts }, ...(valueOnly ? [{ label: "Выше честной цены", href: paths.valueBets }] : [])]}
        title={valueOnly ? "Коэффициенты выше честной цены" : "Прогнозы на футбол"}
        animate
        lead={
          valueOnly
            ? "Матчи недели, где легальный букмекер платит за исход больше, чем следует из шансов рынка. Это перевес на длинной дистанции, а не гарантия выигрыша в конкретном матче."
            : "Шансы на матчи ближайшей недели по коэффициентам мировых букмекеров без маржи. Откройте матч, чтобы увидеть прогноз на голы, форму команд, личные встречи и кто не сыграет."
        }
        aside={
          <Stats
            items={[
              { label: "Матчей на неделе", value: all.length },
              { label: "Выше честной цены", value: valueCount },
              ...(dataSource() === "demo" ? [{ label: "Данные", value: "демо" }] : []),
            ]}
          />
        }
      />

      <div className="mt-6 mb-3.5 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Турниры" className="flex flex-wrap gap-1.5">
          <Link href={paths.forecasts} className="chip" aria-current={!valueOnly ? "page" : undefined}>
            Все
          </Link>
          {chips.map((l) => (
            <Link key={l.key} href={paths.league(l.slug)} className="chip">
              {l.short}
              <span className="num text-[13px] opacity-70">{l.count}</span>
            </Link>
          ))}
          <Link href={paths.valueBets} className="chip" aria-current={valueOnly ? "page" : undefined}>
            <span className="size-2.5 rounded-sm bg-hi ring-1 ring-fg/10" aria-hidden />
            Выше честной цены
          </Link>
        </nav>
        <BoardLegend odds={list.some((m) => m.pari)} />
      </div>

      <Board
        matches={main.length ? main : others}
        empty={valueOnly ? "Сейчас нет коэффициентов выше честной цены. Загляните позже: линия меняется каждые несколько минут." : undefined}
      />

      {main.length > 0 && others.length > 0 && (
        <section className="mt-12">
          <SectionHead title="Другие турниры" sub="Когда в топ-лигах пауза, показываем матчи других чемпионатов, на которые уже есть коэффициенты." />
          <Board matches={others} />
        </section>
      )}

      <section className="mt-14 grid gap-8 border-t border-line pt-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <h2 className="text-xl font-extrabold tracking-tight">Как читать таблицу</h2>
        <div className="max-w-[68ch] space-y-3 text-muted prose-links">
          <p>
            Три числа слева — шансы на победу хозяев, ничью и победу гостей в процентах. Чем темнее зелёный, тем вероятнее исход. Шансы мы
            считаем по коэффициентам мировых букмекеров: переводим их в вероятности, убираем маржу и берём среднее.
          </p>
          <p>
            Справа — коэффициенты легального букмекера. Жёлтым выделены те, что выше честной цены: за этот исход букмекер платит больше, чем
            следует из шансов. Подробнее о расчёте — в разделе <Link href={paths.method}>«Как мы считаем»</Link>, а о том, почему выгодная
            ставка всё равно может проиграть, — в статье <Link href={paths.article("valuinaya-stavka")}>о валуйных ставках</Link>.
          </p>
        </div>
      </section>

      <Fine className="mt-10">Коэффициенты меняются. Перед ставкой проверьте итоговый коэффициент в купоне букмекера. {site.warning}</Fine>
    </div>
  );
}
