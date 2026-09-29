import Link from "next/link";
import { BONUS_KINDS, type Bookmaker } from "@/lib/bookmakers";
import { paths } from "@/lib/routes";
import { BonusFacts } from "./BonusFacts";
import { BookLogo } from "./BookLogo";
import { OutboundButton } from "./OutboundButton";

export function BonusCard({ b, source }: { b: Bookmaker; source: string }) {
  const kind = BONUS_KINDS.find((k) => k.key === b.bonus.kind)?.label;
  return (
    <article data-reveal className="card flex flex-col p-5 transition-colors hover:border-line-strong">
      <div className="mb-4 flex items-center gap-3">
        <BookLogo slug={b.slug} />
        <div className="min-w-0 flex-1">
          <Link href={paths.bookmaker(b.slug)} className="font-semibold underline decoration-transparent decoration-2 underline-offset-4 transition hover:decoration-hi">
            {b.name}
          </Link>
          <p className="text-xs text-subtle">Лицензия ФНС России</p>
        </div>
        {kind && <span className="shrink-0 rounded-md bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-muted ring-1 ring-line">{kind}</span>}
      </div>
      <h3 className="text-lg leading-snug font-bold tracking-tight text-balance">{b.bonus.headline}</h3>
      <p className="mt-1.5 line-clamp-2 min-h-[2lh] text-sm text-muted">{b.bonus.detail}</p>
      <div className="mt-4">
        <BonusFacts bonus={b.bonus} />
      </div>
      <div className="mt-auto pt-4">
        <OutboundButton b={b} source={source} label="Получить бонус" className="w-full" fallback={{ label: "Условия бонуса", href: `${paths.bookmaker(b.slug)}#bonus` }} />
        {b.bonus.terms && <p className="mt-3 text-[11px] leading-snug text-subtle">{b.bonus.terms}</p>}
      </div>
    </article>
  );
}
