import Link from "next/link";
import { site } from "@/lib/site";
import { Logo } from "./Logo";

const columns = [
  { title: "Product", links: [{ href: "/odds", label: "Odds comparison" }, { href: "/odds?view=surebets", label: "Sure bets" }, { href: "/bonuses", label: "Bonuses" }, { href: "/#app", label: "iOS app" }] },
  { title: "Bookmakers", links: [{ href: "/bookmakers", label: "All reviews" }, { href: "/bookmakers/pinnacle", label: "Pinnacle" }, { href: "/bookmakers/bet365", label: "bet365" }, { href: "/bookmakers/betfair", label: "Betfair" }] },
  { title: "Company", links: [{ href: "/responsible-gambling", label: "Responsible gambling" }, { href: "/disclosure", label: "Affiliate disclosure" }, { href: "/privacy", label: "Privacy" }, { href: "/terms", label: "Terms" }] },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-muted">{site.description}</p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="mb-3 text-sm font-medium">{col.title}</p>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted transition hover:text-fg">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="container-x space-y-3 py-8 text-xs leading-relaxed text-subtle">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="rounded border border-line-strong px-1.5 py-0.5 font-mono text-[11px] text-muted">18+</span>
            <span>
              Gambling can be addictive. Please play responsibly. Free, confidential help:{" "}
              <a className="underline hover:text-fg" href="https://www.begambleaware.org" target="_blank" rel="noopener noreferrer">
                BeGambleAware.org
              </a>{" "}
              ·{" "}
              <a className="underline hover:text-fg" href="https://www.gamblingtherapy.org" target="_blank" rel="noopener noreferrer">
                GamblingTherapy.org
              </a>
            </span>
          </p>
          <p>
            tag.bet is an independent comparison service and does not accept bets. We may earn a commission when you sign up
            with a bookmaker through our links; this never changes the odds you see or how we rank prices.{" "}
            <Link href="/disclosure" className="underline hover:text-fg">
              How we make money
            </Link>
            . Offers are subject to each operator&apos;s terms and are not available in every country.
          </p>
          <p>© {new Date().getFullYear()} tag.bet</p>
        </div>
      </div>
    </footer>
  );
}
