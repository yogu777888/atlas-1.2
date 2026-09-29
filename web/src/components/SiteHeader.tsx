import Link from "next/link";
import { Logo } from "./Logo";
import { NavLinks, Today } from "./NavLinks";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-md">
      <div className="container-x flex h-14 items-center gap-6 lg:gap-8">
        <Link href="/" aria-label="tag.bet — на главную" className="group/logo shrink-0 [perspective:300px]">
          <Logo />
        </Link>
        <NavLinks className="hidden items-center gap-0.5 md:flex" />
        <div className="ml-auto flex items-center gap-3 text-[13px] text-muted">
          <Today className="hidden sm:inline" />
          <span className="rounded border-[1.5px] border-fg-2 px-1.5 text-[11px] leading-[18px] font-bold text-fg-2" title="Сайт только для совершеннолетних">
            18+
          </span>
        </div>
      </div>
      <NavLinks className="container-x scroll-fade -mt-1 flex overflow-x-auto pb-1.5 md:hidden" />
    </header>
  );
}
