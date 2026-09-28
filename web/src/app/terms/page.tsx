import type { Metadata } from "next";
import { Prose } from "@/components/Prose";

export const metadata: Metadata = { title: "Terms of use", alternates: { canonical: "/terms" } };

export default function Page() {
  return (
    <Prose eyebrow="Legal" title="Terms of use">
      <p>
        <em>Template — have this reviewed by a lawyer before launch.</em>
      </p>
      <ul>
        <li>You must be 18 or older, and of legal gambling age where you live, to use tag.bet.</li>
        <li>tag.bet is an information service. We don&apos;t accept bets and aren&apos;t a party to any bet you place.</li>
        <li>Odds and offers change constantly and may be delayed or inaccurate. The bookmaker&apos;s bet slip is always final.</li>
        <li>Nothing on tag.bet is financial advice or a guarantee of winnings, including &quot;sure bets&quot;.</li>
        <li>It&apos;s your responsibility to check that online betting is legal where you are.</li>
      </ul>
    </Prose>
  );
}
