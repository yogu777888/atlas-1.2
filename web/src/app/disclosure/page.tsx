import type { Metadata } from "next";
import { Prose } from "@/components/Prose";

export const metadata: Metadata = { title: "Affiliate disclosure", alternates: { canonical: "/disclosure" } };

export default function Page() {
  return (
    <Prose eyebrow="Transparency" title="How tag.bet makes money">
      <p>
        tag.bet is free to use. We&apos;re paid by some bookmakers when a new customer opens an account through a link on our site or
        app. These are called affiliate links and are marked <code>rel=&quot;sponsored&quot;</code>.
      </p>
      <h2>What commissions never change</h2>
      <ul>
        <li>The odds you see — they come straight from bookmakers.</li>
        <li>Which price is tagged as the best — that&apos;s simply the highest number.</li>
        <li>Margin and sure-bet calculations — pure maths, identical for every bookmaker.</li>
      </ul>
      <h2>What commissions can influence</h2>
      <p>
        Which offers we choose to feature on promotional placements. Our editorial rankings use the published criteria on the
        bookmakers page, and we&apos;ll always tell you about a bookmaker&apos;s downsides.
      </p>
      <p>
        We only link to operators that hold a gambling license. Availability depends on your country; we hide operators that
        don&apos;t accept customers where you are.
      </p>
    </Prose>
  );
}
