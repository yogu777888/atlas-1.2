import Link from "next/link";
import { site } from "@/lib/site";
import { Logo } from "./Logo";

const columns = [
  { title: "Сервис", links: [{ href: "/matches", label: "Матчи" }, { href: "/matches?league=rpl", label: "РПЛ" }, { href: "/matches?league=ucl", label: "Лига чемпионов" }, { href: "/bonuses", label: "Бонусы" }] },
  { title: "Букмекеры", links: [{ href: "/bookmakers", label: "Рейтинг" }, { href: "/bookmakers/fonbet", label: "Фонбет" }, { href: "/bookmakers/pari", label: "PARI" }, { href: "/bookmakers/winline", label: "Winline" }] },
  { title: "Полезное", links: [{ href: "/articles", label: "Статьи" }, { href: "/tools/marzha", label: "Калькулятор маржи" }, { href: "/tools/veroyatnost", label: "Конвертер коэффициентов" }, { href: "/tools/ekspress", label: "Калькулятор экспресса" }] },
  { title: "О сайте", links: [{ href: "/methodology", label: "Как мы считаем" }, { href: "/responsible-gambling", label: "Ответственная игра" }, { href: "/disclosure", label: "Как мы зарабатываем" }, { href: "/privacy", label: "Конфиденциальность" }, { href: "/terms", label: "Условия использования" }] },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-muted">{site.description}</p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="mb-3 text-sm font-medium">{col.title}</p>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted transition hover:text-fg">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="container-x space-y-3 py-8 text-xs leading-relaxed text-subtle">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="rounded border border-line-strong px-1.5 py-0.5 font-mono text-[11px] text-muted">18+</span>
            <span>
              {site.warning}{" "}
              <Link className="underline hover:text-fg" href="/responsible-gambling">
                Где получить помощь
              </Link>
            </span>
          </p>
          <p>
            tag.bet — независимый информационный сервис. Мы не принимаем ставки и не проводим азартные игры. На сайте
            представлены только букмекеры с лицензией ФНС России. Некоторые ссылки являются рекламой и помечены
            соответствующим образом; вознаграждение партнёров не влияет на расчёт шансов и оценки коэффициентов.{" "}
            <Link href="/disclosure" className="underline hover:text-fg">
              Подробнее
            </Link>
            .
          </p>
          <p>© {new Date().getFullYear()} tag.bet</p>
        </div>
      </div>
    </footer>
  );
}
