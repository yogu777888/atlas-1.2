/** Editorial score out of 5: a short bar and the number. */
export function Rating({ value, big = false }: { value: number; big?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2" aria-label={`Оценка ${value.toFixed(1).replace(".", ",")} из 5`}>
      <span className="relative inline-block h-1.5 w-12 overflow-hidden rounded-full bg-line" aria-hidden>
        <span className="absolute inset-y-0 left-0 rounded-full bg-fg" style={{ width: `${(value / 5) * 100}%` }} />
      </span>
      <span className={`num font-bold ${big ? "text-2xl" : "text-lg"}`} aria-hidden>
        {value.toFixed(1)}
      </span>
    </span>
  );
}
