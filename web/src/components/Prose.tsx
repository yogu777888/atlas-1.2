import { PageHead } from "./Page";

/** Plain text page: service and legal documents. */
export function Prose({ title, crumb, href, lead, children }: { title: string; crumb: string; href: string; lead?: string; children: React.ReactNode }) {
  return (
    <div className="container-x">
      <PageHead crumbs={[{ label: crumb, href }]} title={title} lead={lead} />
      <article className="mt-8 max-w-[68ch] space-y-4 leading-relaxed text-fg-2 prose-links [&_h2]:pt-4 [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:tracking-tight [&_h2]:text-fg [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-2">
        {children}
      </article>
    </div>
  );
}
