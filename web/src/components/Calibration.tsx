import type { CalibrationBin } from "@/lib/season";

/**
 * Promised chances against what happened. Each dot is a group of outcomes: how
 * likely the market said they were (across) and how often they came true (up).
 * Dots on the dashed diagonal mean the chances were honest.
 */
export function Calibration({ bins, className = "" }: { bins: CalibrationBin[]; className?: string }) {
  const W = 240, H = 160, L = 30, B = 22, T = 8, R = 8;
  const x = (p: number) => L + p * (W - L - R);
  const y = (p: number) => H - B - p * (H - B - T);
  const max = Math.max(...bins.map((b) => b.n));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} data-reveal className={`block h-auto w-full ${className}`} role="img" aria-label="Обещанные рынком шансы и то, как часто исходы сбывались: точки лежат возле диагонали">
      {[0, 0.5, 1].map((t) => (
        <g key={t}>
          <line x1={x(0)} x2={x(1)} y1={y(t)} y2={y(t)} stroke="var(--color-line)" />
          <text x={L - 5} y={y(t) + 3} textAnchor="end" className="num fill-subtle text-[10px]">
            {t * 100}%
          </text>
          <text x={x(t)} y={H - 6} textAnchor="middle" className="num fill-subtle text-[10px]">
            {t * 100}%
          </text>
        </g>
      ))}
      <line x1={x(0)} y1={y(0)} x2={x(1)} y2={y(1)} stroke="var(--color-line-strong)" strokeDasharray="3 3" />
      {bins.map((b, i) => (
        <circle
          key={b.from}
          className="pop"
          cx={x(b.expected)}
          cy={y(b.actual)}
          r={3 + 3 * Math.sqrt(b.n / max)}
          fill="var(--color-p5)"
          fillOpacity="0.85"
          style={{ animationDelay: `${300 + i * 70}ms` }}
        >
          <title>{`Рынок давал ${Math.round(b.expected * 100)}%, сбылось ${Math.round(b.actual * 100)}% (${b.n} исходов)`}</title>
        </circle>
      ))}
    </svg>
  );
}
