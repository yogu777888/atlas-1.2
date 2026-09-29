import Link from "next/link";
import { marginText, type Bookmaker } from "@/lib/bookmakers";
import { paths } from "@/lib/routes";
import { BookLogo } from "./BookLogo";
import { OutboundButton } from "./OutboundButton";
import { Rating } from "./Rating";

/** One line of the bookmaker rating: place, logo and name, the bonus in a phrase, score, margin, button. */
export function BookmakerRow({ b, rank, source }: { b: Bookmaker; rank: number; source: string }) {
  return (
    <div data-reveal className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3 px-5 py-4 transition-colors hover:bg-surface-2 sm:grid-cols-[2rem_auto_minmax(0,1fr)_auto_11rem]">
      <span className="num hidden text-xl font-bold text-subtle sm:block">{rank}</span>
      <BookLogo slug={b.slug} />
      <div className="min-w-0">
        <Link href={paths.bookmaker(b.slug)} className="font-semibold underline decoration-transparent decoration-2 underline-offset-4 transition hover:decoration-hi">
          {b.name}
        </Link>
        <p className="truncate text-sm text-muted">{b.bonus.headline}</p>
      </div>
      <div className="col-span-2 flex items-center justify-between gap-5 sm:col-span-1 sm:justify-end">
        <Rating value={b.rating} />
        <span className="text-xs text-subtle">маржа {marginText(b)}</span>
      </div>
      <div className="col-span-2 sm:col-span-1">
        <OutboundButton b={b} source={source} label={`Перейти в ${b.name}`} className="h-9 w-full" />
      </div>
    </div>
  );
}

/** Compact top list for side columns: logo, name, the bonus in a phrase, score. */
export function BookmakerMini({ list }: { list: Bookmaker[] }) {
  return (
    <ul className="divide-y divide-line">
      {list.map((b) => (
        <li key={b.slug}>
          <Link href={paths.bookmaker(b.slug)} className="group grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-3 py-2.5">
            <BookLogo slug={b.slug} />
            <span className="min-w-0">
              <b className="block text-sm font-semibold group-hover:underline group-hover:decoration-hi group-hover:decoration-2 group-hover:underline-offset-4">{b.name}</b>
              <small className="block truncate text-xs text-muted">{b.bonus.headline}</small>
            </span>
            <span className="num text-xl font-bold">{b.rating.toFixed(1)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
