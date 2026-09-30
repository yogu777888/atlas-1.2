import Link from "next/link";
import { bookmakersByRating } from "@/lib/bookmakers";
import { leagues } from "@/lib/leagues";
import { paths } from "@/lib/routes";
import { site } from "@/lib/site";
import { POPULAR, teamSlug } from "@/lib/teams";
import { Logo } from "./Logo";

const columns = [
  {
    title: "Прогнозы",
    links: [{ href: paths.forecasts, label: "Все прогнозы" }, ...leagues.map((l) => ({ href: paths.league(l.slug), label: l.key === "intl" ? "Матчи сборных" : l.label.replace(" УЕФА", "") }))],
  },
  {
    title: "Команды",
    links: [
      { href: paths.teams, label: "Все команды" },
      { href: paths.compare, label: "Сравнение команд" },
      ...POPULAR.slice(0, 8).map((t) => ({ href: paths.team(teamSlug(t)), label: t })),
      { href: paths.whatIf, label: "А что, если" },
    ],
  },
  {
    title: "Букмекеры",
    links: [
      { href: paths.bookmakers, label: "Рейтинг букмекеров" },
      { href: paths.bonuses, label: "Бонусы" },
      ...bookmakersByRating()
        .slice(0, 4)
        .map((b) => ({ href: paths.bookmaker(b.slug), label: b.name })),
    ],
  },
  {
    title: "Разобраться",
    links: [
      { href: paths.articles, label: "Статьи" },
      { href: paths.article("marzha-bukmekera"), label: "Маржа букмекера" },
      { href: paths.article("nalog-s-vyigrysha"), label: "Налог с выигрыша" },
      { href: paths.tools, label: "Калькуляторы" },
      { href: paths.tool("marzha"), label: "Калькулятор маржи" },
      { href: paths.tool("ekspress"), label: "Калькулятор экспресса" },
    ],
  },
  {
    title: "О сайте",
    links: [
      { href: paths.about, label: "О редакции" },
      { href: paths.method, label: "Как мы считаем" },
      { href: paths.disclosure, label: "Как мы зарабатываем" },
      { href: paths.responsible, label: "Ответственная игра" },
      { href: paths.privacy, label: "Конфиденциальность" },
      { href: paths.terms, label: "Условия использования" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="container-x grid gap-x-8 gap-y-10 py-12 sm:grid-cols-3 lg:grid-cols-[1.3fr_repeat(5,1fr)]">
        <div className="space-y-3 sm:col-span-3 lg:col-span-1">
          <Logo />
          <p className="max-w-xs text-sm text-muted">{site.tagline}: шансы на матчи топ-лиг по коэффициентам мировых букмекеров.</p>
          <p className="text-sm text-muted">
            Почта редакции:{" "}
            <a href={`mailto:${site.supportEmail}`} className="font-medium text-fg underline decoration-line-strong underline-offset-4 hover:decoration-hi">
              {site.supportEmail}
            </a>
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="mb-3 text-sm font-semibold">{col.title}</p>
            <ul className="space-y-1.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted transition-colors hover:text-fg">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="container-x space-y-2 py-6 text-xs leading-relaxed text-subtle">
          <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="rounded border border-fg-2 px-1 text-[10px] leading-4 font-bold text-fg-2">18+</span>
            <span>
              {site.warning}{" "}
              <Link className="underline underline-offset-2 hover:text-fg" href={paths.responsible}>
                Где получить помощь
              </Link>
            </span>
          </p>
          <p className="max-w-4xl">
            tag.bet — информационный сайт. Мы не принимаем ставки и не проводим азартные игры. Пишем только о букмекерах с лицензией ФНС
            России. Кнопки с пометкой «Реклама» — партнёрские ссылки: за переходы по ним букмекеры нам платят, но на шансы и оценки это не
            влияет.{" "}
            <Link href={paths.disclosure} className="underline underline-offset-2 hover:text-fg">
              Как мы зарабатываем
            </Link>
          </p>
          <p>© {new Date().getFullYear()} tag.bet</p>
        </div>
      </div>
    </footer>
  );
}
