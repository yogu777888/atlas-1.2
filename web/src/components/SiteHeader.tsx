import Link from "next/link";
import { nav } from "@/lib/site";
import { Logo } from "./Logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/70 backdrop-blur-xl">
      <div className="container-x flex h-14 items-center justify-between gap-4">
        <Link href="/" aria-label="tag.bet — главная" className="group/logo">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Основное меню">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-link rounded-full px-3 py-1.5 text-sm text-muted transition hover:text-fg"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/matches?value=1" className="btn-primary h-8 gap-1.5 px-4 text-[13px]">
            Выгодные кэфы
          </Link>
        </div>
      </div>
      <nav className="container-x flex gap-1 overflow-x-auto pb-2 md:hidden" aria-label="Основное меню">
        {nav.map((item) => (
          <Link key={item.href} href={item.href} className="shrink-0 rounded-full px-3 py-1 text-sm text-muted hover:text-fg">
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
