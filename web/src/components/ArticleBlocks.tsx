import Link from "next/link";

/** Section heading with an anchor so the table of contents can link to it. */
export function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-24 pt-6 text-2xl font-semibold tracking-tight text-balance text-fg">
      {children}
    </h2>
  );
}

/** A formula set on its own line, the way it would be written on a whiteboard. */
export function Formula({ children, note }: { children: React.ReactNode; note?: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface-2 px-5 py-4">
      <p className="text-lg font-semibold tracking-tight text-fg tabular-nums">{children}</p>
      {note && <p className="mt-1 text-sm text-subtle">{note}</p>}
    </div>
  );
}

/** Worked example: a titled box with rows of label → value. */
export function Example({ title, rows, result }: { title: string; rows: [string, string][]; result?: [string, string] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <p className="border-b border-line bg-surface-2 px-5 py-3 text-xs font-medium tracking-wider text-subtle uppercase">{title}</p>
      <dl className="divide-y divide-line">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-4 px-5 py-2.5 text-sm">
            <dt className="text-muted">{k}</dt>
            <dd className="text-right font-medium text-fg tabular-nums">{v}</dd>
          </div>
        ))}
        {result && (
          <div className="flex items-baseline justify-between gap-4 bg-accent/10 px-5 py-3 text-sm">
            <dt className="font-medium text-fg">{result[0]}</dt>
            <dd className="text-right text-base font-semibold text-accent tabular-nums">{result[1]}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}

/** Side remark; `tone="warn"` for risks and legal caveats. */
export function Note({ children, tone = "info" }: { children: React.ReactNode; tone?: "info" | "warn" }) {
  return (
    <div className={`rounded-xl border-l-2 px-5 py-3 text-sm leading-relaxed ${tone === "warn" ? "border-danger/70 bg-danger/5" : "border-accent/70 bg-accent/5"}`}>
      {children}
    </div>
  );
}

/** Simple table that scrolls on its own at phone width. */
export function Table({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[420px] text-sm">
        <thead className="bg-surface-2 text-left text-xs tracking-wider text-subtle uppercase">
          <tr>{head.map((h) => <th key={h} className="px-4 py-2.5 font-medium">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-line tabular-nums">
          {rows.map((r, i) => (
            <tr key={i}>{r.map((c, j) => <td key={j} className={`px-4 py-2.5 ${j === 0 ? "text-fg" : "text-muted"}`}>{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Inline call-out to one of the calculators. */
export function TryTool({ href, title, body }: { href: string; title: string; body: string }) {
  return (
    <Link href={href} className="group flex items-center justify-between gap-4 rounded-xl border border-accent/30 !no-underline bg-accent/5 px-5 py-4 transition hover:border-accent/60">
      <span>
        <span className="block font-medium text-fg">{title}</span>
        <span className="block text-sm text-muted">{body}</span>
      </span>
      <span className="text-accent transition group-hover:translate-x-0.5">→</span>
    </Link>
  );
}
