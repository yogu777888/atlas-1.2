import Link from "next/link";
import { BONUS_KINDS, type Bookmaker } from "@/lib/bookmakers";
import { BonusFacts } from "./BonusFacts";
import { BookLogo } from "./BookLogo";
import { OutboundButton } from "./OutboundButton";

export function BonusCard({ b, source }: { b: Bookmaker; source: string }) {
  const kind = BONUS_KINDS.find((k) => k.key === b.bonus.kind)?.label;
  return (
    <article className="card flex flex-col p-5 transition hover:border-line-strong">
      <div className="mb-5 flex items-center gap-3">
        <BookLogo slug={b.slug} />
        <div className="min-w-0 flex-1">
          <Link href={`/bookmakers/${b.slug}`} className="font-medium hover:underline">
            {b.name}
          </Link>
          <p className="text-xs text-subtle">Лицензия ФНС России</p>
        </div>
        {kind && <span className="shrink-0 rounded-full border border-line px-2.5 py-0.5 text-[11px] text-muted">{kind}</span>}
      </div>
      <h3 className="text-lg leading-snug font-semibold tracking-tight text-balance">{b.bonus.headline}</h3>
      <p className="mt-1.5 text-sm text-muted">{b.bonus.detail}</p>
      <div className="mt-5">
        <BonusFacts bonus={b.bonus} />
      </div>
      <div className="mt-auto pt-5">
        <OutboundButton b={b} source={source} label="Получить бонус" className="w-full" />
        {b.bonus.terms && <p className="mt-3 text-[11px] leading-snug text-subtle">{b.bonus.terms}</p>}
      </div>
    </article>
  );
}
