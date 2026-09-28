import { BookLogo } from "./BookLogo";

/**
 * One small drawing per article, shown in the cover's top-right corner. Each
 * draws the article's idea with the site's own pieces (odds tiles, the flip,
 * the probability bar) rather than decoration.
 */
export function ArticleVisual({ slug }: { slug: string }) {
  switch (slug) {
    case "marzha-bukmekera":
      return <Overflow />;
    case "koefficient-v-veroyatnost":
      return <Donut />;
    case "valuinaya-stavka":
      return <Ruler />;
    case "ekspress-matematika":
      return <Multiply />;
    case "nalog-s-vyigrysha":
      return <Receipt />;
    case "kak-proverit-bukmekera":
      return <Licensed />;
    default:
      return null;
  }
}

/** Drawing for each calculator. */
export function ToolVisual({ slug }: { slug: string }) {
  if (slug === "marzha") return <OddsInputs />;
  if (slug === "veroyatnost") return <Formats />;
  if (slug === "ekspress") return <Multiply />;
  return null;
}

/** One price in four notations. */
function Formats() {
  return (
    <div className="flex items-center gap-1 text-xs font-semibold tabular-nums" aria-hidden>
      {["1.90", "9/10", "−111"].map((k) => (
        <span key={k} className="rounded-md border border-line bg-surface px-1.5 py-1">
          {k}
        </span>
      ))}
      <span className="rounded-md border border-accent/60 bg-surface px-1.5 py-1 text-accent">52,6%</span>
    </div>
  );
}

/** The margin calculator's three inputs. */
export function OddsInputs() {
  return (
    <div className="flex gap-1.5 text-xs font-semibold tabular-nums" aria-hidden>
      {["1.90", "3.60", "4.20"].map((k, i) => (
        <span key={k} className={`rounded-md border bg-surface px-2 py-1 ${i === 2 ? "border-accent/60" : "border-line"}`}>
          {k}
          {i === 2 && <span className="ml-px inline-block h-3 w-px translate-y-0.5 animate-pulse bg-accent" />}
        </span>
      ))}
    </div>
  );
}

/** 52.6 + 27.8 + 23.8 = 104.2%: the part past the 100% line is the margin. */
function Overflow() {
  const parts = [52.6, 27.8, 23.8];
  const scale = 1.25; // px per percent
  return (
    <div className="w-[136px]">
      <div className="relative flex h-3" style={{ width: 104.2 * scale }}>
        {parts.map((p, i) => (
          <span key={i} className={`h-full border-r border-surface-2 ${["bg-fg/80", "bg-muted/60", "bg-violet"][i]}`} style={{ width: p * scale }} />
        ))}
        <span className="absolute inset-y-[-3px] right-0 bg-accent" style={{ width: 4.2 * scale }} />
        <span className="absolute inset-y-[-6px] w-px bg-fg" style={{ left: 100 * scale }} />
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-subtle tabular-nums" style={{ width: 104.2 * scale }}>
        <span>0</span>
        <span>100%</span>
      </div>
    </div>
  );
}

/** Odds 1.90 as a share of a circle. */
function Donut() {
  const r = 22, c = 2 * Math.PI * r, share = 1 / 1.9;
  return (
    <svg viewBox="0 0 56 56" className="size-14" aria-hidden>
      <circle cx="28" cy="28" r={r} fill="none" stroke="var(--color-line-strong)" strokeWidth="6" />
      <circle cx="28" cy="28" r={r} fill="none" stroke="var(--color-fg)" strokeWidth="6" strokeDasharray={`${c * share} ${c}`} transform="rotate(-90 28 28)" />
      <text x="28" y="31.5" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--color-fg)">1.90</text>
    </svg>
  );
}

/** Fair 1.98 vs offered 2.06 on one scale; the yellow gap is the edge. */
function Ruler() {
  return (
    <div className="relative h-12 w-[136px]" aria-hidden>
      <span className="absolute inset-x-0 top-[22px] h-px bg-line-strong" />
      <span className="absolute top-[19px] h-[7px] rounded-sm bg-accent" style={{ left: 44, width: 48 }} />
      <span className="absolute top-0 text-[10px] text-subtle tabular-nums" style={{ left: 30 }}>1.98</span>
      <span className="absolute top-[16px] h-[13px] w-px bg-fg" style={{ left: 44 }} />
      <span className="absolute top-[16px] h-[13px] w-px bg-accent" style={{ left: 92 }} />
      <span className="absolute top-[32px] text-[10px] text-accent tabular-nums" style={{ left: 80 }}>2.06</span>
    </div>
  );
}

/** Three legs multiplied. */
function Multiply() {
  return (
    <div className="flex items-center gap-1 text-xs font-semibold tabular-nums" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span className="text-subtle">×</span>}
          <span className="rounded-md border border-line bg-surface px-1.5 py-1">1.90</span>
        </span>
      ))}
    </div>
  );
}

/** A payout slip with the tax line cut off. */
function Receipt() {
  return (
    <div className="w-[120px] rounded-md border border-line bg-surface px-3 py-1.5 text-[10px] leading-relaxed tabular-nums" aria-hidden>
      <div className="flex justify-between text-subtle">
        <span>доход</span>
        <span>15 000</span>
      </div>
      <div className="mt-0.5 flex justify-between border-t border-dashed border-line-strong pt-0.5 font-semibold text-accent">
        <span>НДФЛ 13%</span>
        <span>−1 950</span>
      </div>
    </div>
  );
}

/** Licensed books only. */
function Licensed() {
  return (
    <div className="flex items-center gap-1.5" aria-hidden>
      {["fonbet", "winline", "pari"].map((s) => (
        <BookLogo key={s} slug={s} size="sm" />
      ))}
      <span className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] text-accent">ФНС</span>
    </div>
  );
}
