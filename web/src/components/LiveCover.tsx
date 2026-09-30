"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { probClass } from "@/lib/matches";
import { FlipText } from "./FlipText";

const ru = (x: number, d = 1) => x.toFixed(d).replace(".", ",");
const k2 = (x: number) => x.toFixed(2);

/**
 * Each article's cover as a tiny live example: step through a few real-looking
 * lines and the drawing and the big figure change together. It plays while the
 * pointer is over the card (or, on touch screens, while the card is on screen)
 * and settles back on the article's own example.
 */
type Frame = { figure: string; caption: string; visual: React.ReactNode };

function frames(slug: string): Frame[] | null {
  switch (slug) {
    case "kak-chitat-prognoz":
      return [
        [52, 26, 22],
        [61, 23, 16],
        [44, 28, 28],
        [30, 27, 43],
        [70, 19, 11],
      ].map((p) => ({ figure: `${Math.max(...p)}%`, caption: "шанс фаворита по оценке рынка", visual: <Chances p={p} /> }));
    case "marzha-bukmekera":
      return [
        [1.9, 3.6, 4.2],
        [2.05, 3.4, 3.7],
        [1.72, 3.75, 4.9],
        [1.95, 3.3, 3.8],
        [1.5, 4.1, 6.5],
      ].map((k) => {
        const m = k.reduce((s, x) => s + 1 / x, 0) - 1;
        return { figure: `${ru(m * 100)}%`, caption: `маржа в линии ${k.map(k2).join(" · ")}`, visual: <Overflow k={k} /> };
      });
    case "valuinaya-stavka":
      return [2.06, 2.14, 1.92, 2.02, 1.88].map((k) => {
        const e = k * 0.505 - 1;
        return { figure: `${e >= 0 ? "+" : "−"}${ru(Math.abs(e * 100))}%`, caption: `перевес ставки по ${k2(k)} при шансе 50,5%`, visual: <Ruler k={k} /> };
      });
    case "koefficient-v-veroyatnost":
      return [1.9, 1.5, 2.6, 3.4, 1.25].map((k) => ({ figure: `${ru(100 / k)}%`, caption: `вероятность внутри коэффициента ${k2(k)}`, visual: <Donut k={k} /> }));
    case "ekspress-matematika":
      return [3, 1, 2, 5, 4].map((n) => ({
        figure: `${ru((Math.pow(1.0422, n) - 1) * 100)}%`,
        caption: `маржа экспресса из ${n} ${n === 1 ? "события" : "событий"} по 1.90`,
        visual: <Legs n={n} />,
      }));
    case "nalog-s-vyigrysha":
      return [3000, 12000, 1500, 40000].map((w) => ({ figure: "13%", caption: `с выигрыша ${w.toLocaleString("ru-RU")} ₽ — ${Math.round(w * 0.13).toLocaleString("ru-RU")} ₽ налога`, visual: <Receipt w={w} /> }));
    default:
      return null;
  }
}

export function LiveCover({ slug, size = "md", fallback }: { slug: string; size?: "md" | "lg"; /** The static cover, for articles without a live example */ fallback: React.ReactNode }) {
  const list = useMemo(() => frames(slug), [slug]);
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Touch screens have no hover: play while the card is mostly on screen
  useEffect(() => {
    if (!list || !ref.current || matchMedia("(hover: hover)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => setPlaying(e.intersectionRatio > 0.6), { threshold: [0, 0.6, 1] });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [list]);

  useEffect(() => {
    if (!playing || !list) {
      setI(0);
      return;
    }
    setI(1);
    const t = setInterval(() => setI((x) => (x + 1) % list.length), 1500);
    return () => clearInterval(t);
  }, [playing, list]);

  if (!list) return <>{fallback}</>;
  const f = list[i];
  const lg = size === "lg";
  return (
    <div
      ref={ref}
      onPointerEnter={(e) => e.pointerType === "mouse" && !matchMedia("(prefers-reduced-motion: reduce)").matches && setPlaying(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setPlaying(false)}
      className={`glow relative flex h-full flex-col justify-between gap-4 overflow-hidden rounded-[10px] border border-line bg-surface ${lg ? "min-h-56 p-7 sm:p-9" : "min-h-44 p-5"}`}
    >
      <div className="bg-grid absolute inset-0" aria-hidden />
      <div className="relative self-end">{f.visual}</div>
      <div className="relative">
        <p className={`num leading-none font-bold ${lg ? "text-6xl sm:text-7xl" : "text-5xl"}`} aria-label={list[0].figure}>
          <FlipText key={f.figure} text={f.figure} delay={i === 0 && !playing ? 250 : 0} />
        </p>
        <p className={`mt-2 text-muted ${lg ? "text-sm" : "line-clamp-2 text-xs"}`}>{f.caption}</p>
      </div>
    </div>
  );
}

const ease = "transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]";
const cell = "num rounded-md bg-surface px-1.5 py-0.5 text-sm font-semibold ring-1 ring-line";

function Chances({ p }: { p: number[] }) {
  return (
    <div className="num flex gap-[3px] text-sm font-bold" aria-hidden>
      {p.map((v, i) => (
        <span key={i} className={`w-8 rounded py-0.5 text-center ${ease} ${probClass(v / 100)}`}>
          {v}
        </span>
      ))}
    </div>
  );
}

/** The three implied chances side by side; the part past the 100% line is the margin. */
function Overflow({ k }: { k: number[] }) {
  const scale = 1.2;
  const parts = k.map((x) => 100 / x);
  const sum = parts.reduce((s, x) => s + x, 0);
  return (
    <div className="w-[140px]" aria-hidden>
      <div className="relative flex h-3 w-[140px]">
        {parts.map((p, i) => (
          <span key={i} className={`h-full shrink-0 border-r border-surface ${ease} ${["bg-p4", "bg-p3", "bg-p2"][i]}`} style={{ width: Math.min(p, 100) * scale }} />
        ))}
        <span className={`absolute inset-y-[-3px] bg-hi ring-1 ring-fg/15 ${ease}`} style={{ left: 100 * scale, width: Math.max(0, sum - 100) * scale }} />
        <span className="absolute inset-y-[-6px] w-px bg-fg" style={{ left: 100 * scale }} />
      </div>
      <div className="num mt-2 flex justify-between text-[11px] text-subtle" style={{ width: 100 * scale + 8 }}>
        <span>0</span>
        <span>100%</span>
      </div>
    </div>
  );
}

/** Fair 1.98 against the offered price; yellow when the offer is above fair, red when below. */
function Ruler({ k }: { k: number }) {
  const x = (v: number) => 44 + (v - 1.98) * 400;
  const above = k >= 1.98;
  return (
    <div className="num relative h-12 w-[150px] text-[11px]" aria-hidden>
      <span className="absolute inset-x-0 top-[22px] h-px bg-line-strong" />
      <span
        className={`absolute top-[18px] h-[9px] rounded-sm ring-1 ring-fg/10 ${ease} ${above ? "bg-hi" : "bg-loss/70"}`}
        style={{ left: Math.min(x(k), 44), width: Math.abs(x(k) - 44) }}
      />
      <span className="absolute top-0 text-subtle" style={{ left: 30 }}>
        1.98
      </span>
      <span className="absolute top-[15px] h-[15px] w-px bg-subtle" style={{ left: 44 }} />
      <span className={`absolute top-[15px] h-[15px] w-[2px] bg-fg ${ease}`} style={{ left: x(k) }} />
      <span className={`absolute top-[32px] font-semibold text-fg ${ease}`} style={{ left: x(k) - 12 }}>
        {k2(k)}
      </span>
    </div>
  );
}

function Donut({ k }: { k: number }) {
  return (
    <svg viewBox="0 0 56 56" className="size-14" aria-hidden>
      <circle cx="28" cy="28" r="22" fill="none" stroke="var(--color-p1)" strokeWidth="6" />
      <circle
        cx="28"
        cy="28"
        r="22"
        fill="none"
        stroke="var(--color-p4)"
        strokeWidth="6"
        pathLength={1}
        strokeDasharray={`${1 / k} 1`}
        transform="rotate(-90 28 28)"
        style={{ transition: "stroke-dasharray 0.7s cubic-bezier(0.2,0.8,0.2,1)" }}
      />
      <text x="28" y="31.5" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--color-fg)" className="num">
        {k2(k)}
      </text>
    </svg>
  );
}

function Legs({ n }: { n: number }) {
  return (
    <div className="flex h-7 items-center gap-1" aria-hidden>
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className="flex animate-rise items-center gap-1">
          {i > 0 && <span className="text-subtle">×</span>}
          <span className={cell}>1.90</span>
        </span>
      ))}
    </div>
  );
}

function Receipt({ w }: { w: number }) {
  return (
    <div className="num w-[132px] rounded-md bg-surface px-3 py-1.5 text-[12px] leading-relaxed ring-1 ring-line" aria-hidden>
      <div className="flex justify-between text-subtle">
        <span className="font-sans">выигрыш</span>
        <span>{w.toLocaleString("ru-RU")}</span>
      </div>
      <div className="mt-0.5 flex justify-between border-t border-dashed border-line-strong pt-0.5 font-semibold text-fg">
        <span className="bg-hi px-0.5 font-sans">НДФЛ 13%</span>
        <span>−{Math.round(w * 0.13).toLocaleString("ru-RU")}</span>
      </div>
    </div>
  );
}
