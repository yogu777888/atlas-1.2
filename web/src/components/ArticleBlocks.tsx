import Link from "next/link";

/** Section heading with an anchor so the table of contents can link to it. */
export function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-24 pt-6 text-[26px] leading-tight font-extrabold tracking-[-0.025em] text-balance text-fg">
      {children}
    </h2>
  );
}

/** A formula set on its own line, the way it would be written on a whiteboard. */
export function Formula({ children, note }: { children: React.ReactNode; note?: string }) {
  return (
    <div className="rounded-[10px] bg-surface px-5 py-4 ring-1 ring-line">
      <p className="num text-xl font-semibold text-fg">{children}</p>
      {note && <p className="mt-1 text-sm text-muted">{note}</p>}
    </div>
  );
}

/** Worked example: a titled box with rows of label → value and the result on a highlighter. */
export function Example({ title, rows, result }: { title: string; rows: [string, string][]; result?: [string, string] }) {
  return (
    <div className="overflow-hidden rounded-[10px] bg-surface ring-1 ring-line">
      <p className="border-b border-line bg-surface-2 px-5 py-2.5 text-xs font-semibold text-fg-2">{title}</p>
      <dl className="divide-y divide-line">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-4 px-5 py-2.5 text-sm">
            <dt className="text-muted">{k}</dt>
            <dd className="num text-right text-base font-semibold text-fg">{v}</dd>
          </div>
        ))}
        {result && (
          <div className="flex items-baseline justify-between gap-4 px-5 py-3 text-sm">
            <dt className="font-semibold text-fg">{result[0]}</dt>
            <dd className="num rounded-[3px] bg-hi px-1.5 text-right text-lg font-bold text-fg">{result[1]}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}

/** Side remark; `tone="warn"` for risks and legal caveats. */
export function Note({ children, tone = "info" }: { children: React.ReactNode; tone?: "info" | "warn" }) {
  return <div className={`rounded-r-[10px] border-l-[3px] bg-surface px-5 py-3 text-sm leading-relaxed text-fg-2 ${tone === "warn" ? "border-loss" : "border-hi"}`}>{children}</div>;
}

/** Simple table that scrolls on its own at phone width. */
export function Table({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <div className="overflow-x-auto rounded-[10px] bg-surface ring-1 ring-line">
      <table className="w-full min-w-[420px] text-sm">
        <thead className="bg-surface-2 text-left text-xs text-subtle">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-4 py-2.5 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j} className={`px-4 py-2.5 ${j === 0 ? "font-medium text-fg" : "num text-base text-fg-2"}`}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Inline call-out to one of the calculators. */
export function TryTool({ href, title, body }: { href: string; title: string; body: string }) {
  return (
    <Link href={href} className="group flex items-center justify-between gap-4 rounded-[10px] bg-surface px-5 py-4 !no-underline ring-1 ring-line transition hover:ring-fg">
      <span>
        <span className="block font-semibold text-fg">{title}</span>
        <span className="block text-sm text-muted">{body}</span>
      </span>
      <span className="grid size-8 shrink-0 place-items-center rounded-md bg-hi font-bold text-fg transition group-hover:translate-x-0.5" aria-hidden>
        →
      </span>
    </Link>
  );
}
