import type { Step } from "@/lib/whatif";

/** Running bank over the season: a line from zero, green above and red below the start. */
export function BankChart({ steps }: { steps: Step[] }) {
  if (steps.length < 2) return null;
  const W = 640, H = 180, P = 8;
  const values = [0, ...steps.map((s) => s.bank)];
  const min = Math.min(0, ...values), max = Math.max(0, ...values);
  const span = max - min || 1;
  const x = (i: number) => P + (i / (values.length - 1)) * (W - 2 * P);
  const y = (v: number) => P + ((max - v) / span) * (H - 2 * P);
  const pts = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const last = values[values.length - 1];
  const color = last >= 0 ? "var(--color-pitch)" : "var(--color-danger)";
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Банк по ходу сезона: от 0 до ${last} ₽`}>
      <line x1={P} x2={W - P} y1={y(0)} y2={y(0)} stroke="var(--color-line-strong)" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
      <polygon points={`${x(0)},${y(0)} ${pts} ${x(values.length - 1)},${y(0)}`} fill={color} opacity="0.12" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <circle cx={x(values.length - 1)} cy={y(last)} r="4" fill={color} />
    </svg>
  );
}
