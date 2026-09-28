export function Rating({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-sm tabular-nums" aria-label={`Rated ${value} out of 5`}>
      <span className="relative inline-block h-1.5 w-12 overflow-hidden rounded-full bg-white/10">
        <span className="absolute inset-y-0 left-0 rounded-full bg-accent" style={{ width: `${(value / 5) * 100}%` }} />
      </span>
      {value.toFixed(1)}
    </span>
  );
}
