import Link from "next/link";
import { bookmakersByRating } from "@/lib/bookmakers";
import { BookLogo } from "./BookLogo";
import { FlipMark } from "./Logo";
import { ProbBar } from "./ProbBar";

/**
 * "Why tag.bet": every card shows a small working piece of the feature it
 * describes, drawn with the same components the site uses for real data.
 * Figures here are illustrative and labelled as an example.
 */
export function Features() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card
        wide
        title="Реальные шансы, а не мнение"
        body="Берём коэффициенты десятков мировых букмекеров, убираем маржу и получаем справедливую вероятность каждого исхода."
        visual={
          <div className="w-full space-y-4">
            <div className="flex items-center justify-between text-xs text-subtle">
              <span>Пример · победа хозяев</span>
              <span>маржа убрана</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="grid flex-1 gap-1.5">
                {[
                  ["Букмекер 1", "1.95"],
                  ["Букмекер 2", "2.00"],
                  ["Букмекер 3", "1.92"],
                ].map(([n, k]) => (
                  <div key={n} className="flex items-center justify-between rounded-lg border border-line bg-surface px-3 py-1.5 text-sm">
                    <span className="text-subtle">{n}</span>
                    <span className="font-medium tabular-nums">{k}</span>
                  </div>
                ))}
              </div>
              <span className="text-subtle" aria-hidden>→</span>
              <div className="w-24 shrink-0 text-center">
                <p className="text-4xl font-extrabold tracking-[-0.04em] tabular-nums">48%</p>
                <p className="text-xs text-subtle">честный шанс</p>
              </div>
            </div>
            <ProbBar p={{ home: 0.48, draw: 0.27, away: 0.25 }} compact />
          </div>
        }
      />
      <Card
        title="Выгодный коэффициент — отмечен"
        body="Если коэффициент легального букмекера выше справедливого, он отмечен жёлтым флипом."
        visual={
          <div className="grid w-full grid-cols-3 gap-1.5">
            <span className="odds-pill min-w-0">2.05</span>
            <span className="odds-pill min-w-0">3.40</span>
            <span className="odds-pill odds-pill-best min-w-0">
              <FlipMark className="mr-1 size-2" />
              4.10
            </span>
          </div>
        }
      />
      <Card
        title="Рейтинг команд"
        body="Независимая оценка силы по рейтингу Glicko-2 и ожидаемые голы (xG)."
        visual={
          <div className="flex w-full items-end justify-between gap-3 tabular-nums">
            <Metric label="xG хозяев" value="1.62" />
            <span className="pb-1 text-subtle">—</span>
            <Metric label="xG гостей" value="1.05" align="right" />
          </div>
        }
      />
      <Card
        title="Бонусы без мелкого шрифта"
        body="Ключевые условия — прямо на карточке, до перехода на сайт букмекера."
        visual={
          <div className="flex w-full flex-wrap gap-1.5 text-xs">
            {["сумма", "срок", "отыгрыш", "мин. коэффициент"].map((t) => (
              <span key={t} className="rounded-full border border-line bg-surface-2 px-2.5 py-1 text-muted">
                {t}
              </span>
            ))}
          </div>
        }
      />
      <div data-reveal className="card flex flex-col justify-between bg-gradient-to-br from-accent/10 to-transparent p-7">
        <p className="text-sm text-muted">Ответственная игра</p>
        <p className="mt-6 text-sm leading-relaxed">Лимиты, паузы и честные слова о рисках. Мы за то, чтобы ставить с умом, а не больше.</p>
        <Link href="/responsible-gambling" className="mt-4 text-sm text-accent hover:underline">
          Наш подход →
        </Link>
      </div>
      <Card
        wide
        title="Только легальные букмекеры"
        body="Ссылки ведут только к конторам с лицензией ФНС России. Никаких офшоров."
        visual={
          <div className="flex w-full flex-wrap items-center gap-2">
            {bookmakersByRating().map((b) => (
              <BookLogo key={b.slug} slug={b.slug} />
            ))}
            <span className="ml-1 rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-xs text-accent">лицензия ФНС</span>
          </div>
        }
      />
      <Link href="/tools" data-reveal className="card group flex flex-col justify-between p-7 transition hover:border-line-strong">
        <div className="flex items-baseline justify-between">
          <p className="text-sm text-muted">Калькуляторы</p>
          <p className="text-3xl font-extrabold tracking-[-0.04em] tabular-nums">4,2%</p>
        </div>
        <p className="mt-6 text-sm leading-relaxed">Маржа, вероятность, экспресс — проверьте любой коэффициент сами.</p>
        <span className="mt-4 text-sm text-accent group-hover:underline">Посчитать →</span>
      </Link>
    </div>
  );
}

function Card({ title, body, visual, wide = false }: { title: string; body: string; visual: React.ReactNode; wide?: boolean }) {
  return (
    <div data-reveal className={`card flex flex-col gap-6 p-7 ${wide ? "md:col-span-2 lg:flex-row lg:items-center lg:gap-10" : ""}`}>
      <div className={`flex min-h-12 items-center rounded-xl border border-line bg-surface-2/60 p-4 ${wide ? "lg:order-2 lg:w-[46%] lg:shrink-0" : ""}`}>{visual}</div>
      <div className="min-w-0 flex-1">
        <h3 className="text-xl font-semibold tracking-tight text-balance">{title}</h3>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{body}</p>
      </div>
    </div>
  );
}

function Metric({ label, value, align = "left" }: { label: string; value: string; align?: "left" | "right" }) {
  return (
    <div className={align === "right" ? "text-right" : ""}>
      <p className="text-xs text-subtle">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}
