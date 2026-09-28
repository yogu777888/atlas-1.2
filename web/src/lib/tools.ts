/** Calculators: shared metadata for the hub, pages, sitemap and cross-links. */
export type Tool = {
  slug: string;
  title: string;
  short: string;
  description: string;
  cover: { figure: string; caption: string };
  article: string;
};

export const tools: Tool[] = [
  {
    slug: "marzha",
    title: "Калькулятор маржи букмекера",
    short: "Маржа",
    description: "Введите коэффициенты — получите маржу, честные шансы и честные коэффициенты без комиссии букмекера.",
    cover: { figure: "4,2%", caption: "маржа по трём коэффициентам" },
    article: "marzha-bukmekera",
  },
  {
    slug: "veroyatnost",
    title: "Конвертер коэффициентов и вероятности",
    short: "Коэффициент ↔ вероятность",
    description: "Переводит десятичные, дробные и американские коэффициенты друг в друга и в вероятность.",
    cover: { figure: "52,6%", caption: "коэффициент 1.90 в четырёх форматах" },
    article: "koefficient-v-veroyatnost",
  },
  {
    slug: "ekspress",
    title: "Калькулятор экспресса",
    short: "Экспресс",
    description: "Итоговый коэффициент, выплата и сколько маржи накапливается в экспрессе.",
    cover: { figure: "6.86", caption: "итоговый коэффициент экспресса" },
    article: "ekspress-matematika",
  },
];

export const getTool = (slug: string) => tools.find((t) => t.slug === slug);

/** Parses "1,95" and "1.95"; returns null for anything that isn't a positive number. */
export function num(s: string): number | null {
  const v = Number.parseFloat(s.replace(",", ".").trim());
  return Number.isFinite(v) && v > 0 ? v : null;
}

export const ru = (x: number, digits = 2) => x.toLocaleString("ru-RU", { minimumFractionDigits: digits, maximumFractionDigits: digits });

/** Decimal odds → fraction string, e.g. 1.9 → "9/10" (denominators up to 100). */
export function toFraction(dec: number): string {
  const x = dec - 1;
  let best = { n: Math.round(x), d: 1, err: Math.abs(x - Math.round(x)) };
  for (let d = 1; d <= 100; d++) {
    const n = Math.round(x * d);
    const err = Math.abs(x - n / d);
    if (err < best.err - 1e-9) best = { n, d, err };
    if (err < 1e-6) break;
  }
  return `${best.n}/${best.d}`;
}

export function fromFraction(s: string): number | null {
  const m = s.trim().match(/^(\d+(?:[.,]\d+)?)\s*\/\s*(\d+(?:[.,]\d+)?)$/);
  if (!m) return null;
  const a = num(m[1]), b = num(m[2]);
  return a !== null && b !== null ? a / b + 1 : null;
}

export function toAmerican(dec: number): string {
  if (dec <= 1) return "—";
  return dec >= 2 ? `+${Math.round((dec - 1) * 100)}` : `${Math.round(-100 / (dec - 1))}`;
}

export function fromAmerican(s: string): number | null {
  const v = Number.parseFloat(s.replace("−", "-").replace(",", "."));
  if (!Number.isFinite(v) || Math.abs(v) < 100) return null;
  return v > 0 ? v / 100 + 1 : 100 / -v + 1;
}
