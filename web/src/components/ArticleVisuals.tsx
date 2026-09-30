import { BookLogo } from "./BookLogo";

/**
 * One small drawing per article, shown in the cover's top-right corner. Each
 * draws the article's idea with the site's own pieces (odds cells, the
 * probability scale, the highlighter) rather than decoration.
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
    case "kak-chitat-prognoz":
      return <Chances />;
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

const cell = "num rounded-md bg-surface px-1.5 py-0.5 text-sm font-semibold ring-1 ring-line";

/** One price in four notations. */
function Formats() {
  return (
    <div className="flex items-center gap-1" aria-hidden>
      {["1.90", "9/10", "−111"].map((k) => (
        <span key={k} className={cell}>
          {k}
        </span>
      ))}
      <span className={`${cell} bg-hi ring-fg/10`}>52,6%</span>
    </div>
  );
}

/** The margin calculator's three inputs, the last one being typed in. */
export function OddsInputs() {
  return (
    <div className="flex gap-1.5" aria-hidden>
      {["1.90", "3.60", "4.20"].map((k, i) => (
        <span key={k} className={`${cell} px-2 ${i === 2 ? "ring-fg" : ""}`}>
          {k}
          {i === 2 && <span className="ml-px inline-block h-3 w-px translate-y-0.5 animate-pulse bg-fg" />}
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
    <div className="w-[136px]" aria-hidden>
      <div className="relative flex h-3" style={{ width: 104.2 * scale }}>
        {parts.map((p, i) => (
          <span key={i} className={`h-full border-r border-surface ${["bg-p4", "bg-p3", "bg-p2"][i]}`} style={{ width: p * scale }} />
        ))}
        <span className="absolute inset-y-[-3px] right-0 bg-hi ring-1 ring-fg/15" style={{ width: 4.2 * scale }} />
        <span className="absolute inset-y-[-6px] w-px bg-fg" style={{ left: 100 * scale }} />
      </div>
      <div className="num mt-2 flex justify-between text-[11px] text-subtle" style={{ width: 104.2 * scale }}>
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
      <circle cx="28" cy="28" r={r} fill="none" stroke="var(--color-p1)" strokeWidth="6" />
      <circle cx="28" cy="28" r={r} fill="none" stroke="var(--color-p4)" strokeWidth="6" strokeDasharray={`${c * share} ${c}`} transform="rotate(-90 28 28)" />
      <text x="28" y="31.5" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--color-fg)" className="num">
        1.90
      </text>
    </svg>
  );
}

/** Fair 1.98 against the offered 2.06 on one scale; the yellow gap is the edge. */
function Ruler() {
  return (
    <div className="num relative h-12 w-[136px] text-[11px]" aria-hidden>
      <span className="absolute inset-x-0 top-[22px] h-px bg-line-strong" />
      <span className="absolute top-[18px] h-[9px] rounded-sm bg-hi ring-1 ring-fg/10" style={{ left: 44, width: 48 }} />
      <span className="absolute top-0 text-subtle" style={{ left: 30 }}>
        1.98
      </span>
      <span className="absolute top-[15px] h-[15px] w-px bg-subtle" style={{ left: 44 }} />
      <span className="absolute top-[15px] h-[15px] w-[2px] bg-fg" style={{ left: 91 }} />
      <span className="absolute top-[32px] font-semibold text-fg" style={{ left: 80 }}>
        2.06
      </span>
    </div>
  );
}

/** Three legs multiplied. */
function Multiply() {
  return (
    <div className="flex items-center gap-1" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span className="text-subtle">×</span>}
          <span className={cell}>1.90</span>
        </span>
      ))}
    </div>
  );
}

/** A payout slip with the tax line on the highlighter. */
function Receipt() {
  return (
    <div className="num w-[128px] rounded-md bg-surface px-3 py-1.5 text-[12px] leading-relaxed ring-1 ring-line" aria-hidden>
      <div className="flex justify-between text-subtle">
        <span className="font-sans">выигрыш</span>
        <span>3 000</span>
      </div>
      <div className="mt-0.5 flex justify-between border-t border-dashed border-line-strong pt-0.5 font-semibold text-fg">
        <span className="bg-hi px-0.5 font-sans">НДФЛ 13%</span>
        <span>−390</span>
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
      <span className="rounded-md bg-hi px-2 py-0.5 text-[11px] font-bold text-fg ring-1 ring-fg/10">ФНС</span>
    </div>
  );
}

/** A row of the forecasts table: three chances on the green scale. */
function Chances() {
  return (
    <div className="num flex gap-[3px] text-sm font-bold" aria-hidden>
      <span className="rounded bg-p4 px-2 py-0.5 text-white">52</span>
      <span className="rounded bg-p2 px-2 py-0.5">26</span>
      <span className="rounded bg-p2 px-2 py-0.5">22</span>
    </div>
  );
}
